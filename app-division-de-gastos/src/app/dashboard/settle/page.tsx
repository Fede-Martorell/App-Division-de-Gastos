import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettlePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect('/login')

    return (
        <div style={{ padding: '32px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ color: 'var(--foreground)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em' }}>Saldar Deudas</h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginTop: '2px' }}>Gestiona tus balances pendientes de manera unificada.</p>
            </header>

            <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg style={{ width: '24px', height: '24px', color: 'var(--muted-foreground)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
                </div>
                <h3 style={{ color: 'var(--foreground)', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Próximamente</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>Esta sección agrupará todas tus deudas pendientes y saldos a favor para que puedas liquidarlos con un solo clic.</p>
            </div>
        </div>
    )
}
