'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createGroup(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect('/login?error=Sesion+no+encontrada')
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string

    // 1. Crear el grupo
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            name,
            description,
            created_by: user.id
        })
        .select()
        .single()

    if (groupError || !group) {
        redirect('/dashboard/groups/create?error=No+se+pudo+crear+el+grupo')
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
        redirect('/dashboard/groups/create?error=Grupo+creado+pero+error+al+asignar+miembro')
    }

    revalidatePath('/dashboard')
    redirect(`/dashboard/groups/${group.id}`)
}
