"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Lock, Unlock, Plus, Minus, Calculator, TrendingUp, TrendingDown, Clock } from "lucide-react"

interface CashDrawerManagerProps {
  isOpen: boolean
  currentAmount: number
  openingAmount: number
  onToggle: () => void
  onAmountChange: (amount: number) => void
  onSetOpeningAmount: (amount: number) => void
  transactions: Array<{
    id: string
    type: "sale" | "refund" | "cash_in" | "cash_out"
    amount: number
    timestamp: Date
    description: string
  }>
}

export function CashDrawerManager({
  isOpen,
  currentAmount,
  openingAmount,
  onToggle,
  onAmountChange,
  onSetOpeningAmount,
  transactions,
}: CashDrawerManagerProps) {
  const [cashOperation, setCashOperation] = useState<"add" | "remove" | null>(null)
  const [operationAmount, setOperationAmount] = useState("")
  const [operationReason, setOperationReason] = useState("")

  const handleCashOperation = (type: "add" | "remove") => {
    const amount = Number.parseFloat(operationAmount)
    if (isNaN(amount) || amount <= 0) return

    const newAmount = type === "add" ? currentAmount + amount : Math.max(0, currentAmount - amount)

    onAmountChange(newAmount)

    // Reset form
    setOperationAmount("")
    setOperationReason("")
    setCashOperation(null)
  }

  const netChange = currentAmount - openingAmount
  const totalSales = transactions.filter((t) => t.type === "sale").reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Cash Drawer Status */}
      <Card className="transition-all duration-200 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cash Drawer Management
            </div>
            <Button
              variant={isOpen ? "destructive" : "default"}
              onClick={onToggle}
              className="transition-all duration-200 hover:scale-105"
            >
              {isOpen ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Close Drawer
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Open Drawer
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">${openingAmount.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Opening Amount</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">${currentAmount.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Current Amount</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className={`text-2xl font-bold ${netChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {netChange >= 0 ? "+" : ""}${netChange.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Net Change</div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Cash Operations */}
          {isOpen && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={cashOperation === "add" ? "default" : "outline"}
                  onClick={() => setCashOperation(cashOperation === "add" ? null : "add")}
                  className="flex-1 transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cash
                </Button>
                <Button
                  variant={cashOperation === "remove" ? "default" : "outline"}
                  onClick={() => setCashOperation(cashOperation === "remove" ? null : "remove")}
                  className="flex-1 transition-all duration-200 hover:scale-105"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Cash
                </Button>
              </div>

              {cashOperation && (
                <Card className="animate-in slide-in-from-top-2 duration-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={operationAmount}
                          onChange={(e) => setOperationAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reason">Reason</Label>
                        <Input
                          id="reason"
                          placeholder="Enter reason for cash operation"
                          value={operationReason}
                          onChange={(e) => setOperationReason(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCashOperation(cashOperation)}
                          disabled={!operationAmount || !operationReason}
                          className="flex-1"
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          {cashOperation === "add" ? "Add" : "Remove"} ${operationAmount || "0.00"}
                        </Button>
                        <Button variant="outline" onClick={() => setCashOperation(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Cash Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No cash activity today</div>
            ) : (
              transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg transition-all duration-200 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1 rounded-full ${
                        transaction.type === "sale"
                          ? "bg-green-100 text-green-600"
                          : transaction.type === "refund"
                            ? "bg-red-100 text-red-600"
                            : transaction.type === "cash_in"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {transaction.type === "sale" || transaction.type === "cash_in" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">{transaction.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <div
                    className={`font-medium ${
                      transaction.type === "sale" || transaction.type === "cash_in" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "sale" || transaction.type === "cash_in" ? "+" : "-"}$
                    {transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
