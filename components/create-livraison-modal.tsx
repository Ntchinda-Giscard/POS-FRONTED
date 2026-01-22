'use client'

import React from "react"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { OrderSelection } from './order-selection'
import { Loader2 } from 'lucide-react'

interface CreateLivraisonModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateLivraisonModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateLivraisonModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [siteExpedition, setSiteExpedition] = useState('')
  const [type, setType] = useState('')
  const [clientLivree, setClientLivree] = useState('')
  const [clientFacture, setClientFacture] = useState('')
  const [dateExpedition, setDateExpedition] = useState('')
  const [dateLivraison, setDateLivraison] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedArticles, setSelectedArticles] = useState<
    Array<{ articleId: string; quantity: number; totalQuantity: number }>
  >([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Replace with actual API call to your backend
      // const response = await fetch('/api/livraisons', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     siteExpedition,
      //     type,
      //     clientLivree,
      //     clientFacture,
      //     dateExpedition,
      //     dateLivraison,
      //     orderId: selectedOrderId,
      //     articles: selectedArticles,
      //   }),
      // })
      // if (!response.ok) throw new Error('Failed to create livraison')

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log('[v0] Livraison created:', {
        siteExpedition,
        type,
        clientLivree,
        clientFacture,
        dateExpedition,
        dateLivraison,
        orderId: selectedOrderId,
        articles: selectedArticles,
      })

      // Reset form
      setSiteExpedition('')
      setType('')
      setClientLivree('')
      setClientFacture('')
      setDateExpedition('')
      setDateLivraison('')
      setSelectedOrderId(null)
      setSelectedArticles([])

      onSuccess()
    } catch (error) {
      console.error('Error creating livraison:', error)
      alert('Erreur lors de la création de la livraison')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSiteExpedition('')
    setType('')
    setClientLivree('')
    setClientFacture('')
    setDateExpedition('')
    setDateLivraison('')
    setSelectedOrderId(null)
    setSelectedArticles([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle livraison</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour créer une nouvelle livraison
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Information Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Informations de livraison</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site">Site d'expédition</Label>
                <Select value={siteExpedition} onValueChange={setSiteExpedition}>
                  <SelectTrigger id="site">
                    <SelectValue placeholder="Sélectionnez un site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site-paris">Site Paris</SelectItem>
                    <SelectItem value="site-lyon">Site Lyon</SelectItem>
                    <SelectItem value="site-marseille">Site Marseille</SelectItem>
                    <SelectItem value="site-toulouse">Site Toulouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                    <SelectItem value="overnight">Overnight</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-livree">Client livré</Label>
                <Select value={clientLivree} onValueChange={setClientLivree}>
                  <SelectTrigger id="client-livree">
                    <SelectValue placeholder="Sélectionnez un client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entreprise-a">Entreprise A</SelectItem>
                    <SelectItem value="entreprise-b">Entreprise B</SelectItem>
                    <SelectItem value="entreprise-c">Entreprise C</SelectItem>
                    <SelectItem value="entreprise-d">Entreprise D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-facture">Client facturé</Label>
                <Input
                  id="client-facture"
                  placeholder="Nom du client facturé"
                  value={clientFacture}
                  onChange={(e) => setClientFacture(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-expedition">Date d'expédition</Label>
                <Input
                  id="date-expedition"
                  type="date"
                  value={dateExpedition}
                  onChange={(e) => setDateExpedition(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-livraison">Date de livraison</Label>
                <Input
                  id="date-livraison"
                  type="date"
                  value={dateLivraison}
                  onChange={(e) => setDateLivraison(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Order and Articles Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Sélection des articles</h3>
            <Card className="p-4">
              <OrderSelection
                selectedOrderId={selectedOrderId}
                onOrderChange={setSelectedOrderId}
                selectedArticles={selectedArticles}
                onArticlesChange={setSelectedArticles}
              />
            </Card>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset()
                onClose()
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Réinitialiser
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !siteExpedition ||
                !type ||
                !clientLivree ||
                !dateExpedition ||
                !dateLivraison ||
                selectedArticles.length === 0
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer la livraison
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
