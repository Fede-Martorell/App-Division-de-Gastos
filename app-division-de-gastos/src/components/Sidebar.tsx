import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/(auth)/actions'
import { SidebarNav, NavIcon } from '@/components/SidebarNav'


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
      <SidebarNav />

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
