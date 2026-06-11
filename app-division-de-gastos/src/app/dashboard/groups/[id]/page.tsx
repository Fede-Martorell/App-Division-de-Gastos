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

    // Obtener info del grupo, miembros y gastos en paralelo
    const [
        { data: group, error: groupError },
        { data: members },
        { data: expenses }
    ] = await Promise.all([
        supabase.from('groups').select('*').eq('id', id).single(),
        supabase.from('group_members').select(`
            user_id,
            role,
            profiles (
                full_name,
                cbu_alias
            )
        `).eq('group_id', id),
        supabase.from('expenses').select(`
            id,
            group_id,
            paid_by,
            description,
            amount,
            category,
            date,
            created_at,
            profiles!paid_by (
                full_name
            ),
            expense_splits (
                id,
                user_id,
                amount_owed,
                is_paid,
                paid_at
            )
        `).eq('group_id', id).order('date', { ascending: false })
    ])

    if (groupError || !group) {
        redirect('/dashboard')
    }

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

    const activities: any[] = []
    
    ;(expenses ?? []).forEach((expense: any) => {
        activities.push({
            type: 'expense_created',
            id: `exp-${expense.id}`,
            date: expense.created_at || expense.date,
            title: expense.description,
            paidBy: expense.profiles?.full_name || 'Alguien',
            amount: expense.amount,
            originalDate: expense.date,
            editLink: `/dashboard/groups/${id}/expense/${expense.id}/edit`
        })

        ;(expense.expense_splits || []).forEach((split: any) => {
            if (split.is_paid && split.paid_at) {
                const debtorName = nameById.get(split.user_id) || 'Usuario'
                activities.push({
                    type: 'split_paid',
                    id: `split-${split.id}`,
                    date: split.paid_at,
                    title: `Pago de ${debtorName}`,
                    paidBy: `Deuda de "${expense.description}"`,
                    amount: split.amount_owed,
                    originalDate: null,
                    editLink: null
                })
            }
        })
    })

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div style={{ padding: '32px' }}>
            {/* Header */}
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link
                        href="/dashboard"
                        style={{ display: 'flex', width: '42px', height: '42px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', textDecoration: 'none', color: 'var(--muted-foreground)' }}
                    >
                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <div>
                        <h1 style={{ color: 'var(--foreground)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em' }}>{group.name}</h1>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginTop: '2px' }}>{group.description || 'Sin descripción'}</p>
                    </div>
                </div>
                <Link
                    href={`/dashboard/groups/${id}/expense/create`}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontWeight: 700, fontSize: '14px', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)', textDecoration: 'none' }}
                >
                    + Agregar Gasto
                </Link>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                {/* Left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Invite Code */}
                    <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
                        <h2 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Invitar amigos</h2>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', marginBottom: '16px' }}>Compartí este código para que otros puedan unirse.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 700, letterSpacing: '0.2em', color: '#a78bfa' }}>{group.invite_code}</span>
                                <CopyButton text={group.invite_code} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', opacity: 0.5 }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                                <span style={{ padding: '0 12px', color: 'var(--muted-foreground)', fontSize: '11px', textTransform: 'uppercase' }}>o mediante enlace</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                            </div>
                            <CopyLinkButton code={group.invite_code} />
                        </div>
                    </div>

                    {/* Members */}
                    <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
                        <h2 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Miembros</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {members?.map((member: any) => (
                                <div key={member.user_id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{member.profiles?.full_name?.[0] || 'U'}</span>
                                    </div>
                                    <div style={{ overflow: 'hidden', flex: 1 }}>
                                        <p style={{ color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.profiles?.full_name || 'Usuario desconocido'}</p>
                                        <p style={{ color: 'var(--muted-foreground)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.profiles?.cbu_alias || 'Sin CBU/Alias'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Saldos pendientes */}
                    <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
                        <h2 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Saldos pendientes</h2>
                        {settlements.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', textAlign: 'center', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                <span style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</span>
                                <p style={{ color: '#10b981', fontWeight: 600, fontSize: '14px' }}>Todos los saldos están al día.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {settlements.map((s, idx) => {
                                    const fromName = nameById.get(s.from) || 'Usuario'
                                    const toName = nameById.get(s.to) || 'Usuario'
                                    const isUserDebtor = user?.id === s.from
                                    const isUserCreditor = user?.id === s.to

                                    let bgColor = 'rgba(255,255,255,0.03)'
                                    let borderColor = 'rgba(255,255,255,0.06)'
                                    let textColor = 'var(--foreground)'
                                    if (isUserCreditor) {
                                        bgColor = 'rgba(16,185,129,0.08)'
                                        borderColor = 'rgba(16,185,129,0.2)'
                                        textColor = '#10b981'
                                    } else if (isUserDebtor) {
                                        bgColor = 'rgba(244,63,94,0.08)'
                                        borderColor = 'rgba(244,63,94,0.2)'
                                        textColor = '#f43f5e'
                                    }

                                    return (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', background: bgColor, border: `1px solid ${borderColor}`, fontSize: '14px', fontWeight: 500, color: textColor }}>
                                            {isUserDebtor && <span>Le debés <strong>{formatMoney(s.amount)}</strong> a <strong>{toName}</strong></span>}
                                            {isUserCreditor && <span><strong>{fromName}</strong> te debe <strong>{formatMoney(s.amount)}</strong></span>}
                                            {!isUserDebtor && !isUserCreditor && <span><strong>{fromName}</strong> le debe <strong>{formatMoney(s.amount)}</strong> a <strong>{toName}</strong></span>}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Mis deudas detalladas */}
                    <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
                        <h2 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Mis Deudas Detalladas</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {myPendingSplits.length === 0 ? (
                                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>No tienes deudas pendientes.</p>
                            ) : (
                                myPendingSplits.map((s: any) => {
                                    const e = s.expense
                                    const isOverdue = (Date.now() - new Date(e.date).getTime()) > 3 * 24 * 60 * 60 * 1000
                                    return (
                                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '14px' }}>{e.description}</span>
                                                    {isOverdue && <span style={{ fontSize: '11px', fontWeight: 700, color: '#f43f5e', background: 'rgba(244,63,94,0.1)', padding: '2px 6px', borderRadius: '4px' }}>⚠️ Vencido</span>}
                                                </div>
                                                <p style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>Pagado por <span style={{ color: 'var(--foreground)' }}>{e.profiles?.full_name || 'Alguien'}</span> • <span style={{ color: '#f43f5e', fontWeight: 700 }}>{formatMoney(s.amount_owed)}</span></p>
                                            </div>
                                            <SettleUpButton splitId={s.id} groupId={id} />
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Movimientos del grupo */}
                    <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
                        <h2 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Movimientos del Grupo</h2>
                        {activities.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', textAlign: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                    <svg style={{ width: '24px', height: '24px', color: 'var(--muted-foreground)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <p style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>Aún no hay movimientos registrados en este grupo.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {activities.map((activity: any) => (
                                    <div key={activity.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: activity.type === 'split_paid' ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {activity.type === 'split_paid' ? (
                                                    <svg style={{ width: '16px', height: '16px', color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                ) : (
                                                    <svg style={{ width: '16px', height: '16px', color: '#a78bfa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.68 1.005" /></svg>
                                                )}
                                            </div>
                                            <div>
                                                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }}>{activity.title}</p>
                                                <p style={{ color: 'var(--muted-foreground)', fontSize: '11px', marginTop: '1px' }}>{activity.paidBy}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ color: activity.type === 'split_paid' ? '#10b981' : 'var(--foreground)', fontWeight: 700, fontSize: '14px', fontFamily: "'JetBrains Mono', monospace" }}>${activity.amount}</p>
                                                <p style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>{new Date(activity.date).toLocaleDateString()}</p>
                                            </div>
                                            {activity.editLink && (
                                                <Link href={activity.editLink} style={{ padding: '6px', borderRadius: '8px', color: 'var(--muted-foreground)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', textDecoration: 'none' }} title="Editar gasto">
                                                    <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4.5-4.5 1.5-1.5 4.5-4.5 1.5 1.5z" /></svg>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
