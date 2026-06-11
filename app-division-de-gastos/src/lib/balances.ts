type BalanceExpense = {
    amount: number | string
    paid_by: string
}

type BalanceSplit = {
    user_id: string
    amount_owed: number | string
    is_paid?: boolean
}

/**
 * Calcula el balance neto del usuario basado en lo que pagó y lo que debe.
 *
 * Resultado > 0: a favor del usuario (le deben).
 * Resultado < 0: en contra (debe).
 */
export function calculateUserBalance(
    userId: string,
    expenses: BalanceExpense[],
    splits: BalanceSplit[],
): number {
    let balance = 0

    // Lo que el usuario debe (solo splits no pagados)
    for (const split of splits) {
        if (split.user_id === userId && !split.is_paid) {
            const owed = typeof split.amount_owed === 'string'
                ? parseFloat(split.amount_owed)
                : split.amount_owed
            if (!isNaN(owed)) balance -= owed
        }
    }

    // Lo que el usuario pagó (crédito)
    // NOTA: Para ser exacto, deberíamos sumar solo las partes de sus gastos que NO han sido pagadas.
    // Como esta función es un resumen global, sumamos sus gastos totales.
    for (const expense of expenses) {
        if (expense.paid_by === userId) {
            const amount = typeof expense.amount === 'string'
                ? parseFloat(expense.amount)
                : expense.amount
            if (!isNaN(amount)) balance += amount
        }
    }

    return balance
}

type BalanceSplitWithPayer = BalanceSplit & {
    paid_by?: string
}

/**
 * Calcula el balance neto de cada miembro dentro de un grupo.
 * Devuelve un mapa user_id -> balance.
 *
 * Lógica correcta:
 * - Por cada split NO pagado: el deudor (user_id) pierde esa cantidad,
 *   y el pagador original del gasto (paid_by) la gana.
 * - Si un split está pagado, no afecta a nadie: la deuda ya fue saldada.
 */
export function calculateGroupBalances(
    expenses: BalanceExpense[],
    splits: BalanceSplitWithPayer[],
    memberIds: string[],
): Map<string, number> {
    const balances = new Map<string, number>()
    for (const id of memberIds) balances.set(id, 0)

    for (const split of splits) {
        if (split.is_paid) continue // Split ya pagado: no afecta a nadie

        const owed = typeof split.amount_owed === 'string'
            ? parseFloat(split.amount_owed)
            : split.amount_owed
        if (isNaN(owed)) continue

        // El deudor pierde dinero
        const debtorBalance = balances.get(split.user_id) ?? 0
        balances.set(split.user_id, debtorBalance - owed)

        // El pagador gana dinero (solo si lo conocemos)
        if (split.paid_by) {
            const creditorBalance = balances.get(split.paid_by) ?? 0
            balances.set(split.paid_by, creditorBalance + owed)
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

export function formatMoney(value: number, currency: string = 'ARS'): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}
