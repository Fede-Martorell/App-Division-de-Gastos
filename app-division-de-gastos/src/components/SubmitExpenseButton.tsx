'use client'

import { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'

export function SubmitExpenseButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {pending ? 'Guardando...' : 'Guardar Gasto'}
        </button>
    )
}
