'use client'

import { joinGroupWithCode } from '../actions'
import { use, useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function JoinGroupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string, code?: string }>
}) {
    const { error, code: initialCode } = use(searchParams)
    const [code, setCode] = useState(initialCode || '')
    const [isAutoJoining, setIsAutoJoining] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (initialCode && initialCode.length === 6 && !error && formRef.current) {
            setIsAutoJoining(true)
            formRef.current.requestSubmit()
        }
    }, [initialCode, error])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
        setCode(val)
    }

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ maxWidth: '440px' }}>
                <h1 style={{ color: 'var(--foreground)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>Unirse a un Grupo</h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '28px' }}>Ingresá el código de 6 caracteres que te compartieron tus amigos.</p>

                <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px' }}>
                    <form ref={formRef} action={joinGroupWithCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px', textAlign: 'center' }} htmlFor="inviteCode">Código de Invitación</label>
                            <input
                                id="inviteCode"
                                name="inviteCode"
                                type="text"
                                value={code}
                                onChange={handleInputChange}
                                placeholder="BFUHCA"
                                required
                                maxLength={6}
                                disabled={isAutoJoining}
                                style={{
                                    width: '100%', padding: '16px', textAlign: 'center',
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: '24px', fontWeight: 800,
                                    letterSpacing: '0.25em', textTransform: 'uppercase',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px', color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        {error && (
                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#f43f5e', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>{error}</p>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <Link href="/dashboard" style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--muted-foreground)', textAlign: 'center', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>Cancelar</Link>
                            <button
                                type="submit"
                                disabled={code.length !== 6 || isAutoJoining}
                                style={{
                                    flex: 2, padding: '13px', borderRadius: '12px', border: 'none',
                                    background: code.length === 6 ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.06)',
                                    color: code.length === 6 ? 'white' : 'var(--muted-foreground)',
                                    cursor: code.length === 6 ? 'pointer' : 'not-allowed',
                                    fontWeight: 700, fontSize: '15px',
                                    boxShadow: code.length === 6 ? '0 8px 24px rgba(124, 58, 237, 0.35)' : 'none',
                                    opacity: isAutoJoining ? 0.5 : 1,
                                }}
                            >
                                {isAutoJoining ? '...' : 'Unirse al Grupo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
