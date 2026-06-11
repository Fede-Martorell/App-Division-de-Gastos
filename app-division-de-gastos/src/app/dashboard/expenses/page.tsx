import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ExpensesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect('/login')

    return (
        <div style={{ padding: '32px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ color: 'var(--foreground)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em' }}>Gastos Recientes</h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginTop: '2px' }}>El historial de todos los gastos en los que participaste.</p>
            </header>

            <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg style={{ width: '24px', height: '24px', color: 'var(--muted-foreground)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.68 1.005A2.997 2.997 0 0112 8 2.997 2.997 0 017.32 7.005C8.12 6.407 9.09 6 10.12 6z" /></svg>
                </div>
                <h3 style={{ color: 'var(--foreground)', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Próximamente</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>Aquí podrás ver el historial completo de todos tus gastos consolidados a través de todos tus grupos.</p>
            </div>
        </div>
    )
}
