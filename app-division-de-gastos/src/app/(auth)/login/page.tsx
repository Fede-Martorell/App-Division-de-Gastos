import { login, signInWithGoogle, resetPassword } from '../actions'
import Link from 'next/link'
import { AuthButton } from '@/components/AuthButton'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; message?: string; forgot?: string }>
}) {
    const resolvedSearchParams = await searchParams
    const isForgot = resolvedSearchParams?.forgot === 'true'

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 animate-gradient-xy p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/40 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 z-10">
                <div className="mb-8 text-center flex flex-col items-center">
                    {/* Logo Splitar */}
                    <img
                        src="/logoSplitar.png"
                        alt="Logo Splitar"
                        className="mx-auto h-28 w-auto object-contain drop-shadow-md transition-transform hover:scale-110 duration-300"
                    />

                    {/* H1 oculto visualmente pero disponible para SEO/Accesibilidad */}
                    <h1 className="sr-only">Splitar</h1>

                    <p className="mt-6 text-sm font-medium text-zinc-500">
                        {isForgot ? 'Recuperá tu contraseña de forma segura' : 'Ingresá para gestionar tus grupos de gastos'}
                    </p>
                </div>

                {isForgot ? (
                    <form className="flex flex-col gap-5">
                        <div className="relative group">
                            <label className="mb-1.5 block text-sm font-semibold text-zinc-700 transition-colors group-focus-within:text-indigo-600" htmlFor="email">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="tu@email.com"
                                required
                                className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 outline-none text-zinc-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                            />
                        </div>

                        {resolvedSearchParams?.error && (
                            <p className="text-sm font-medium text-red-600 bg-red-50/80 border border-red-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                                {resolvedSearchParams.error}
                            </p>
                        )}
                        {resolvedSearchParams?.message && (
                            <p className="text-sm font-medium text-emerald-600 bg-emerald-50/80 border border-emerald-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                                {resolvedSearchParams.message}
                            </p>
                        )}

                        <div className="mt-4 flex flex-col gap-3">
                            <AuthButton
                                formAction={resetPassword}
                                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Enviar enlace de recuperación
                            </AuthButton>
                            <Link
                                href="/login"
                                className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-center text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300"
                            >
                                Volver al login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form className="flex flex-col gap-5">
                        <div className="relative group">
                            <label className="mb-1.5 block text-sm font-semibold text-zinc-700 transition-colors group-focus-within:text-indigo-600" htmlFor="email">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="tu@email.com"
                                required
                                className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 outline-none text-zinc-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                            />
                        </div>

                        <div className="relative group">
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-semibold text-zinc-700 transition-colors group-focus-within:text-indigo-600" htmlFor="password">
                                    Contraseña
                                </label>
                                <Link
                                    href="/login?forgot=true"
                                    className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700 hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 outline-none text-zinc-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                            />
                        </div>

                        {/* Mostrar mensaje de error si la URL lo tiene */}
                        {resolvedSearchParams?.error && (
                            <p className="text-sm font-medium text-red-600 bg-red-50/80 border border-red-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                                {resolvedSearchParams.error}
                            </p>
                        )}
                        {resolvedSearchParams?.message && (
                            <p className="text-sm font-medium text-emerald-600 bg-emerald-50/80 border border-emerald-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                                {resolvedSearchParams.message}
                            </p>
                        )}

                        <div className="mt-4 flex flex-col gap-3">
                            <AuthButton
                                formAction={login}
                                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Iniciar Sesión
                            </AuthButton>
                            <Link
                                href="/register"
                                className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-center text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300"
                            >
                                Crear una cuenta nueva
                            </Link>
                        </div>
                    </form>
                )}

                {/* Separador para Google */}
                {!isForgot && (
                    <div className="mt-8 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-zinc-200 after:mt-0.5 after:flex-1 after:border-t after:border-zinc-200">
                        <p className="mx-4 mb-0 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">O continuá con</p>
                    </div>
                )}

                {!isForgot && (
                    <form action={signInWithGoogle}>
                        <button type="submit" className="group mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
                            <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continuar con Google
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
