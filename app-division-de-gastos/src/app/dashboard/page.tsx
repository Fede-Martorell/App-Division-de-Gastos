import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Obtenemos el usuario actual
    const { data: { user } } = await supabase.auth.getUser()

    // Obtenemos los grupos donde el usuario es miembro
    const { data: groups, error } = await supabase
        .from('group_members')
        .select(`
            groups (
                id,
                name,
                description
            )
        `)
        .eq('user_id', user?.id)

    const userGroups = groups?.map(g => g.groups) || []

    return (
        <div className="min-h-screen bg-zinc-50 p-6">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900">Hola, {user?.email?.split('@')[0]} 👋</h1>
                        <p className="text-zinc-500">Gestiona tus gastos y cuentas con tus amigos</p>
                    </div>
                    <Link
                        href="/profile"
                        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 transition-colors"
                    >
                        Mi Perfil
                    </Link>
                </header>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Resumen Rápido */}
                    <div className="col-span-full grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-lg">
                            <p className="text-sm opacity-80">Total por cobrar</p>
                            <p className="text-2xl font-bold">$ 0.00</p>
                        </div>
                        <div className="rounded-2xl bg-zinc-800 p-6 text-white shadow-lg">
                            <p className="text-sm opacity-80">Total por pagar</p>
                            <p className="text-2xl font-bold">$ 0.00</p>
                        </div>
                        <div className="hidden rounded-2xl bg-white p-6 text-zinc-900 shadow-sm ring-1 ring-zinc-200 sm:block">
                            <p className="text-sm text-zinc-500">Grupos Activos</p>
                            <p className="text-2xl font-bold">{userGroups.length}</p>
                        </div>
                    </div>

                    {/* Lista de Grupos */}
                    <div className="col-span-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-800">Mis Grupos</h2>
                            <Link
                                href="/groups/create"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                            >
                                + Nuevo Grupo
                            </Link>
                        </div>

                        {userGroups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-zinc-100 p-4 mb-4">
                                    <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.888M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.888M7 20h-5v-2a3 3 0 015.356-1.888M7 20v-2c0-.656.126-1.283.356-1.888m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-zinc-500">Aún no tienes grupos creados.</p>
                                <Link href="/groups/create" className="mt-2 text-sm font-medium text-indigo-600 hover:underline">
                                    Crea tu primer grupo ahora
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {userGroups.map((group: any) => (
                                    <Link
                                        key={group.id}
                                        href={`/groups/${group.id}`}
                                        className="block rounded-xl border border-zinc-200 p-4 transition-all hover:border-indigo-300 hover:shadow-md"
                                    >
                                        <h3 className="font-semibold text-zinc-800">{group.name}</h3>
                                        <p className="mt-1 truncate text-sm text-zinc-500">{group.description || 'Sin descripción'}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs font-medium text-indigo-600">Ver detalles →</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
