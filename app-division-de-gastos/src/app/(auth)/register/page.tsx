import { signup } from '../actions'
import { AuthButton } from '@/components/AuthButton'
import Link from 'next/link'

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const resolvedSearchParams = await searchParams

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 animate-gradient-xy p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/40 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 z-10">

                <div className="mb-8 text-center flex flex-col items-center">
                    {/* mismo logo que en el login */}
                    <img
                        src="/logoSplitar.png"
                        alt="Logo Splitar"
                        className="mx-auto h-28 w-auto object-contain drop-shadow-md transition-transform hover:scale-110 duration-300"
                    />
                    <h1 className="mt-6 text-xl font-bold text-zinc-800">Crear cuenta</h1>
                    <p className="mt-1 text-sm font-medium text-zinc-500">Ingresá tus datos para registrarte</p>
                </div>

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
                        <label className="mb-1.5 block text-sm font-semibold text-zinc-700 transition-colors group-focus-within:text-indigo-600" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 outline-none text-zinc-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                        />
                    </div>

                    {/* muestra el error si la url lo trae */}
                    {resolvedSearchParams?.error && (
                        <p className="text-sm font-medium text-red-600 bg-red-50/80 border border-red-100 p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                            {resolvedSearchParams.error}
                        </p>
                    )}

                    <AuthButton
                        formAction={signup}
                        className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Crear Cuenta
                    </AuthButton>
                </form>

                {/* link para volver al login si ya tiene cuenta */}
                <div className="mt-8 pt-6 border-t border-zinc-200/50">
                    <p className="text-center text-sm font-medium text-zinc-500">
                        ¿Ya tenés una cuenta?{' '}
                        <Link href="/login" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 hover:underline">
                            Iniciá sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
