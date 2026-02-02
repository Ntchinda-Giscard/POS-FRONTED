'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { fetchLivraisonTypes, fetchAdresseExpedition, fetchClients } from '@/lib/api'
import useSiteVenteStore from "@/stores/site-store"
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
import { useLivraisonDataStore } from '@/stores/livraison-data-store'

interface CreateLivraisonModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface AddressExpedition {
  code: string;
  description: string;
  leg_comp: string;
}

interface Client {
  code: string;
  name: string;
}

export function CreateLivraisonModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateLivraisonModalProps) {
  const { selectedSite } = useSiteVenteStore()
  const { livraisonTypes, setLivraisonTypes } = useLivraisonDataStore()
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
  const [expeditionAddresses, setExpeditionAddresses] = useState<AddressExpedition[]>([])
  const [deliveryAddresses, setDeliveryAddresses] = useState<any[]>([])
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState('')
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    const loadTypes = async () => {
      if (livraisonTypes.length === 0) {
        try {
          const response = await fetchLivraisonTypes()
          if (response && response.success && response.data) {
            setLivraisonTypes(response.data)
          }
        } catch (error) {
          console.error("Failed to load livraison types", error)
        }
      }
    }
    if (isOpen) {
      loadTypes()
    }
  }, [isOpen, livraisonTypes.length, setLivraisonTypes])

  useEffect(() => {
    const loadExpeditionAddresses = async () => {
      if (selectedSite?.leg_comp) {
        try {
          const response = await fetchAdresseExpedition(selectedSite.leg_comp)
          if (response && response.success && response.data) {
            setExpeditionAddresses(response.data)
          }
        } catch (error) {
          console.error("Failed to load expedition addresses", error)
        }
      }
    }

    if (isOpen) {
      loadExpeditionAddresses()
    }
  }, [isOpen, selectedSite])

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetchClients()
        if (response && response.success && response.data) {
          setClients(response.data)
        }
      } catch (error) {
        console.error("Failed to load clients", error)
      }
    }

    if (isOpen) {
      loadClients()
    }
  }, [isOpen])

  useEffect(() => {
    const loadDeliveryAddresses = async () => {
      if (clientLivree) {
        try {
          const { fetchAdresseLivraison } = await import('@/lib/api')
          const response = await fetchAdresseLivraison(clientLivree)
          if (response && response.success && response.data) {
            setDeliveryAddresses(response.data)
            if (response.data.length > 0) {
              setSelectedDeliveryAddress(response.data[0].code)
            } else {
              setSelectedDeliveryAddress('')
            }
          }
        } catch (error) {
          console.error("Failed to load delivery addresses", error)
        }
      } else {
        setDeliveryAddresses([])
        setSelectedDeliveryAddress('')
      }
    }

    loadDeliveryAddresses()
  }, [clientLivree])

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
      setSelectedDeliveryAddress('')
      setDeliveryAddresses([])

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
    setSelectedDeliveryAddress('')
    setDeliveryAddresses([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}  >
      <DialogContent className="min-w-[600px] max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    {expeditionAddresses.map((addr) => (
                      <SelectItem key={addr.code} value={addr.code}>
                        {addr.code} - {addr.description}
                      </SelectItem>
                    ))}
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
                    {livraisonTypes.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.label || item.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-livree">Client livré</Label>
                <Input
                  id="client-livree"
                  placeholder="Client livré"
                  value={clientLivree}
                  onChange={(e) => setClientLivree(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-address">Site de livraison</Label>
                <Select value={selectedDeliveryAddress} onValueChange={setSelectedDeliveryAddress}>
                  <SelectTrigger id="delivery-address">
                    <SelectValue placeholder="Sélectionnez une adresse" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryAddresses.map((addr: any) => (
                      <SelectItem key={addr.code} value={addr.code}>
                        {addr.code} - {addr.description}
                      </SelectItem>
                    ))}
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
                onOrderSelect={(order) => {
                  if (order) {
                    setClientLivree(order.client_livre)
                    setClientFacture(order.client_comm)
                  } else {
                    setClientLivree('')
                    setClientFacture('')
                  }
                }}
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
