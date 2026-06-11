import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createExpense } from '../actions'
import { SubmitExpenseButton } from '@/components/SubmitExpenseButton'

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

    const today = new Date().toISOString().split('T')[0]
    const createExpenseWithGroup = createExpense.bind(null, id)

    const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '15px', outline: 'none', boxSizing: 'border-box' as const }
    const labelStyle = { color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ maxWidth: '440px' }}>
                <h1 style={{ color: 'var(--foreground)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>Nuevo Gasto</h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '28px' }}>Registra un gasto del grupo</p>

                <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px' }}>
                    <form action={createExpenseWithGroup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={labelStyle} htmlFor="description">Descripción</label>
                            <input id="description" name="description" type="text" placeholder="Ej. Cena del sábado 🍕" required style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle} htmlFor="amount">Monto</label>
                            <input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle} htmlFor="paid_by">Pagado por</label>
                            <select id="paid_by" name="paid_by" defaultValue={user.id} required style={{ ...inputStyle, cursor: 'pointer' }}>
                                {members?.map((m: any) => (
                                    <option key={m.user_id} value={m.user_id} style={{ background: '#13131f' }}>
                                        {m.profiles?.full_name || 'Sin nombre'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle} htmlFor="date">Fecha</label>
                            <input id="date" name="date" type="date" defaultValue={today} required style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle}>Participantes en el gasto</label>
                            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', maxHeight: '200px', overflowY: 'auto' }}>
                                {members?.map((m: any) => (
                                    <label key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" name="participants" value={m.user_id} defaultChecked={true} style={{ accentColor: '#7c3aed' }} />
                                        <span style={{ color: 'var(--foreground)', fontSize: '14px' }}>{m.profiles?.full_name || 'Sin nombre'}</span>
                                    </label>
                                ))}
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: '6px' }}>Selecciona quiénes deben dividir este gasto.</p>
                        </div>

                        {error && (
                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#f43f5e', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '12px', borderRadius: '10px' }}>{error}</p>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <Link href={`/dashboard/groups/${id}`} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--muted-foreground)', textAlign: 'center', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>Cancelar</Link>
                            <SubmitExpenseButton />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
