'use client'

import { useState } from 'react'
import { markNotificationsAsRead } from '@/app/dashboard/actions'
import Link from 'next/link'

export type Notification = {
    id: string
    title: string
    message: string
    is_read: boolean
    created_at: string
    group_id?: string
}

export function NotificationsDropdown({ initialNotifications }: { initialNotifications: Notification[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState(initialNotifications)

    const unreadCount = notifications.filter(n => !n.is_read).length

    const handleToggle = async () => {
        setIsOpen(!isOpen)
        
        if (!isOpen && unreadCount > 0) {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
            await markNotificationsAsRead(unreadIds)
        }
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={handleToggle}
                style={{ position: 'relative', padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', transition: 'all 0.15s' }}
            >
                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', fontSize: '10px', fontWeight: 700, color: 'white', background: '#f43f5e', borderRadius: '50%', border: '2px solid var(--background)' }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '320px', background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 50, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)' }}>Notificaciones</h3>
                        {unreadCount > 0 && (
                            <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>{unreadCount} nuevas</span>
                        )}
                    </div>
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '13px' }}>
                                No tienes notificaciones nuevas.
                            </div>
                        ) : (
                            <div>
                                {notifications.map((notification) => {
                                    const content = (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{notification.title}</p>
                                            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{notification.message}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', opacity: 0.6, marginTop: '2px' }}>
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )

                                    return (
                                        <div key={notification.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: !notification.is_read ? 'rgba(124,58,237,0.06)' : 'transparent' }}>
                                            {notification.group_id ? (
                                                <Link
                                                    href={`/dashboard/groups/${notification.group_id}`}
                                                    style={{ display: 'block', padding: '14px 16px', textDecoration: 'none' }}
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {content}
                                                </Link>
                                            ) : (
                                                <div style={{ padding: '14px 16px' }}>{content}</div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
