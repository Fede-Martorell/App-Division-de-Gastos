import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NotificationsDropdown } from '@/components/NotificationsDropdown'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let notifications: any[] = []
  if (user) {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    notifications = data || []
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/70 backdrop-blur-xl shadow-sm transition-all">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-100">Splitar</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationsDropdown initialNotifications={notifications} />
              <Link
                href="/dashboard/profile"
                className="rounded-full bg-zinc-800/80 px-5 py-2 text-sm font-semibold text-zinc-300 shadow-sm ring-1 ring-inset ring-zinc-700/50 hover:bg-zinc-800 hover:text-indigo-400 transition-all"
              >
                Mi Perfil
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-90 transition-opacity"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
