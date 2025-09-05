"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockCustomers } from "@/lib/mock-data"
import type { Customer } from "@/types/pos"
import { User, Plus } from "lucide-react"

interface CustomerSelectorProps {
  selectedCustomer?: Customer
  onCustomerSelect: (customer: Customer | undefined) => void
}

export function CustomerSelector({ selectedCustomer, onCustomerSelect }: CustomerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" })

  const handleSelectExisting = (customerId: string) => {
    if (customerId === "none") {
      onCustomerSelect(undefined)
    } else {
      const customer = mockCustomers.find((c) => c.id === customerId)
      onCustomerSelect(customer)
    }
    setIsOpen(false)
  }

  const handleCreateNew = () => {
    if (!newCustomer.name.trim()) return

    const customer: Customer = {
      id: `customer-${Date.now()}`,
      name: newCustomer.name,
      email: newCustomer.email || undefined,
      phone: newCustomer.phone || undefined,
      totalPurchases: 0,
    }

    onCustomerSelect(customer)
    setNewCustomer({ name: "", email: "", phone: "" })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start bg-transparent">
          <User className="h-4 w-4 mr-2" />
          {selectedCustomer ? selectedCustomer.name : "Select Customer (Optional)"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Existing Customers</Label>
            <Select onValueChange={handleSelectExisting}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Customer</SelectItem>
                {mockCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <Label className="flex items-center gap-2 mb-3">
              <Plus className="h-4 w-4" />
              Add New Customer
            </Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="555-0123"
                />
              </div>
              <Button onClick={handleCreateNew} disabled={!newCustomer.name.trim()} className="w-full">
                Add Customer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
