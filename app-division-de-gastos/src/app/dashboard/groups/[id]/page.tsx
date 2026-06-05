import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { calculateGroupBalances, simplifyDebts, formatMoney } from '@/lib/balances'
import { CopyButton } from '@/components/CopyButton'
import { CopyLinkButton } from '@/components/CopyLinkButton'
import { SettleUpButton } from '@/components/SettleUpButton'

export default async function GroupDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Obtener info del grupo y verificar que el usuario sea miembro
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single()

    if (groupError || !group) {
        redirect('/dashboard')
    }

    // 2. Obtener miembros del grupo con sus perfiles
    const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select(`
            user_id,
            role,
            profiles (
                full_name,
                cbu_alias
            )
        `)
        .eq('group_id', id)

    // 3. Obtener gastos del grupo y sus splits
    const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select(`
            *,
            profiles!paid_by (
                full_name
            ),
            expense_splits (
                id,
                user_id,
                amount_owed,
                is_paid
            )
        `)
        .eq('group_id', id)
        .order('date', { ascending: false })

    const memberIds = (members ?? []).map((m: any) => m.user_id)
    const nameById = new Map<string, string>(
        (members ?? []).map((m: any) => [m.user_id, m.profiles?.full_name || 'Usuario'])
    )

    // Extraer todos los splits de todos los gastos para el cálculo global
    // Incluimos paid_by de cada gasto en su split para que calculateGroupBalances
    // pueda acreditar correctamente al pagador por cada split no pagado.
    const allSplits = (expenses ?? []).flatMap((e: any) =>
        (e.expense_splits || []).map((s: any) => ({ ...s, paid_by: e.paid_by }))
    )

    const balances = calculateGroupBalances(
        (expenses ?? []).map((e: any) => ({ amount: e.amount, paid_by: e.paid_by })),
        allSplits,
        memberIds,
    )
    const settlements = simplifyDebts(balances)

    // Pre-calcular deudas pendientes del usuario para evitar lógica inválida en JSX
    const myPendingSplits = (expenses ?? []).flatMap((e: any) =>
        (e.expense_splits || [])
            .filter((s: any) => s.user_id === user?.id && !s.is_paid)
            .map((s: any) => ({ ...s, expense: e }))
    )

    return (
        <div className="min-h-screen bg-zinc-50 p-6">
            <div className="mx-auto max-w-4xl">

                {/* Header del Grupo */}
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-full bg-white shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 transition-colors"
                        >
                            <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900">{group.name}</h1>
                            <p className="text-zinc-500 text-sm">{group.description || 'Sin descripción'}</p>
                        </div>
                    </div>
                    <Link
                        href={`/dashboard/groups/${id}/expense/create`}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        + Agregar Gasto
                    </Link>
                </header>

                <div className="grid gap-6 md:grid-cols-3">

                    {/* Columna Izquierda: Miembros */}
                    <div className="col-span-1 space-y-6">
                        {/* Código de Invitación */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
                            <h2 className="mb-3 text-sm font-semibold text-zinc-800 uppercase tracking-wider">Invitar amigos</h2>
                            <p className="text-xs text-zinc-500 mb-4">
                                Compartí este código de invitación para que otros puedan unirse a este grupo.
                            </p>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                                    <span className="font-mono text-lg font-bold tracking-widest text-zinc-800">
                                        {group.invite_code}
                                    </span>
                                    <CopyButton text={group.invite_code} />
                                </div>
                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-zinc-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs">o</span>
                                    <div className="flex-grow border-t border-zinc-200"></div>
                                </div>
                                <CopyLinkButton code={group.invite_code} />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
                            <h2 className="mb-4 text-sm font-semibold text-zinc-800 uppercase tracking-wider">Miembros</h2>
                            <div className="space-y-4">
                                {members?.map((member: any) => (
                                    <div key={member.user_id} className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                            {member.profiles?.full_name?.[0] || 'U'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium text-zinc-900 truncate">
                                                {member.profiles?.full_name || 'Usuario desconocido'}
                                            </p>
                                            <p className="text-xs text-zinc-500 truncate">
                                                {member.profiles?.cbu_alias || 'Sin CBU/Alias'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Saldos + Gastos */}
                    <div className="col-span-2 space-y-6">

                        {/* Saldos pendientes */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
                            <h2 className="mb-4 text-sm font-semibold text-zinc-800 uppercase tracking-wider">Saldos pendientes</h2>

                            {settlements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <p className="text-zinc-500 text-sm">Todos los saldos están al día.</p>
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {settlements.map((s, idx) => {
                                        const fromName = nameById.get(s.from) || 'Usuario'
                                        const toName = nameById.get(s.to) || 'Usuario'
                                        const isUserDebtor = user?.id === s.from
                                        const isUserCreditor = user?.id === s.to
                                        const highlight = isUserDebtor || isUserCreditor

                                        let label: React.ReactNode
                                        if (isUserDebtor) {
                                            label = <>Le debés <span className="font-bold">{formatMoney(s.amount)}</span> a <span className="font-semibold">{toName}</span></>
                                        } else if (isUserCreditor) {
                                            label = <><span className="font-semibold">{fromName}</span> te debe <span className="font-bold">{formatMoney(s.amount)}</span></>
                                        } else {
                                            label = <><span className="font-semibold">{fromName}</span> le debe <span className="font-bold">{formatMoney(s.amount)}</span> a <span className="font-semibold">{toName}</span></>
                                        }

                                        return (
                                            <li
                                                key={idx}
                                                className={
                                                    highlight
                                                        ? `flex items-center justify-between rounded-xl p-3 text-sm ${isUserCreditor ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'}`
                                                        : 'flex items-center justify-between rounded-xl p-3 text-sm bg-zinc-50 text-zinc-700 ring-1 ring-zinc-100'
                                                }
                                            >
                                                <span>{label}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Detalle de Deudas (Para el usuario actual) */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
                            <h2 className="mb-4 text-sm font-semibold text-zinc-800 uppercase tracking-wider">Mis Deudas Detalladas</h2>
                            <div className="space-y-3">
                                {myPendingSplits.length === 0 ? (
                                    <p className="text-zinc-500 text-sm text-center py-4">No tienes deudas pendientes.</p>
                                ) : (
                                    myPendingSplits.map((s: any) => {
                                        const e = s.expense
                                        const isOverdue = (Date.now() - new Date(e.date).getTime()) > 3 * 24 * 60 * 60 * 1000
                                        return (
                                            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-zinc-900">{e.description}</span>
                                                        {isOverdue && (
                                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded ring-1 ring-red-200">
                                                                ⚠️ Vencido
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-zinc-500">
                                                        Pagado por {e.profiles?.full_name || 'Alguien'} • {formatMoney(s.amount_owed)}
                                                    </p>
                                                </div>
                                                <SettleUpButton splitId={s.id} groupId={id} />
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
                            <h2 className="mb-4 text-sm font-semibold text-zinc-800 uppercase tracking-wider">Historial de Gastos</h2>

                            {expenses?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <p className="text-zinc-500 text-sm">Aún no hay gastos registrados en este grupo.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {expenses?.map((expense: any) => (
                                        <div
                                            key={expense.id}
                                            className="group/item flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50 hover:bg-zinc-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-white ring-1 ring-zinc-200">
                                                    <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.68 1.005A2.997 2.997 0 0112 8 2.997 2.997 0 017.32 7.005C8.12 6.407 9.09 6 10.12 6z" />
                                                    </svg>
                                                </div>
                                                <div className="relative">
                                                    <p className="text-sm font-semibold text-zinc-900">{expense.description}</p>
                                                    <p className="text-xs text-zinc-500">
                                                        Pagado por <span className="font-medium">{expense.profiles?.full_name || 'Alguien'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-zinc-900">${expense.amount}</p>
                                                    <p className="text-[10px] text-zinc-400">
                                                        {new Date(expense.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/dashboard/groups/${id}/expense/${expense.id}/edit`}
                                                    className="p-2 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-white ring-1 ring-transparent hover:ring-zinc-200 transition-all"
                                                    title="Editar gasto"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4.5-4.5 1.5-1.5 4.5-4.5 1.5 1.5z" />
                                                    </svg>
                                                    <span className="sr-only">Editar</span>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
