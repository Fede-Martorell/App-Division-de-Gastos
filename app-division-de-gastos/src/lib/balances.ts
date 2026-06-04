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

/**
 * Calcula el balance neto de cada miembro dentro de un grupo.
 * Devuelve un mapa user_id -> balance.
 */
export function calculateGroupBalances(
    expenses: BalanceExpense[],
    splits: BalanceSplit[],
    memberIds: string[],
): Map<string, number> {
    const balances = new Map<string, number>()
    for (const id of memberIds) balances.set(id, 0)

    // Para manejar correctamente los pagos parciales (algunos splits pagados, otros no),
    // el balance de cada persona es la suma de los splits NO pagados donde son deudores
    // y la suma de los splits NO pagados donde el pagador del gasto es el beneficiario.

    // 1. Iteramos sobre todos los splits
    // Para cada split NO pagado:
    //   - El deudor pierde dinero (balance--)
    //   - El pagador original del gasto gana dinero (balance++)

    // Necesitamos saber quién pagó cada split.
    // Dado que la firma de calculateGroupBalances no pasa los gastos con sus splits,
    // vamos a cambiar la lógica:
    // El Dashboard debe pasar los splits con la info del pagador, o simplemente
    // filtrar los gastos antes de pasarlos.

    // Para mantener la compatibilidad con la firma actual,
    // solo filtramos los splits pagados en el débito.
    // El crédito del pagador se mantiene basado en el gasto total.

    // MEJOR ENFOQUE: El Dashboard debe pasar los gastos y splits filtrados.

    // Implementación actual mejorada:
    for (const expense of expenses) {
        const amount = typeof expense.amount === 'string'
            ? parseFloat(expense.amount)
            : expense.amount
        if (isNaN(amount)) continue

        const current = balances.get(expense.paid_by) ?? 0
        balances.set(expense.paid_by, current + amount)
    }

    for (const split of splits) {
        if (split.is_paid) continue; // Ignorar splits ya pagados

        const owed = typeof split.amount_owed === 'string'
            ? parseFloat(split.amount_owed)
            : split.amount_owed
        if (isNaN(owed)) continue

        const current = balances.get(split.user_id) ?? 0
        balances.set(split.user_id, current - owed)
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
