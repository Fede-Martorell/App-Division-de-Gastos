import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ActivityPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect('/login')

    return (
        <div style={{ padding: '32px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ color: 'var(--foreground)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em' }}>Actividad</h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginTop: '2px' }}>Notificaciones y movimientos recientes de tu cuenta.</p>
            </header>

            <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg style={{ width: '24px', height: '24px', color: 'var(--muted-foreground)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                </div>
                <h3 style={{ color: 'var(--foreground)', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Próximamente</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>Podrás visualizar un feed centralizado de todas las actividades, altas de gastos y pagos saldados.</p>
            </div>
        </div>
    )
}
