"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { mockCustomers, mockDeliveryLocations } from "@/lib/mock-data"
import { requiresApproval } from "@/lib/sage-x3-utils"
import type { Customer, DeliveryLocation, SalesOrder, OrderItem } from "@/types/pos"
import { User, MapPin, ShoppingCart, AlertTriangle, CheckCircle, Clock, FileText, Truck } from "lucide-react"

interface OrderWorkflowProps {
  selectedCustomer: Customer | undefined
  selectedDeliveryLocation: DeliveryLocation | undefined
  onCustomerSelect: (customer: Customer) => void
  onDeliveryLocationSelect: (location: DeliveryLocation) => void
  orderItems: OrderItem[]
  onCreateOrder: () => void
  canProceed: boolean
}

export function OrderWorkflow({
  selectedCustomer,
  selectedDeliveryLocation,
  onCustomerSelect,
  onDeliveryLocationSelect,
  orderItems,
  onCreateOrder,
  canProceed,
}: OrderWorkflowProps) {
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal")

  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const discount = orderItems.reduce((sum, item) => sum + item.discount, 0)
  const tax = (subtotal - discount) * 0.08
  const total = subtotal - discount + tax

  const mockOrder: Partial<SalesOrder> = {
    items: orderItems,
    subtotal,
    tax,
    discount,
    total,
    priority,
    status: "draft",
  }

  const needsApproval = requiresApproval(mockOrder as SalesOrder)

  return (
    <div className="space-y-6">
      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Workflow de Commande Sage X3
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center gap-2 ${selectedCustomer ? "text-green-600" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedCustomer ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}
                >
                  {selectedCustomer ? <CheckCircle className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <span className="text-sm font-medium">Client</span>
              </div>
              <div className="w-8 h-0.5 bg-muted"></div>
              <div
                className={`flex items-center gap-2 ${selectedDeliveryLocation ? "text-green-600" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedDeliveryLocation ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}
                >
                  {selectedDeliveryLocation ? <CheckCircle className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                </div>
                <span className="text-sm font-medium">Site</span>
              </div>
              <div className="w-8 h-0.5 bg-muted"></div>
              <div
                className={`flex items-center gap-2 ${orderItems.length > 0 ? "text-green-600" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${orderItems.length > 0 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}
                >
                  {orderItems.length > 0 ? <CheckCircle className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                </div>
                <span className="text-sm font-medium">Produits</span>
              </div>
            </div>
          </div>

          {!selectedCustomer && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Vous devez sélectionner un client avant de pouvoir ajouter des produits à la commande.
              </AlertDescription>
            </Alert>
          )}

          {!selectedDeliveryLocation && selectedCustomer && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Vous devez sélectionner un site de livraison avant de pouvoir ajouter des produits.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Sélection Client (Obligatoire)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedCustomer?.id || ""}
            onValueChange={(value) => {
              const customer = mockCustomers.find((c) => c.id === value)
              if (customer) onCustomerSelect(customer)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un client..." />
            </SelectTrigger>
            <SelectContent>
              {mockCustomers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {customer.customerCode} • {customer.paymentTerms}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCustomer && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Code:</span> {selectedCustomer.customerCode}
                </div>
                <div>
                  <span className="font-medium">Limite crédit:</span> ${selectedCustomer.creditLimit.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Conditions:</span> {selectedCustomer.paymentTerms}
                </div>
                <div>
                  <span className="font-medium">Total achats:</span> ${selectedCustomer.totalPurchases.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Location Selection */}
      {selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Site de Livraison (Obligatoire)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedDeliveryLocation?.id || ""}
              onValueChange={(value) => {
                const location = mockDeliveryLocations.find((l) => l.id === value)
                if (location) onDeliveryLocationSelect(location)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un site de livraison..." />
              </SelectTrigger>
              <SelectContent>
                {mockDeliveryLocations
                  .filter((l) => l.isActive)
                  .map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{location.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {location.code} • {location.address}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {selectedDeliveryLocation && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Code:</span> {selectedDeliveryLocation.code}
                  </div>
                  <div>
                    <span className="font-medium">Adresse:</span> {selectedDeliveryLocation.address}
                  </div>
                  {selectedDeliveryLocation.contactPerson && (
                    <div>
                      <span className="font-medium">Contact:</span> {selectedDeliveryLocation.contactPerson}
                      {selectedDeliveryLocation.contactPhone && ` • ${selectedDeliveryLocation.contactPhone}`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      {canProceed && orderItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Résumé de la Commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priorité</label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <Badge variant="secondary" className="mt-2">
                  Brouillon
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Notes sur la commande..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Remise:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxes (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {needsApproval && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Cette commande nécessitera une approbation (montant &gt; $500 ou priorité élevée).
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={onCreateOrder}
              className="w-full"
              size="lg"
              disabled={!canProceed || orderItems.length === 0}
            >
              Créer la Commande
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
