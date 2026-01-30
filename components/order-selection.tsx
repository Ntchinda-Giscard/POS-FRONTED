'use client'

import { useEffect, useState, useRef } from 'react'
import { fetchCommandes, fetchCommandeQuantite } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface Article {
  id: string
  name: string
  sku: string
  quantity: number
  unit: string
}

interface Order {
  id: string
  orderNumber: string
  client: string
  articles: Article[]
  loaded?: boolean
}

interface SelectedArticle {
  articleId: string
  quantity: number
  totalQuantity: number
}

interface OrderSelectionProps {
  selectedOrderId: string | null
  onOrderChange: (orderId: string | null) => void
  selectedArticles: SelectedArticle[]
  onArticlesChange: (articles: SelectedArticle[]) => void
}

export function OrderSelection({
  selectedOrderId,
  onOrderChange,
  selectedArticles,
  onArticlesChange,
}: OrderSelectionProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [selectedAll, setSelectedAll] = useState(false)
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const response = await fetchCommandes()
        if (response.success && response.data) {
          const mappedOrders: Order[] = response.data.map((cmd) => ({
            id: cmd.code,
            orderNumber: cmd.code,
            client: cmd.client_comm || cmd.client_livre,
            articles: [],
            loaded: false
          }))
          setOrders(mappedOrders)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find((o) => o.id === selectedOrderId)
      if (order) {
         if (!order.loaded) {
             // Fetch details
             fetchCommandeQuantite(order.id).then(res => {
                 if (res.success && res.data) {
                     const articles: Article[] = res.data.map(q => ({
                         id: q.code,
                         name: q.code, // We don't have name yet
                         sku: q.code,
                         quantity: q.quantite,
                         unit: 'pcs'
                     }))
                     
                     setOrders(prev => prev.map(o => o.id === order.id ? { ...o, articles, loaded: true } : o))
                 }
             })
         }
         setCurrentOrder(order)
      } else {
         setCurrentOrder(null)
      }
      
      // Only reset selection if the order actually changed to a new one (not just update)
      // This part is tricky because we trigger effect on 'orders' update.
      // We should check if selectedOrderId is DIFFERENT from previous or if we just want to load current order.
      // Simpler: if order matches currentOrder?.id, don't reset.
      
      if (!order || (currentOrder && currentOrder.id !== selectedOrderId)) {
        onArticlesChange([])
        setSelectedAll(false)
        setQuantityInputs({})
      }
    } else {
      setCurrentOrder(null)
      onArticlesChange([])
      setSelectedAll(false)
      setQuantityInputs({})
    }
  }, [selectedOrderId, orders])

  const handleOrderChange = (orderId: string) => {
    onOrderChange(orderId)
  }

  const handleAddAllArticles = () => {
    if (!currentOrder) return

    const allArticles = currentOrder.articles.map((article) => ({
      articleId: article.id,
      quantity: article.quantity,
      totalQuantity: article.quantity,
    }))

    onArticlesChange(allArticles)
    setSelectedAll(true)
    // Initialize quantity inputs with full quantities
    const inputs: Record<string, string> = {}
    currentOrder.articles.forEach((article) => {
      inputs[article.id] = article.quantity.toString()
    })
    setQuantityInputs(inputs)
  }

  const handleArticleSelect = (articleId: string) => {
    if (!currentOrder) return

    const article = currentOrder.articles.find((a) => a.id === articleId)
    if (!article) return

    const isSelected = selectedArticles.some((a) => a.articleId === articleId)

    let newSelected: SelectedArticle[]
    if (isSelected) {
      newSelected = selectedArticles.filter((a) => a.articleId !== articleId)
      const newInputs = { ...quantityInputs }
      delete newInputs[articleId]
      setQuantityInputs(newInputs)
    } else {
      newSelected = [
        ...selectedArticles,
        {
          articleId,
          quantity: article.quantity,
          totalQuantity: article.quantity,
        },
      ]
      setQuantityInputs((prev) => ({
        ...prev,
        [articleId]: article.quantity.toString(),
      }))
    }

    onArticlesChange(newSelected)

    // Update selectAll state
    const allArticleIds = currentOrder.articles.map((a) => a.id)
    const allSelected = allArticleIds.every((id) =>
      newSelected.some((a) => a.articleId === id)
    )
    setSelectedAll(allSelected)
  }

  const handleQuantityChange = (articleId: string, value: string) => {
    const numValue = parseInt(value, 10) || 0
    setQuantityInputs((prev) => ({
      ...prev,
      [articleId]: value,
    }))

    const article = currentOrder?.articles.find((a) => a.id === articleId)
    if (!article) return

    const maxQuantity = article.quantity
    const finalQuantity = Math.min(Math.max(numValue, 0), maxQuantity)

    const updatedArticles = selectedArticles.map((a) =>
      a.articleId === articleId
        ? { ...a, quantity: finalQuantity }
        : a
    )

    onArticlesChange(updatedArticles)
  }

  const handleRemoveArticle = (articleId: string) => {
    const updatedArticles = selectedArticles.filter((a) => a.articleId !== articleId)
    onArticlesChange(updatedArticles)
    const newInputs = { ...quantityInputs }
    delete newInputs[articleId]
    setQuantityInputs(newInputs)

    if (!currentOrder) return
    const allArticleIds = currentOrder.articles.map((a) => a.id)
    const allSelected = allArticleIds.every((id) =>
      updatedArticles.some((a) => a.articleId === id)
    )
    setSelectedAll(allSelected)
  }

  return (
    <div className="space-y-6">
      {/* Order Selection */}
      <div className="space-y-2">
        <Label htmlFor="order-select">Sélectionnez une commande</Label>
        <Select value={selectedOrderId || ''} onValueChange={handleOrderChange}>
          <SelectTrigger id="order-select">
            <SelectValue placeholder="Choisir une commande..." />
          </SelectTrigger>
          <SelectContent>
            {orders.map((order) => (
              <SelectItem key={order.id} value={order.id}>
                {order.orderNumber} - {order.client}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Articles List */}
      {currentOrder && currentOrder.articles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Articles disponibles</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAllArticles}
              className="text-xs bg-transparent"
            >
              <Plus className="w-3 h-3 mr-1" />
              Ajouter tous
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
            {currentOrder.articles.map((article) => {
              const isSelected = selectedArticles.some(
                (a) => a.articleId === article.id
              )
              const quantityValue = quantityInputs[article.id] || ''

              return (
                <div
                  key={article.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`article-${article.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleArticleSelect(article.id)}
                  />
                  <label
                    htmlFor={`article-${article.id}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{article.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {article.sku}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Quantité disponible: {article.quantity} {article.unit}
                    </div>
                  </label>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Articles Summary */}
      {selectedArticles.length > 0 && (
        <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border">
          <h4 className="font-medium text-foreground">
            Articles sélectionnés ({selectedArticles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedArticles.map((selected) => {
              const article = currentOrder?.articles.find(
                (a) => a.id === selected.articleId
              )
              if (!article) return null

              return (
                <Card key={selected.articleId} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{article.name}</div>
                    <div className="text-xs text-muted-foreground">{article.sku}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        max={article.quantity}
                        value={quantityInputs[selected.articleId] || selected.quantity}
                        onChange={(e) =>
                          handleQuantityChange(selected.articleId, e.target.value)
                        }
                        className="w-16 text-center text-sm"
                      />
                      <span className="text-xs text-muted-foreground">/ {article.quantity}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveArticle(selected.articleId)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {!currentOrder && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Sélectionnez une commande pour voir les articles disponibles</p>
        </div>
      )}
    </div>
  )
}
