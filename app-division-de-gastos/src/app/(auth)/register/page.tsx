// pagina de registro para poder permitir crear una cuenta nueva con email y password
// usa la server action "signup" definida en actions.ts
// despues de registrarse redirige al perfil para cargar nombre y cbu

import { signup } from '../actions'

export default function RegisterPage({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-zinc-200">
                
                <div className="mb-8 text-center">
                    {/* mismo logo que en el login */}
                    <img
                        src="/logoSplitar.png"
                        alt="Logo Splitar"
                        className="mx-auto h-16 w-auto object-contain"
                    />
                    <h1 className="mt-4 text-xl font-bold text-zinc-800">Crear cuenta</h1>
                    <p className="mt-1 text-sm text-zinc-500">Ingresa tus datos para registrarte</p>
                </div>

                <form className="flex flex-col gap-5">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="email">
                            Correo electronico
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="tu@email.com"
                            required
                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="password">
                            Contrasena
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                    </div>

                    {/* muestra el error si la url lo trae, por ejemplo */}
                    {searchParams?.error && (
                        <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md">
                            {searchParams.error}
                        </p>
                    )}

                    <button
                        formAction={signup}
                        className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                        Registrarse
                    </button>
                </form>

                {/* link para volver al login si ya tiene cuenta */}
                <p className="mt-6 text-center text-sm text-zinc-500">
                    Ya tenes cuenta?{' '}
                    <a href="/login" className="font-medium text-indigo-600 hover:underline">
                        Inicia sesion
                    </a>
                </p>
            </div>
        </div>
    )
}