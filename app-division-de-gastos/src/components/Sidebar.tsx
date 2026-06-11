import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/(auth)/actions'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { icon: 'groups', label: 'Grupos', href: '/dashboard' },
  { icon: 'expenses', label: 'Gastos', href: '/dashboard' },
  { icon: 'settle', label: 'Saldar', href: '/dashboard' },
  { icon: 'activity', label: 'Actividad', href: '/dashboard' },
]

function NavIcon({ type, size = 18 }: { type: string; size?: number }) {
  const s = `${size}`
  switch (type) {
    case 'dashboard':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    case 'groups':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'expenses':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
      )
    case 'settle':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      )
    case 'activity':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    case 'settings':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    case 'logout':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      )
    case 'zap':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    default:
      return null
  }
}

export async function Sidebar({ currentPath }: { currentPath?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profileName = user?.email?.split('@')[0] || 'Usuario'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (profile?.full_name) profileName = profile.full_name
  }

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'var(--sidebar)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        gap: '8px',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '8px 12px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
          }}
        >
          <NavIcon type="zap" size={18} />
        </div>
        <span style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>
          Splitar
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map(({ icon, label, href }) => {
          const isActive = currentPath === href && label === 'Dashboard'
          return (
            <Link
              key={label}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '10px',
                textDecoration: 'none',
                background: isActive ? 'var(--violet-dim)' : 'transparent',
                color: isActive ? 'var(--violet-light)' : 'var(--muted-foreground)',
                transition: 'all 0.15s ease',
                width: '100%',
                position: 'relative',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px',
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '20px',
                    borderRadius: '0 3px 3px 0',
                    background: 'var(--violet)',
                  }}
                />
              )}
              <NavIcon type={icon} size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--sidebar-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Link
          href="/dashboard/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'transparent',
            color: 'var(--muted-foreground)',
            width: '100%',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            fontWeight: 500,
            fontSize: '14px',
          }}
        >
          <NavIcon type="settings" size={18} />
          <span>Configuración</span>
        </Link>

        {/* User pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '10px',
            marginTop: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>
              {profileName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profileName}
            </div>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>Pro</div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--muted-foreground)',
                padding: '2px',
                display: 'flex',
              }}
              title="Cerrar sesión"
            >
              <NavIcon type="logout" size={14} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
