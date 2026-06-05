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
        
        // If opening and there are unread notifications, mark them as read
        if (!isOpen && unreadCount > 0) {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
            
            // Llama a una Server Action para actualizarlas en la base de datos
            await markNotificationsAsRead(unreadIds)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full bg-white text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600 ring-1 ring-zinc-200 transition-colors shadow-sm"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full ring-2 ring-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                    <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-100 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-zinc-800">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-indigo-600 font-medium">{unreadCount} nuevas</span>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-zinc-500">
                                No tienes notificaciones nuevas.
                            </div>
                        ) : (
                            <ul className="divide-y divide-zinc-100">
                                {notifications.map((notification) => {
                                    const content = (
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-semibold text-zinc-900">{notification.title}</p>
                                            <p className="text-sm text-zinc-600">{notification.message}</p>
                                            <p className="text-xs text-zinc-400 mt-1">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    );

                                    return (
                                        <li key={notification.id} className={`hover:bg-zinc-50 transition-colors ${!notification.is_read ? 'bg-indigo-50/30' : ''}`}>
                                            {notification.group_id ? (
                                                <Link 
                                                    href={`/dashboard/groups/${notification.group_id}`} 
                                                    className="block p-4"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {content}
                                                </Link>
                                            ) : (
                                                <div className="p-4">{content}</div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
