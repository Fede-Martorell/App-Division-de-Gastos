'use client'

import { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'

export function SubmitExpenseButton() {
    const { pending } = useFormStatus()
    const [isClicked, setIsClicked] = useState(false)

    // Si pending termina (por error de validación o final de submit), reseteamos el click
    useEffect(() => {
        if (!pending) {
            setIsClicked(false)
        }
    }, [pending])

    const isDisabled = pending || isClicked

    return (
        <button
            type="submit"
            onClick={() => setIsClicked(true)}
            disabled={isDisabled}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {isDisabled ? 'Guardando...' : 'Guardar Gasto'}
        </button>
    )
}
