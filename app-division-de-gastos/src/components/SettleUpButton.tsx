'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { markSplitAsPaid } from '@/app/dashboard/groups/actions'

export function SettleUpButton({ splitId, groupId }: { splitId: string; groupId: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleSettle = () => {
        setError(null)
        startTransition(async () => {
            const result = await markSplitAsPaid(splitId, groupId)

            if (!result.ok) {
                setError(result.error ?? 'Ocurrió un error inesperado al saldar la deuda.')
                return
            }

            router.refresh()
        })
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                type="button"
                onClick={handleSettle}
                disabled={isPending}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
                {isPending ? 'Saldando...' : 'Saldar'}
            </button>
            {error && (
                <p className="max-w-36 text-right text-[10px] font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    )
}
