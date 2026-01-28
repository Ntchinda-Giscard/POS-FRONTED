'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchLivraison } from '@/lib/api'

interface Livraison {
  id: string
  dateExpedition: string
  dateLivraison: string
  clientLivree: string
  commandeLivree: string
  siteExpedition: string
  type: string
  status: 'pending' | 'in-transit' | 'delivered'
}

const ITEMS_PER_PAGE = 10

export function LivraisonList() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchLivraisons = async () => {
      try {
        // TODO: Replace with actual API call to your backend
        const response = fetchLivraison()
        // const data = await response.json()
        
        // Mock data for now
        const mockData: Livraison[] = [
          {
            id: '1',
            dateExpedition: '2025-01-15',
            dateLivraison: '2025-01-18',
            clientLivree: 'Entreprise A',
            commandeLivree: 'CMD-001',
            siteExpedition: 'Site Paris',
            type: 'Standard',
            status: 'delivered',
          },
          {
            id: '2',
            dateExpedition: '2025-01-16',
            dateLivraison: '2025-01-19',
            clientLivree: 'Entreprise B',
            commandeLivree: 'CMD-002',
            siteExpedition: 'Site Lyon',
            type: 'Express',
            status: 'in-transit',
          },
          {
            id: '3',
            dateExpedition: '2025-01-17',
            dateLivraison: '2025-01-20',
            clientLivree: 'Entreprise C',
            commandeLivree: 'CMD-003',
            siteExpedition: 'Site Marseille',
            type: 'Standard',
            status: 'pending',
          },
          {
            id: '4',
            dateExpedition: '2025-01-18',
            dateLivraison: '2025-01-21',
            clientLivree: 'Entreprise D',
            commandeLivree: 'CMD-004',
            siteExpedition: 'Site Paris',
            type: 'Express',
            status: 'delivered',
          },
          {
            id: '5',
            dateExpedition: '2025-01-19',
            dateLivraison: '2025-01-22',
            clientLivree: 'Entreprise E',
            commandeLivree: 'CMD-005',
            siteExpedition: 'Site Lyon',
            type: 'Standard',
            status: 'in-transit',
          },
          {
            id: '6',
            dateExpedition: '2025-01-20',
            dateLivraison: '2025-01-23',
            clientLivree: 'Entreprise F',
            commandeLivree: 'CMD-006',
            siteExpedition: 'Site Marseille',
            type: 'International',
            status: 'pending',
          },
          {
            id: '7',
            dateExpedition: '2025-01-21',
            dateLivraison: '2025-01-24',
            clientLivree: 'Entreprise A',
            commandeLivree: 'CMD-007',
            siteExpedition: 'Site Toulouse',
            type: 'Express',
            status: 'delivered',
          },
          {
            id: '8',
            dateExpedition: '2025-01-22',
            dateLivraison: '2025-01-25',
            clientLivree: 'Entreprise B',
            commandeLivree: 'CMD-008',
            siteExpedition: 'Site Paris',
            type: 'Standard',
            status: 'in-transit',
          },
          {
            id: '9',
            dateExpedition: '2025-01-23',
            dateLivraison: '2025-01-26',
            clientLivree: 'Entreprise C',
            commandeLivree: 'CMD-009',
            siteExpedition: 'Site Lyon',
            type: 'Express',
            status: 'pending',
          },
          {
            id: '10',
            dateExpedition: '2025-01-24',
            dateLivraison: '2025-01-27',
            clientLivree: 'Entreprise D',
            commandeLivree: 'CMD-010',
            siteExpedition: 'Site Marseille',
            type: 'Standard',
            status: 'delivered',
          },
          {
            id: '11',
            dateExpedition: '2025-01-25',
            dateLivraison: '2025-01-28',
            clientLivree: 'Entreprise E',
            commandeLivree: 'CMD-011',
            siteExpedition: 'Site Toulouse',
            type: 'International',
            status: 'in-transit',
          },
          {
            id: '12',
            dateExpedition: '2025-01-26',
            dateLivraison: '2025-01-29',
            clientLivree: 'Entreprise F',
            commandeLivree: 'CMD-012',
            siteExpedition: 'Site Paris',
            type: 'Standard',
            status: 'pending',
          },
        ]

        setLivraisons(mockData)
      } catch (error) {
        console.error('Error fetching livraisons:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLivraisons()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'En attente', variant: 'outline' },
      'in-transit': { label: 'En transit', variant: 'secondary' },
      delivered: { label: 'Livrée', variant: 'default' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  // Filter livraisons based on search and filters
  const filteredLivraisons = livraisons.filter((livraison) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      livraison.commandeLivree.toLowerCase().includes(searchLower) ||
      livraison.clientLivree.toLowerCase().includes(searchLower) ||
      livraison.siteExpedition.toLowerCase().includes(searchLower)

    const matchesStatus =
      filterStatus === 'all' || livraison.status === filterStatus
    const matchesType = filterType === 'all' || livraison.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  // Pagination
  const totalPages = Math.ceil(filteredLivraisons.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedLivraisons = filteredLivraisons.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="space-y-4 p-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Search and Filters */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par commande, client ou site..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <Button variant="outline" size="icon" className="bg-transparent">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Options */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Select value={filterStatus} onValueChange={(value) => {
              setFilterStatus(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in-transit">En transit</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={filterType} onValueChange={(value) => {
              setFilterType(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Express">Express</SelectItem>
                <SelectItem value="International">International</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="bg-muted">Date d'expédition</TableHead>
              <TableHead className="bg-muted">Date de livraison</TableHead>
              <TableHead className="bg-muted">Client livré</TableHead>
              <TableHead className="bg-muted">Commande livré</TableHead>
              <TableHead className="bg-muted">Site d'expédition</TableHead>
              <TableHead className="bg-muted">Type</TableHead>
              <TableHead className="bg-muted">Statut</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {paginatedLivraisons.length > 0 ? (
            paginatedLivraisons.map((livraison) => (
              <TableRow key={livraison.id} className="border-border hover:bg-muted/50">
                <TableCell className="font-medium">{formatDate(livraison.dateExpedition)}</TableCell>
                <TableCell>{formatDate(livraison.dateLivraison)}</TableCell>
                <TableCell>{livraison.clientLivree}</TableCell>
                <TableCell>{livraison.commandeLivree}</TableCell>
                <TableCell>{livraison.siteExpedition}</TableCell>
                <TableCell>
                  <Badge variant="outline">{livraison.type}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(livraison.status)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Aucune livraison trouvée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-border p-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Affichage {filteredLivraisons.length === 0 ? 0 : startIndex + 1} à{' '}
          {Math.min(endIndex, filteredLivraisons.length)} sur {filteredLivraisons.length} livraisons
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-3 py-1 rounded-md bg-muted text-sm font-medium">
            {currentPage} / {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
