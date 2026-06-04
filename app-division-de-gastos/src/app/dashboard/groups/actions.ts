'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createGroup(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        console.error("ERROR DE SESIÓN:", userError);
        redirect('/login?error=Sesion+no+encontrada')
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string

    // Generar un código de invitación aleatorio único de 6 caracteres (ej: "A9F3X2")
    const invite_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Solo insertar perfil si no existe — nunca sobreescribir el nombre del usuario
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: user.id,
            email: user.email,
            full_name: user.email?.split('@')[0] || 'Usuario'
        })
        .select()
        .maybeSingle()

    // Ignorar error de duplicate key (perfil ya existe) — es el comportamiento esperado
    if (profileError && profileError.code !== '23505') {
        console.error("ERROR AL ASEGURAR EL PERFIL DEL USUARIO:", profileError);
        redirect(`/dashboard/groups/create?error=${encodeURIComponent("Error al crear perfil en base de datos: " + profileError.message)}`)
    }

    // 1. Crear el grupo
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            name,
            description,
            created_by: user.id,
            invite_code
        })
        .select()
        .single()

    if (groupError || !group) {
        console.error("ERROR AL CREAR EL GRUPO EN SUPABASE:", groupError);
        const errMsg = groupError?.message || "No se pudo crear el grupo";
        redirect(`/dashboard/groups/create?error=${encodeURIComponent(errMsg)}`)
    }

    // 2. Agregar al creador como miembro del grupo
    const { error: memberError } = await supabase
        .from('group_members')
        .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'admin',
            joined_at: new Date().toISOString()
        })

    if (memberError) {
        console.error("ERROR AL ASIGNAR MIEMBRO:", memberError);
        const errMsg = memberError?.message || "Grupo creado pero error al asignar miembro";
        redirect(`/dashboard/groups/create?error=${encodeURIComponent(errMsg)}`)
    }

    revalidatePath('/dashboard')
    redirect(`/dashboard/groups/${group.id}`)
}

export async function joinGroupWithCode(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect('/login?error=Sesion+no+encontrada')
    }

    const inviteCode = (formData.get('inviteCode') as string)?.trim().toUpperCase()

    if (!inviteCode || inviteCode.length !== 6) {
        redirect('/dashboard/groups/join?error=El+codigo+debe+tener+6+caracteres')
    }

    // 1. Buscar el grupo por código de invitación
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id, name')
        .eq('invite_code', inviteCode)
        .maybeSingle()

    if (groupError || !group) {
        redirect(`/dashboard/groups/join?error=Codigo+de+invitacion+invalido`)
    }

    // Solo insertar perfil si no existe — nunca sobreescribir el nombre del usuario
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: user.id,
            email: user.email,
            full_name: user.email?.split('@')[0] || 'Usuario'
        })
        .select()
        .maybeSingle()

    // Ignorar error de duplicate key (perfil ya existe) — es el comportamiento esperado
    if (profileError && profileError.code !== '23505') {
        redirect(`/dashboard/groups/join?error=${encodeURIComponent("Error al crear perfil en base de datos: " + profileError.message)}`)
    }

    // 2. Verificar si ya es miembro
    const { data: existingMember } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .maybeSingle()

    if (existingMember) {
        // Redirigir directamente al grupo si ya pertenece a él
        redirect(`/dashboard/groups/${group.id}`)
    }

    // 3. Agregar como miembro al grupo con rol 'member'
    const { error: joinError } = await supabase
        .from('group_members')
        .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'member',
            joined_at: new Date().toISOString()
        })

    if (joinError) {
        redirect(`/dashboard/groups/join?error=${encodeURIComponent("Error al unirse al grupo: " + joinError.message)}`)
    }

    revalidatePath('/dashboard')
    redirect(`/dashboard/groups/${group.id}`)
}

export async function markSplitAsPaid(splitId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('expense_splits')
        .update({
            is_paid: true,
            paid_at: new Date().toISOString()
        })
        .eq('id', splitId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
