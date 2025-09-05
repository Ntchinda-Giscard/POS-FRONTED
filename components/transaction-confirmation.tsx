"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { Transaction } from "@/types/pos"
import { CheckCircle, CreditCard, DollarSign, Smartphone } from "lucide-react"

interface TransactionConfirmationProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  onPrintReceipt: () => void
}

export function TransactionConfirmation({
  transaction,
  isOpen,
  onClose,
  onPrintReceipt,
}: TransactionConfirmationProps) {
  if (!transaction) return null

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "cash":
        return <DollarSign className="h-4 w-4" />
      case "digital":
        return <Smartphone className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Transaction Complete
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">${transaction.total.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Transaction ID: {transaction.id}</div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{transaction.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${transaction.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${transaction.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${transaction.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span>Payment Method:</span>
            <div className="flex items-center gap-2 capitalize">
              {getPaymentIcon(transaction.paymentMethod)}
              {transaction.paymentMethod}
            </div>
          </div>

          {transaction.customer && (
            <div className="flex items-center justify-between">
              <span>Customer:</span>
              <span>{transaction.customer.name}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Time:</span>
            <span>{transaction.timestamp.toLocaleTimeString()}</span>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onPrintReceipt} variant="outline" className="flex-1 bg-transparent">
              Print Receipt
            </Button>
            <Button onClick={onClose} className="flex-1">
              New Transaction
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
