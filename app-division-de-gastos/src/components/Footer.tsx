import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-zinc-100">Splitar</span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="#" className="hover:text-indigo-400 transition-colors">Acerca de</Link>
            <Link href="#" className="hover:text-indigo-400 transition-colors">Términos</Link>
            <Link href="#" className="hover:text-indigo-400 transition-colors">Privacidad</Link>
          </nav>
        </div>
        <div className="mt-6 text-center text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Splitar. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
