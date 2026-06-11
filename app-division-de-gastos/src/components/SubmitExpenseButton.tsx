'use client'

import { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'

export function SubmitExpenseButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)' }}
        >
            {pending ? 'Guardando...' : 'Guardar Gasto'}
        </button>
    )
}
