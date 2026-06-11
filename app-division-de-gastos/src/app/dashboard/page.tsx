import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateGroupBalances, simplifyDebts, formatMoney } from '@/lib/balances'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [profileRes, groupsRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('group_members').select(`groups (id, name, description)`).eq('user_id', user.id)
    ])

    let profile = profileRes.data
    if (profileRes.error || !profile) {
        // Solo crear perfil si no existe aún
        const insertRes = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: user.email,
                full_name: user.email?.split('@')[0] || 'Usuario'
            })
            .select('full_name')
            .maybeSingle()
        profile = insertRes.data
    }

    const userGroups = (groupsRes.data?.map(g => g.groups) || []) as any[]
    const groupIds = userGroups.map((g: any) => g?.id).filter(Boolean)

    const [{ data: allExpenses }, { data: allMembers }] = groupIds.length > 0
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
        ])
        : [{ data: [] as any[] }, { data: [] as any[] }]

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
        <div style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ color: 'var(--foreground)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
                        Hola, {profile?.full_name || user?.email?.split('@')[0]} 👋
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
                        Aquí está el resumen de tus gastos compartidos
                    </p>
                </div>
                <Link
                    href="/dashboard/groups/create"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '11px 20px', borderRadius: '12px', border: 'none',
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        color: 'white', fontWeight: 700, fontSize: '14px',
                        boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
                        textDecoration: 'none',
                    }}
                >
                    + Agregar gasto
                </Link>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                {/* Por cobrar */}
                <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        </div>
                        <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>Por cobrar</span>
                    </div>
                    <div style={{ color: '#10b981', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'JetBrains Mono', monospace" }}>{formatMoney(porCobrar)}</div>
                    <div style={{ color: 'rgba(16,185,129,0.6)', fontSize: '12px', marginTop: '4px' }}>de {userGroups.length} grupos</div>
                </div>

                {/* Por pagar */}
                <div style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(244,63,94,0.05))', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(244,63,94,0.1)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
                        </div>
                        <span style={{ color: '#f43f5e', fontSize: '13px', fontWeight: 600 }}>Por pagar</span>
                    </div>
                    <div style={{ color: '#f43f5e', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'JetBrains Mono', monospace" }}>{formatMoney(porPagar)}</div>
                    <div style={{ color: 'rgba(244,63,94,0.6)', fontSize: '12px', marginTop: '4px' }}>a {userGroups.length} grupos</div>
                </div>

                {/* Grupos activos */}
                <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 600 }}>Grupos activos</span>
                    </div>
                    <div style={{ color: 'var(--foreground)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'JetBrains Mono', monospace" }}>{userGroups.length}</div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginTop: '4px' }}>en total</div>
                </div>
            </div>

            {/* Mis Grupos */}
            <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '16px' }}>Mis grupos</h3>
                    <Link href="/dashboard/groups/create" style={{ color: 'var(--violet-light)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Ver todos →</Link>
                </div>

                {userGroups.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        </div>
                        <h3 style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>Aún no tienes grupos</h3>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', maxWidth: '280px' }}>Comienza a dividir gastos con tus amigos creando tu primer grupo.</p>
                        <Link href="/dashboard/groups/create" style={{ marginTop: '16px', color: 'var(--violet-light)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>Crear mi primer grupo →</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {userGroups.map((group: any) => {
                            const summary = groupSummaries.get(group.id)
                            const balance = (summary?.porCobrar || 0) - (summary?.porPagar || 0)
                            return (
                                <Link key={group.id} href={`/dashboard/groups/${group.id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', transition: 'all 0.15s' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, color: '#a78bfa', fontWeight: 700 }}>
                                        {group.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{group.name}</div>
                                        <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{group.description || 'Sin descripción'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: balance >= 0 ? '#10b981' : '#f43f5e', fontWeight: 700, fontSize: '15px', fontFamily: "'JetBrains Mono', monospace" }}>
                                            {balance >= 0 ? '+' : ''}{formatMoney(balance)}
                                        </div>
                                        <div style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>{balance >= 0 ? 'te deben' : 'debés'}</div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
