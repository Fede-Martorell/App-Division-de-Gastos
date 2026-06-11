import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProfile } from './actions'
import { signOut } from '@/app/(auth)/actions'

export default async function ProfilePage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const labelStyle = { color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }
    const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '15px', outline: 'none', boxSizing: 'border-box' as const }

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ maxWidth: '440px', margin: '0 auto' }}>
                <h1 style={{ color: 'var(--foreground)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>Tu Perfil</h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '28px' }}>Completa tus datos para que tus amigos puedan transferirte.</p>

                <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px' }}>
                    <form action={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={labelStyle} htmlFor="fullName">Nombre Completo</label>
                            <input id="fullName" name="fullName" type="text" placeholder="Ej. Juan Pérez" required defaultValue={profile?.full_name || ''} style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle} htmlFor="cbuAlias">CBU o Alias</label>
                            <input id="cbuAlias" name="cbuAlias" type="text" placeholder="Ej. juan.perez.casa o CBU..." required defaultValue={profile?.cbu_alias || ''} style={inputStyle} />
                        </div>

                        {error && (
                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#f43f5e', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '12px', borderRadius: '10px' }}>{error}</p>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <a href="/dashboard" style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--muted-foreground)', textAlign: 'center', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>Inicio</a>
                            <button style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '15px', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)' }}>Guardar Perfil</button>
                        </div>
                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <form action={signOut}>
                            <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: '13px', fontWeight: 500 }}>Cerrar sesión</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
