import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateGroupBalances, simplifyDebts, formatMoney } from '@/lib/balances'
import { NotificationsDropdown } from '@/components/NotificationsDropdown'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Solo crear perfil si no existe aún — nunca sobreescribir el nombre editado por el usuario
    await supabase
        .from('profiles')
        .insert({
            id: user.id,
            email: user.email,
            full_name: user.email?.split('@')[0] || 'Usuario'
        })
        .select()
        .maybeSingle()

    // Leer el nombre real del perfil (puede haber sido editado por el usuario)
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    const { data: groups } = await supabase
        .from('group_members')
        .select(`
            groups (
                id,
                name,
                description
            )
        `)
        .eq('user_id', user.id)

    const userGroups = (groups?.map(g => g.groups) || []) as any[]
    const groupIds = userGroups.map((g: any) => g?.id).filter(Boolean)

    const [{ data: allExpenses }, { data: allMembers }, { data: notifications }] = groupIds.length > 0
        ? await Promise.all([
            supabase.from('expenses').select(`
                group_id,
                amount,
                paid_by,
                expense_splits (
                    user_id,
                    amount_owed,
                    is_paid
                )
            `).in('group_id', groupIds),
            supabase.from('group_members').select('group_id, user_id').in('group_id', groupIds),
            supabase.from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20)
        ])
        : [{ data: [] as any[] }, { data: [] as any[] }, { data: [] as any[] }]

    // Agrupar miembros por grupo
    const membersByGroup = new Map<string, string[]>()
    for (const m of allMembers ?? []) {
        if (!membersByGroup.has(m.group_id)) {
            membersByGroup.set(m.group_id, [])
        }
        membersByGroup.get(m.group_id)!.push(m.user_id)
    }

    // Agrupar gastos y splits por grupo
    const expensesByGroup = new Map<string, any[]>()
    const splitsByGroup = new Map<string, any[]>()
    for (const e of allExpenses ?? []) {
        if (!expensesByGroup.has(e.group_id)) {
            expensesByGroup.set(e.group_id, [])
            splitsByGroup.set(e.group_id, [])
        }
        expensesByGroup.get(e.group_id)!.push({ amount: e.amount, paid_by: e.paid_by })
        if (e.expense_splits) {
            // Incluir paid_by en cada split para que calculateGroupBalances
            // pueda acreditar correctamente al pagador por split no pagado.
            const splitsWithPayer = (e.expense_splits as any[]).map((s: any) => ({ ...s, paid_by: e.paid_by }))
            splitsByGroup.get(e.group_id)!.push(...splitsWithPayer)
        }
    }

    let porCobrar = 0
    let porPagar = 0
    const groupSummaries = new Map<string, { porCobrar: number, porPagar: number }>()

    for (const groupId of groupIds) {
        const groupMembers = membersByGroup.get(groupId) || []
        const groupExpenses = expensesByGroup.get(groupId) || []
        const groupSplits = splitsByGroup.get(groupId) || []

        const balances = calculateGroupBalances(groupExpenses, groupSplits, groupMembers)
        const settlements = simplifyDebts(balances)

        let gCobrar = 0
        let gPagar = 0
        for (const s of settlements) {
            if (s.from === user.id) {
                gPagar += s.amount
                porPagar += s.amount
            } else if (s.to === user.id) {
                gCobrar += s.amount
                porCobrar += s.amount
            }
        }
        groupSummaries.set(groupId, { porCobrar: gCobrar, porPagar: gPagar })
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-6">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900">Hola, {profile?.full_name || user?.email?.split('@')[0]} 👋</h1>
                        <p className="text-zinc-500">Gestiona tus gastos y cuentas con tus amigos</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationsDropdown initialNotifications={notifications || []} />
                        <Link
                            href="/dashboard/profile"
                            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 transition-colors"
                        >
                            Mi Perfil
                        </Link>
                    </div>
                </header>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Resumen Rápido */}
                    <div className="col-span-full grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-lg">
                            <p className="text-sm opacity-80">Total por cobrar</p>
                            <p className="text-2xl font-bold">{formatMoney(porCobrar)}</p>
                        </div>
                        <div className="rounded-2xl bg-zinc-800 p-6 text-white shadow-lg">
                            <p className="text-sm opacity-80">Total por pagar</p>
                            <p className="text-2xl font-bold">{formatMoney(porPagar)}</p>
                        </div>
                        <div className="hidden rounded-2xl bg-white p-6 text-zinc-900 shadow-sm ring-1 ring-zinc-200 sm:block">
                            <p className="text-sm text-zinc-500">Grupos Activos</p>
                            <p className="text-2xl font-bold">{userGroups.length}</p>
                        </div>
                    </div>

                    {/* Lista de Grupos */}
                    <div className="col-span-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-800">Mis Grupos</h2>
                            <div className="flex gap-2">
                                <Link
                                    href="/dashboard/groups/join"
                                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
                                >
                                    + Unirse a Grupo
                                </Link>
                                <Link
                                    href="/dashboard/groups/create"
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    + Nuevo Grupo
                                </Link>
                            </div>
                        </div>

                        {userGroups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-zinc-100 p-4 mb-4">
                                    <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.888M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.888M7 20h-5v-2a3 3 0 015.356-1.888M7 20v-2c0-.656.126-1.283.356-1.888m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-zinc-500">Aún no tienes grupos creados.</p>
                                <Link href="/dashboard/groups/create" className="mt-2 text-sm font-medium text-indigo-600 hover:underline">
                                    Crea tu primer grupo ahora
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {userGroups.map((group: any) => {
                                    const summary = groupSummaries.get(group.id)
                                    return (
                                        <Link
                                            key={group.id}
                                            href={`/dashboard/groups/${group.id}`}
                                            className="block rounded-xl border border-zinc-200 p-4 transition-all hover:border-indigo-300 hover:shadow-md"
                                        >
                                            <h3 className="font-semibold text-zinc-800">{group.name}</h3>
                                            <p className="mt-1 truncate text-sm text-zinc-500">{group.description || 'Sin descripción'}</p>
                                            <div className="mt-4 flex items-center justify-between border-t pt-3 border-zinc-100">
                                                <span className="text-[10px] font-medium text-red-600">
                                                    Debés: {formatMoney(summary?.porPagar || 0)}
                                                </span>
                                                <span className="text-[10px] font-medium text-emerald-600">
                                                    Cobrás: {formatMoney(summary?.porCobrar || 0)}
                                                </span>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="text-xs font-medium text-indigo-600">Ver detalles →</span>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
