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

export async function markSplitAsPaid(splitId: string, groupId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { ok: false, error: 'Inicia sesion para saldar esta deuda.' }
    }

    // Verificar que el split sea del usuario actual y del grupo abierto.
    const { data: split, error: fetchError } = await supabase
        .from('expense_splits')
        .select(`
            id,
            user_id,
            is_paid,
            amount_owed,
            expenses!inner (
                group_id,
                paid_by,
                description
            )
        `)
        .eq('id', splitId)
        .eq('user_id', user.id)
        .eq('expenses.group_id', groupId)
        .maybeSingle()

    if (fetchError || !split) {
        console.error('Split no encontrado:', fetchError)
        return { ok: false, error: 'No se encontro esa deuda pendiente.' }
    }

    if (split.is_paid) {
        revalidatePath('/dashboard')
        revalidatePath(`/dashboard/groups/${groupId}`)
        return { ok: true }
    }

    const paidAt = new Date().toISOString()
    const { error, data } = await supabase
        .from('expense_splits')
        .update({
            is_paid: true,
            is_settled: true,
            paid_at: paidAt,
        })
        .eq('id', splitId)
        .eq('user_id', user.id)
        .select()
        .maybeSingle()

    if (error || !data) {
        console.error('ERROR al actualizar split:', JSON.stringify(error))
        return { ok: false, error: 'No se pudo saldar la deuda. Proba de nuevo.' }
    }

    // Insertar notificacion para el acreedor
    // Para ello averiguamos el nombre del deudor (el usuario actual)
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()

    const debtorName = profile?.full_name || 'Alguien'
    // El objeto 'expenses' devuelto en la query puede ser un array si no se tipeó explícitamente, tomamos el primer elemento o el objeto directo
    const expenseData: any = Array.isArray(split.expenses) ? split.expenses[0] : split.expenses

    if (expenseData?.paid_by && expenseData.paid_by !== user.id) {
        const { error: notifError } = await supabase.from('notifications').insert({
            user_id: expenseData.paid_by,
            group_id: groupId,
            title: 'Deuda saldada',
            message: `${debtorName} te ha pagado su parte de $${split.amount_owed} por el gasto "${expenseData.description}".`,
            is_read: false
        })
        if (notifError) console.error('Error al insertar notificacion:', notifError)
    }

    console.log('Split actualizado correctamente:', data)

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/groups/${groupId}`)
    return { ok: true }
}

// (Keep the rest of the file as it was, removing only the getSettleUpDetails function)
