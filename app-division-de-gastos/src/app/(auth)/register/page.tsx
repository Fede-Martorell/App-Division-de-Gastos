import { signup } from '../actions'
import { AuthButton } from '@/components/AuthButton'

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const resolvedSearchParams = await searchParams

    return (
        <div className="flex-1 flex items-center justify-center p-4 py-12">
            <div style={{ width: '100%', maxWidth: '440px', background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
                <div style={{ marginBottom: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src="/logoSplitar.png" alt="Logo Splitar" className="mx-auto h-16 w-auto object-contain brightness-0 invert" />
                    <h1 style={{ marginTop: '16px', color: 'var(--foreground)', fontSize: '22px', fontWeight: 700 }}>Crear cuenta</h1>
                    <p style={{ marginTop: '4px', color: 'var(--muted-foreground)', fontSize: '14px' }}>Ingresa tus datos para registrarte</p>
                </div>

                <form className="flex flex-col gap-5">
                    <div>
                        <label style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }} htmlFor="email">Correo electrónico</label>
                        <input id="email" name="email" type="email" placeholder="tu@email.com" required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                        <label style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }} htmlFor="password">Contraseña</label>
                        <input id="password" name="password" type="password" placeholder="••••••••" required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    {resolvedSearchParams?.error && (
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#f43f5e', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '12px', borderRadius: '10px' }}>{resolvedSearchParams.error}</p>
                    )}

                    <AuthButton formAction={signup} className="mt-2 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/30">
                        Registrarse
                    </AuthButton>
                </form>

                <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--muted-foreground)' }}>
                    ¿Ya tenés cuenta?{' '}
                    <a href="/login" style={{ fontWeight: 600, color: 'var(--violet-light)', textDecoration: 'none' }}>Iniciá sesión</a>
                </p>
            </div>
        </div>
    )
}
