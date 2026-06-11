'use client'

import { useState } from 'react'

export function CopyLinkButton({ code }: { code: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            const joinUrl = `${window.location.origin}/dashboard/groups/join?code=${code}`
            await navigator.clipboard.writeText(joinUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Error al copiar:', err)
        }
    }

    return (
        <button
            onClick={handleCopy}
            type="button"
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all w-full justify-center ${
                copied
                    ? 'bg-emerald-600 text-white'
                    : 'text-white hover:opacity-90'
            }`}
            style={!copied ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' } : {}}
        >
            {copied ? (
                <>
                    <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Link Copiado!
                </>
            ) : (
                <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Copiar Enlace Directo
                </>
            )}
        </button>
    )
}
