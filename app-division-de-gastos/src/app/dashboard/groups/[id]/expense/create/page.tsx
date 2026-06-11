import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createExpense } from '../actions'
import { ExpenseForm } from '@/components/ExpenseForm'

export default async function CreateExpensePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ error?: string }>
}) {
    const { id } = await params
    const { error } = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: members } = await supabase
        .from('group_members')
        .select(`
            user_id,
            profiles (
                full_name
            )
        `)
        .eq('group_id', id)

    if (!members?.some((m: any) => m.user_id === user.id)) {
        redirect('/dashboard?error=No+sos+miembro+de+ese+grupo')
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
            <ExpenseForm
                groupId={id}
                members={members || []}
                currentUser={user}
                createExpenseAction={createExpense}
            />
        </div>
    )
}
