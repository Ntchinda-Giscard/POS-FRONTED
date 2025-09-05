import type { Transaction, TransactionItem, Customer } from "@/types/pos"

export function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function calculateTransactionTotals(items: TransactionItem[], taxRate = 0.08) {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return { subtotal, tax, total }
}

export function createTransaction(
  items: TransactionItem[],
  paymentMethod: "cash" | "card" | "digital",
  customer?: Customer,
): Transaction {
  const { subtotal, tax, total } = calculateTransactionTotals(items)

  return {
    id: generateTransactionId(),
    items: [...items],
    subtotal,
    tax,
    total,
    paymentMethod,
    customerId: customer?.id,
    customer,
    timestamp: new Date(),
    status: "pending",
  }
}
