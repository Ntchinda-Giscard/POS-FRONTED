import type { SalesOrder, OrderItem, Customer, DeliveryLocation, OrderModification } from "@/types/pos"

export function generateOrderNumber(): string {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
  const randomNum = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0")
  return `SOH-${dateStr}-${randomNum}`
}

export function createSalesOrder(
  customer: Customer,
  deliveryLocation: DeliveryLocation,
  items: OrderItem[],
  createdBy: string,
): SalesOrder {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const discount = items.reduce((sum, item) => sum + item.discount, 0)
  const tax = (subtotal - discount) * 0.08 // 8% tax
  const total = subtotal - discount + tax

  return {
    id: `order-${Date.now()}`,
    orderNumber: generateOrderNumber(),
    customerId: customer.id,
    customer,
    deliveryLocationId: deliveryLocation.id,
    deliveryLocation,
    items,
    subtotal,
    tax,
    discount,
    total,
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
    priority: "normal",
    modifications: [
      {
        id: `mod-${Date.now()}`,
        timestamp: new Date(),
        userId: createdBy,
        action: "created",
        reason: "Order created",
      },
    ],
  }
}

export function addOrderModification(
  order: SalesOrder,
  userId: string,
  action: OrderModification["action"],
  field?: string,
  oldValue?: any,
  newValue?: any,
  reason?: string,
): SalesOrder {
  const modification: OrderModification = {
    id: `mod-${Date.now()}`,
    timestamp: new Date(),
    userId,
    action,
    field,
    oldValue,
    newValue,
    reason,
  }

  return {
    ...order,
    updatedAt: new Date(),
    modifications: [...order.modifications, modification],
  }
}

export function canModifyOrder(order: SalesOrder): boolean {
  return ["draft", "pending_approval"].includes(order.status)
}

export function requiresApproval(order: SalesOrder): boolean {
  // Require approval for orders over $500 or high priority
  return order.total > 500 || order.priority === "high" || order.priority === "urgent"
}

export function getOrderStatusColor(status: SalesOrder["status"]): string {
  switch (status) {
    case "draft":
      return "text-gray-600"
    case "pending_approval":
      return "text-yellow-600"
    case "approved":
      return "text-blue-600"
    case "confirmed":
      return "text-green-600"
    case "shipped":
      return "text-purple-600"
    case "invoiced":
      return "text-emerald-600"
    case "cancelled":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

export function getOrderStatusBadge(status: SalesOrder["status"]): { variant: any; label: string } {
  switch (status) {
    case "draft":
      return { variant: "secondary", label: "Brouillon" }
    case "pending_approval":
      return { variant: "outline", label: "En attente" }
    case "approved":
      return { variant: "default", label: "Approuvée" }
    case "confirmed":
      return { variant: "default", label: "Confirmée" }
    case "shipped":
      return { variant: "default", label: "Expédiée" }
    case "invoiced":
      return { variant: "default", label: "Facturée" }
    case "cancelled":
      return { variant: "destructive", label: "Annulée" }
    default:
      return { variant: "secondary", label: status }
  }
}
