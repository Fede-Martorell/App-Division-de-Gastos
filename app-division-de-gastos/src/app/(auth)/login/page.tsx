import Link from 'next/link'
import { login, signInWithGoogle, resetPassword } from '../actions'
import { AuthButton } from '@/components/AuthButton'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string, message?: string, forgot?: string }>
}) {
    const resolvedSearchParams = await searchParams
    const isForgot = resolvedSearchParams?.forgot === 'true'

    return (
        <div className="flex-1 flex items-center justify-center p-4 py-12">
            <div style={{ width: '100%', maxWidth: '440px', background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
                <div style={{ marginBottom: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src="/logoSplitar.png" alt="Logo Splitar" className="mx-auto h-50 w-100 object-contain brightness-0 invert" />
                    <h1 className="sr-only">Splitar</h1>
                    <p style={{ marginTop: '16px', color: 'var(--muted-foreground)', fontSize: '14px' }}>{isForgot ? 'Recuperá tu contraseña' : 'Ingresá para gestionar tus grupos'}</p>
                </div>

                {isForgot ? (
                    <form className="flex flex-col gap-5">
                        <div>
                            <label style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }} htmlFor="email">Correo electrónico</label>
                            <input id="email" name="email" type="email" placeholder="tu@email.com" required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        {resolvedSearchParams?.error && <p style={{ fontSize: '14px', fontWeight: 500, color: '#f43f5e', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '12px', borderRadius: '10px' }}>{resolvedSearchParams.error}</p>}
                        {resolvedSearchParams?.message && <p style={{ fontSize: '14px', fontWeight: 500, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '12px', borderRadius: '10px' }}>{resolvedSearchParams.message}</p>}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <AuthButton formAction={resetPassword} className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/30">Enviar enlace</AuthButton>
                            <Link href="/login" style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--muted-foreground)', textAlign: 'center', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>Volver</Link>
                        </div>
                    </form>
                ) : (
                    <form className="flex flex-col gap-5">
                        <div>
                            <label style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }} htmlFor="email">Correo electrónico</label>
                            <input id="email" name="email" type="email" placeholder="tu@email.com" required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <label style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }} htmlFor="password">Contraseña</label>
                            <input id="password" name="password" type="password" placeholder="••••••••" required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                            <Link href="/login?forgot=true" style={{ position: 'absolute', right: '12px', top: '0', fontSize: '12px', fontWeight: 500, color: 'var(--violet-light)', textDecoration: 'none' }}>¿Olvidaste?</Link>
                        </div>
                        {resolvedSearchParams?.error && <p style={{ fontSize: '14px', fontWeight: 500, color: '#f43f5e', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '12px', borderRadius: '10px' }}>{resolvedSearchParams.error}</p>}
                        {resolvedSearchParams?.message && <p style={{ fontSize: '14px', fontWeight: 500, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '12px', borderRadius: '10px' }}>{resolvedSearchParams.message}</p>}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <AuthButton formAction={login} className="flex-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/30">Iniciar Sesión</AuthButton>
                            <Link href="/register" style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--muted-foreground)', textAlign: 'center', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>Registrarse</Link>
                        </div>
                    </form>
                )}

                {!isForgot && (
                    <>
                        <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                            <span style={{ padding: '0 16px', color: 'var(--muted-foreground)', fontSize: '13px' }}>O continuá con</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        </div>
                        <form action={signInWithGoogle}>
                            <button type="submit" style={{ marginTop: '20px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'var(--foreground)', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.15s' }}>
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
