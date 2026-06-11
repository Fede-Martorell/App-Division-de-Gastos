'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { SubmitExpenseButton } from './SubmitExpenseButton'

type SplitType = 'equal' | 'percentage' | 'exact'

interface Member {
    user_id: string
    profiles: {
        full_name: string
    }
}

export function ExpenseForm({
    groupId,
    members,
    currentUser,
    createExpenseAction
}: {
    groupId: string,
    members: Member[],
    currentUser: any,
    createExpenseAction: any
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [splitType, setSplitType] = useState<SplitType>('equal')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [paidBy, setPaidBy] = useState(currentUser.id)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [participants, setParticipants] = useState<Record<string, number>>({})
    const [error, setError] = useState<string | null>(null)

    // Initialize participants with equal splits when amount or participants change
    useEffect(() => {
        const activeParticipants = Object.keys(participants)
        if (splitType === 'equal') {
            // No need to track individual amounts for 'equal' in the state
            // but we keep the participants record to know who is selected.
        } else if (splitType === 'percentage') {
            const share = 100 / (Object.keys(participants).length || 1)
            const newParticipants = { ...participants }
            Object.keys(newParticipants).forEach(id => {
                newParticipants[id] = Math.round(share * 100) / 100
            })
            setParticipants(newParticipants)
        } else if (splitType === 'exact') {
            const share = (parseFloat(amount) || 0) / (Object.keys(participants).length || 1)
            const newParticipants = { ...participants }
            Object.keys(newParticipants).forEach(id => {
                newParticipants[id] = Math.round(share * 100) / 100
            })
            setParticipants(newParticipants)
        }
    }, [splitType])

    const toggleParticipant = (userId: string) => {
        setParticipants(prev => {
            const next = { ...prev }
            if (next[userId] !== undefined) {
                delete next[userId]
            } else {
                // Default value based on split type
                if (splitType === 'percentage') {
                    const count = Object.keys(next).length + 1
                    const share = 100 / count
                    // Recalculate others
                    Object.keys(next).forEach(id => next[id] = Math.round(share * 100) / 100)
                    next[userId] = Math.round(share * 100) / 100
                } else if (splitType === 'exact') {
                    const share = (parseFloat(amount) || 0) / (Object.keys(next).length + 1)
                    next[userId] = Math.round(share * 100) / 100
                } else {
                    next[userId] = 1 // Marker for 'equal'
                }
            }
            return next
        })
    }

    const updateParticipantValue = (userId: string, value: number) => {
        setParticipants(prev => ({ ...prev, [userId]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const totalAmount = parseFloat(amount)
        const selectedParticipants = Object.keys(participants)

        if (!description || isNaN(totalAmount) || totalAmount <= 0 || selectedParticipants.length === 0) {
            setError('Por favor, completa todos los campos obligatorios.')
            return
        }

        // Validation for custom splits
        if (splitType === 'percentage') {
            const totalPercent = Object.values(participants).reduce((sum, val) => sum + val, 0)
            if (Math.abs(totalPercent - 100) > 0.01) {
                setError(`La suma de los porcentajes debe ser 100% (actualmente ${totalPercent.toFixed(2)}%)`)
                return
            }
        } else if (splitType === 'exact') {
            const totalExact = Object.values(participants).reduce((sum, val) => sum + val, 0)
            if (Math.abs(totalExact - totalAmount) > 0.01) {
                setError(`La suma de los montos debe ser igual al total: ${formatMoney(totalAmount)} (actualmente ${formatMoney(totalExact)})`)
                return
            }
        }

        const formData = new FormData()
        formData.append('description', description)
        formData.append('amount', amount)
        formData.append('paid_by', paidBy)
        formData.append('date', date)

        // Send participants and their specific shares
        selectedParticipants.forEach(userId => {
            formData.append('participants', userId)
            formData.append(`share_${userId}`, participants[userId].toString())
        })
        formData.append('split_type', splitType)

        startTransition(async () => {
            const result = await createExpenseAction(groupId, formData)
            if (result?.error) {
                setError(result.error)
            } else {
                router.push(`/dashboard/groups/${groupId}`)
            }
        })
    }

    function formatMoney(value: number) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(value)
    }

    return (
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-zinc-200">
            <div className="mb-8 text-center">
                <h1 className="text-xl font-bold text-zinc-800">Nuevo Gasto</h1>
                <p className="mt-1 text-sm text-zinc-500">Registra un gasto del grupo</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700">Descripción</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Ej. Cena del sábado 🍕"
                            required
                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700">Monto</label>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700">Fecha</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700">Pagado por</label>
                        <select
                            value={paidBy}
                            onChange={e => setPaidBy(e.target.value)}
                            required
                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        >
                            {members.map(m => (
                                <option key={m.user_id} value={m.user_id}>
                                    {m.profiles.full_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-700">Participantes</label>
                        <select
                            value={splitType}
                            onChange={e => setSplitType(e.target.value as SplitType)}
                            className="text-xs rounded-md border border-zinc-300 px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-600"
                        >
                            <option value="equal">Dividir equitativamente</option>
                            <option value="percentage">Por porcentaje (%)</option>
                            <option value="exact">Monto exacto</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2 border border-zinc-200 rounded-lg bg-zinc-50">
                        {members.map(m => (
                            <div
                                key={m.user_id}
                                className={`flex items-center justify-between p-2 rounded-md transition-all group ${participants[m.user_id] !== undefined ? 'bg-white shadow-sm ring-1 ring-zinc-200' : 'hover:bg-zinc-100'}`}
                            >
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={participants[m.user_id] !== undefined}
                                        onChange={() => toggleParticipant(m.user_id)}
                                        className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-zinc-700">{m.profiles.full_name}</span>
                                </label>

                                {participants[m.user_id] !== undefined && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={participants[m.user_id]}
                                            onChange={e => updateParticipantValue(m.user_id, parseFloat(e.target.value) || 0)}
                                            className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-xs text-right outline-none focus:ring-1 focus:ring-indigo-600"
                                        />
                                        <span className="text-[10px] text-zinc-400 w-5">
                                            {splitType === 'percentage' ? '%' : '$'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-zinc-400 italic">
                        {splitType === 'equal' ? 'El monto se dividirá equitativamente entre los seleccionados.' :
                         splitType === 'percentage' ? 'Asegúrate de que la suma de los porcentajes sea 100%.' :
                         'La suma de los montos debe coincidir con el total del gasto.'}
                    </p>
                </div>

                {error && (
                    <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md">
                        {error}
                    </p>
                )}

                <div className="flex gap-3 mt-2">
                    <button
                        type="button"
                        onClick={() => router.push(`/dashboard/groups/${groupId}`)}
                        className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isPending ? 'Guardando...' : 'Guardar Gasto'}
                    </button>
                </div>
            </form>
        </div>
    )
}
