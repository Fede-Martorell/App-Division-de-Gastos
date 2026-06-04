'use client'

import { useState, useTransition } from 'react'
import { markSplitAsPaid } from '@/app/dashboard/groups/actions'

export function SettleUpButton({ splitId }: { splitId: string }) {
    const [isPending, startTransition] = useTransition()

    const handleSettle = async () => {
        startTransition(async () => {
            const result = await markSplitAsPaid(splitId)
            if (!result.success) {
                alert('Error al marcar como pagado: ' + result.error)
            }
        })
    }

    return (
        <button
            onClick={handleSettle}
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
            {isPending ? 'Saldando...' : 'Saldar'}
        </button>
    )
}
