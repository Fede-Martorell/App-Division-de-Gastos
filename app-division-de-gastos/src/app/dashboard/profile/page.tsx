import { updateProfile } from './actions'

export default async function ProfilePage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-zinc-200">

                <div className="mb-8 text-center">
                    <img
                        src="/logoSplitar.png"
                        alt="Logo Splitar"
                        className="mx-auto h-16 w-auto object-contain"
                    />
                    <h1 className="mt-4 text-xl font-bold text-zinc-800">Tu Perfil</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Completa tus datos para que tus amigos puedan transferirte.
                    </p>
                </div>

                <form className="flex flex-col gap-5">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="fullName">
                            Nombre Completo
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="Ej. Juan Pérez"
                            required
                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="cbuAlias">
                            CBU o Alias
                        </label>
                        <input
                            id="cbuAlias"
                            name="cbuAlias"
                            type="text"
                            placeholder="Ej. juan.perez.casa o CBU..."
                            required
                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md">
                            {error}
                        </p>
                    )}

                    <button
                        formAction={updateProfile}
                        className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                        Guardar Perfil
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/login" className="text-sm font-medium text-zinc-500 hover:text-indigo-600 transition-colors">
                        Cerrar sesión
                    </a>
                </div>
            </div>
        </div>
    )
}
