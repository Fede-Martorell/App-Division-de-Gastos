import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GroupsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect('/login')

    const { data: myGroups } = await supabase
        .from('group_members')
        .select(`
            group_id,
            groups (
                id,
                name,
                description
            )
        `)
        .eq('user_id', user.id)

    const groups = myGroups?.map((m: any) => m.groups).filter(Boolean) || []

    return (
        <div style={{ padding: '32px' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ color: 'var(--foreground)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em' }}>Mis Grupos</h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginTop: '2px' }}>Gestiona los grupos en los que participas.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/dashboard/groups/join" style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Unirse</Link>
                    <Link href="/dashboard/groups/create" style={{ padding: '10px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: '14px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)' }}>Crear Grupo</Link>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {groups.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <svg style={{ width: '24px', height: '24px', color: 'var(--muted-foreground)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h3 style={{ color: 'var(--foreground)', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No tienes grupos</h3>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '24px' }}>Crea un grupo o únete a uno existente para empezar a dividir gastos.</p>
                    </div>
                ) : (
                    groups.map((group: any) => (
                        <Link key={group.id} href={`/dashboard/groups/${group.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', transition: 'transform 0.2s, background 0.2s' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                    <svg style={{ width: '20px', height: '20px', color: '#a78bfa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                </div>
                                <h3 style={{ color: 'var(--foreground)', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{group.name}</h3>
                                <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>{group.description || 'Sin descripción'}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
