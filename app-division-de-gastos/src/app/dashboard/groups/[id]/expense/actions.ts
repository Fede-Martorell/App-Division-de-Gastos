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
    const participants = formData.getAll('participants') as string[]

    if (!description || !paidBy || !date || isNaN(amount) || amount <= 0 || participants.length === 0) {
        redirect(`/dashboard/groups/${groupId}/expense/create?error=Datos+invalidos+o+sin+participantes`)
    }

    // 1. Insertar el gasto y obtener su ID
    const { data: expenseData, error: insertError } = await supabase
        .from('expenses')
        .insert({
            group_id: groupId,
            description,
            amount,
            paid_by: paidBy,
            date,
        })
        .select()
        .single()

    if (insertError || !expenseData) {
        redirect(`/dashboard/groups/${groupId}/expense/create?error=No+se+pudo+crear+el+gasto`)
    }

    const expenseId = expenseData.id
    const splitAmount = amount / participants.length

    // 2. Crear los splits para cada participante
    const splits = participants.map(userId => ({
        expense_id: expenseId,
        user_id: userId,
        amount_owed: splitAmount,
    }))

    const { error: splitError } = await supabase
        .from('expense_splits')
        .insert(splits)

    if (splitError) {
        redirect(`/dashboard/groups/${groupId}/expense/create?error=Error+al+calcular+divisiones`)
    }

    revalidatePath(`/dashboard/groups/${groupId}`)
    redirect(`/dashboard/groups/${groupId}`)
}

export async function updateExpense(groupId: string, expenseId: string, formData: FormData) {
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
    const participants = formData.getAll('participants') as string[]

    if (!description || !paidBy || !date || isNaN(amount) || amount <= 0 || participants.length === 0) {
        redirect(`/dashboard/groups/${groupId}/expense/${expenseId}/edit?error=Datos+invalidos+o+sin+participantes`)
    }

    // 1. Actualizar el gasto
    const { error: updateError } = await supabase
        .from('expenses')
        .update({
            description,
            amount,
            paid_by: paidBy,
            date,
        })
        .eq('id', expenseId)
        .eq('group_id', groupId)

    if (updateError) {
        redirect(`/dashboard/groups/${groupId}/expense/${expenseId}/edit?error=No+se+pudo+actualizar+el+gasto`)
    }

    // 2. Eliminar splits antiguos
    const { error: deleteError } = await supabase
        .from('expense_splits')
        .delete()
        .eq('expense_id', expenseId)

    if (deleteError) {
        redirect(`/dashboard/groups/${groupId}/expense/${expenseId}/edit?error=Error+al+limpiar+divisiones+antiguas`)
    }

    // 3. Crear nuevos splits
    const splitAmount = amount / participants.length
    const splits = participants.map(userId => ({
        expense_id: expenseId,
        user_id: userId,
        amount_owed: splitAmount,
    }))

    const { error: splitError } = await supabase
        .from('expense_splits')
        .insert(splits)

    if (splitError) {
        redirect(`/dashboard/groups/${groupId}/expense/${expenseId}/edit?error=Error+al+calcular+divisiones`)
    }

    revalidatePath(`/dashboard/groups/${groupId}`)
    revalidatePath('/dashboard')
    redirect(`/dashboard/groups/${groupId}`)
}
