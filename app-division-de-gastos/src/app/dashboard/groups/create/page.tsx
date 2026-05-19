
'use client'

import { createGroup } from '../actions'
import { use } from 'react'

export default function CreateGroupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = use(searchParams)

    const handleSubmit = async (formData: FormData) => {
        try {
            await createGroup(formData);
        } catch (err) {
            console.error("Error al ejecutar la acción:", err);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-zinc-200">

                <div className="mb-8 text-center">
                    <img
                        src="/logoSplitar.png"
                        alt="Logo Splitar"
                        className="mx-auto h-16 w-auto object-contain"
                    />
                    <h1 className="mt-4 text-xl font-bold text-zinc-800">Crear Nuevo Grupo</h1>
                    <p className="mt-1 text-sm text-zinc-500">Organiza tus gastos con amigos o familia</p>
                </div>

                <form action={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="name">
                            Nombre del Grupo
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Ej. Viaje a Mendoza 🏔️"
                            required
                            className="w-full rounded-lg border border-zinc-300 px-4 text-black py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="description">
                            Descripción (Opcional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Ej. Gastos de alojamiento, comida y combustible"
                            className="w-full rounded-lg border border-zinc-300 text-black px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            rows={3}
                        />
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 mt-2">
                        <a
                            href="/dashboard"
                            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                        >
                            Cancelar
                        </a>
                        <button
                            type="submit"
                            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                        >
                            Crear Grupo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
