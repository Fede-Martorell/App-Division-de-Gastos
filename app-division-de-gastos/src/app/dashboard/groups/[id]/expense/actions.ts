'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createExpense(groupId: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect('/login?error=Sesion+no+encontrada')
    }

    const { data: membership } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle()

    if (!membership) {
        redirect('/dashboard?error=No+sos+miembro+de+ese+grupo')
    }

    const description = (formData.get('description') as string)?.trim()
    const amountRaw = formData.get('amount') as string
    const amount = parseFloat(amountRaw)
    const paidBy = formData.get('paid_by') as string
    const date = formData.get('date') as string

    if (!description || !paidBy || !date || isNaN(amount) || amount <= 0) {
        redirect(`/dashboard/groups/${groupId}/expense/create?error=Datos+invalidos`)
    }

    const { error: insertError } = await supabase
        .from('expenses')
        .insert({
            group_id: groupId,
            description,
            amount,
            paid_by: paidBy,
            date,
        })

    if (insertError) {
        redirect(`/dashboard/groups/${groupId}/expense/create?error=No+se+pudo+crear+el+gasto`)
    }

    revalidatePath(`/dashboard/groups/${groupId}`)
    redirect(`/dashboard/groups/${groupId}`)
}
