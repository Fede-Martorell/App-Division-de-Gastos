type BalanceExpense = {
    amount: number | string
    paid_by: string
    group_id: string
}

type BalanceMember = {
    group_id: string
    user_id: string
}

/**
 * Calcula el balance neto del usuario asumiendo split equitativo:
 * por cada gasto de monto A en un grupo con N miembros, cada miembro debe A/N.
 *
 * Resultado > 0: a favor del usuario (le deben).
 * Resultado < 0: en contra (debe).
 */
export function calculateUserBalance(
    userId: string,
    expenses: BalanceExpense[],
    members: BalanceMember[],
): number {
    const membersByGroup = new Map<string, Set<string>>()
    for (const m of members) {
        if (!membersByGroup.has(m.group_id)) {
            membersByGroup.set(m.group_id, new Set())
        }
        membersByGroup.get(m.group_id)!.add(m.user_id)
    }

    let balance = 0
    for (const expense of expenses) {
        const groupMembers = membersByGroup.get(expense.group_id)
        if (!groupMembers || groupMembers.size === 0) continue
        if (!groupMembers.has(userId)) continue

        const amount = typeof expense.amount === 'string'
            ? parseFloat(expense.amount)
            : expense.amount
        if (isNaN(amount)) continue

        const share = amount / groupMembers.size

        if (expense.paid_by === userId) {
            balance += amount - share
        } else {
            balance -= share
        }
    }

    return balance
}

/**
 * Calcula el balance neto de cada miembro dentro de un grupo (split equitativo).
 * Devuelve un mapa user_id -> balance.
 */
export function calculateGroupBalances(
    expenses: BalanceExpense[],
    memberIds: string[],
): Map<string, number> {
    const balances = new Map<string, number>()
    for (const id of memberIds) balances.set(id, 0)

    const N = memberIds.length
    if (N === 0) return balances

    for (const expense of expenses) {
        const amount = typeof expense.amount === 'string'
            ? parseFloat(expense.amount)
            : expense.amount
        if (isNaN(amount)) continue

        const share = amount / N
        for (const id of memberIds) {
            const current = balances.get(id) ?? 0
            if (id === expense.paid_by) {
                balances.set(id, current + amount - share)
            } else {
                balances.set(id, current - share)
            }
        }
    }

    return balances
}

export type Settlement = { from: string; to: string; amount: number }

/**
 * Recibe los balances netos por miembro y devuelve la lista mínima de
 * transferencias para saldar todas las deudas (algoritmo greedy: empareja
 * al mayor deudor con el mayor acreedor hasta agotarlos).
 */
export function simplifyDebts(balances: Map<string, number>): Settlement[] {
    const EPSILON = 0.01
    const creditors: Array<{ id: string; amount: number }> = []
    const debtors: Array<{ id: string; amount: number }> = []

    for (const [id, bal] of balances) {
        if (bal > EPSILON) creditors.push({ id, amount: bal })
        else if (bal < -EPSILON) debtors.push({ id, amount: -bal })
    }

    creditors.sort((a, b) => b.amount - a.amount)
    debtors.sort((a, b) => b.amount - a.amount)

    const settlements: Settlement[] = []
    let i = 0
    let j = 0
    while (i < debtors.length && j < creditors.length) {
        const pay = Math.min(debtors[i].amount, creditors[j].amount)
        settlements.push({ from: debtors[i].id, to: creditors[j].id, amount: pay })
        debtors[i].amount -= pay
        creditors[j].amount -= pay
        if (debtors[i].amount < EPSILON) i++
        if (creditors[j].amount < EPSILON) j++
    }

    return settlements
}

export function formatMoney(value: number): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}
