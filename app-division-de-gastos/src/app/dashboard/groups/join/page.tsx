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
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-zinc-200">
                <div className="mb-8 text-center flex flex-col items-center">
                    <img
                        src="/logoSplitar.png"
                        alt="Logo Splitar"
                        className="mx-auto h-16 w-auto object-contain mb-4"
                    />
                    <h1 className="text-2xl font-bold text-zinc-800">Unirse a un Grupo</h1>
                    <p className="mt-2 text-sm text-zinc-500 max-w-xs">
                        Ingresá el código de 6 caracteres que te compartieron tus amigos.
                    </p>
                </div>

                <form ref={formRef} action={joinGroupWithCode} className="flex flex-col gap-6">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-700 text-center" htmlFor="inviteCode">
                            Código de Invitación
                        </label>
                        <input
                            id="inviteCode"
                            name="inviteCode"
                            type="text"
                            value={code}
                            onChange={handleInputChange}
                            placeholder="Ejemplo: BFUHCA"
                            required
                            maxLength={6}
                            disabled={isAutoJoining}
                            className="w-full rounded-xl border border-zinc-300 px-4 py-4 text-center font-mono text-2xl font-extrabold tracking-widest text-black outline-none placeholder:text-zinc-300 placeholder:font-sans focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all uppercase disabled:opacity-50"
                        />
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 mt-2">
                        <Link
                            href="/dashboard"
                            className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 shadow-sm"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={code.length !== 6 || isAutoJoining}
                            className="flex-1 flex justify-center items-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-100 hover:shadow-md"
                        >
                            {isAutoJoining ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                "Unirse al Grupo"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
