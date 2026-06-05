import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateExpense } from '../../actions'

export default async function EditExpensePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string, expenseId: string }>
    searchParams: Promise<{ error?: string }>
}) {
    const { id: groupId, expenseId } = await params
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
        .eq('group_id', groupId)

    if (!members?.some((m: any) => m.user_id === user.id)) {
        redirect('/dashboard?error=No+sos+miembro+de+ese+grupo')
    }

    // Obtener datos actuales del gasto
    const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .eq('group_id', groupId)
        .single()

    if (expenseError || !expense) {
        redirect('/dashboard?error=Gasto+no+encontrado')
    }

    // Obtener participantes actuales del gasto
    const { data: currentSplits } = await supabase
        .from('expense_splits')
        .select('user_id')
        .eq('expense_id', expenseId)

    const currentParticipantIds = (currentSplits || []).map((s: any) => s.user_id)

    const updateExpenseWithParams = updateExpense.bind(null, groupId, expenseId)

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-zinc-200">

                <div className="mb-8 text-center">
                    <h1 className="text-xl font-bold text-zinc-800">Editar Gasto</h1>
                    <p className="mt-1 text-sm text-zinc-500">Modifica los detalles y participantes</p>
                </div>

                <form action={updateExpenseWithParams} className="flex flex-col gap-5">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="description">
                            Descripción
                        </label>
                        <input
                            id="description"
                            name="description"
                            type="text"
                            defaultValue={expense.description}
                            placeholder="Ej. Cena del sábado 🍕"
                            required
                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="amount">
                            Monto
                        </label>
                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            defaultValue={expense.amount}
                            placeholder="0.00"
                            required
                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="paid_by">
                            Pagado por
                        </label>
                        <select
                            id="paid_by"
                            name="paid_by"
                            defaultValue={expense.paid_by}
                            required
                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        >
                            {members?.map((m: any) => (
                                <option key={m.user_id} value={m.user_id}>
                                    {m.profiles?.full_name || 'Sin nombre'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="date">
                            Fecha
                        </label>
                        <input
                            id="date"
                            name="date"
                            type="date"
                            defaultValue={expense.date}
                            required
                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-zinc-700">
                            Participantes en el gasto
                        </label>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2 border border-zinc-200 rounded-lg bg-zinc-50">
                            {members?.map((m: any) => (
                                <label key={m.user_id} className="flex items-center gap-3 p-2 rounded-md hover:bg-white hover:shadow-sm cursor-pointer transition-all group">
                                    <input
                                        type="checkbox"
                                        name="participants"
                                        value={m.user_id}
                                        defaultChecked={currentParticipantIds.includes(m.user_id)}
                                        className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-zinc-700 group-hover:text-zinc-900">
                                        {m.profiles?.full_name || 'Sin nombre'}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <p className="text-[10px] text-zinc-400 italic">
                            Puedes agregar o quitar personas para recalcular el gasto.
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 mt-2">
                        <Link
                            href={`/dashboard/groups/${groupId}`}
                            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                        >
                            Actualizar Gasto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
