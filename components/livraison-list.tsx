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
import { Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, CheckCircle } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { fetchLivraison, LivraisonHeader, fetchLivraisonTypes, updateLivraisonStatus } from '@/lib/api'
import { toast } from 'sonner'



import { useLivraisonDataStore } from '@/stores/livraison-data-store'

const ITEMS_PER_PAGE = 10

export function LivraisonList() {
  const { livraisons, setLivraisons, livraisonTypes, setLivraisonTypes, isLoading, setIsLoading } = useLivraisonDataStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const loadLivraisons = async () => {
    setIsLoading(true)
    try {
      const response = await fetchLivraison()
      
      if (response && response.success && response.data) {
        setLivraisons(response.data)
      }
    } catch (error) {
      console.error('Error fetching livraisons:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLivraisons()

    const fetchTypes = async () => {
      try {
        const response = await fetchLivraisonTypes()
        
        if (response && response.success && response.data) {
          setLivraisonTypes(response.data)
        }
      } catch (error) {
        console.error('Error fetching livraison types:', error)
      }
    }

    // Only fetch types if they haven't been loaded yet
    if (livraisonTypes.length === 0) {
      fetchTypes()
    }
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      '1': { label: 'En attente', variant: 'outline' },
      '2': { label: 'Livrée', variant: 'default' },
      'default': { label: 'Inconnu', variant: 'secondary' }
    }
    const config = statusConfig[status] || statusConfig['default']
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  // Filter livraisons based on search and filters
  const filteredLivraisons = livraisons.filter((livraison) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      livraison.commande_livre.toLowerCase().includes(searchLower) ||
      livraison.client_livre.toLowerCase().includes(searchLower) ||
      livraison.site_vente.toLowerCase().includes(searchLower)

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await updateLivraisonStatus(id, newStatus)
      if (response && response.success) {
        toast.success(`Statut mis à jour : ${newStatus === '1' ? 'En attente' : 'Livrée'}`)
        loadLivraisons() // Refresh the list
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const siblingCount = 1 // Number of pages to show on each side of the current page

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      // Always show first page
      pages.push(1)

      const leftSiblingIndex = Math.max(currentPage - siblingCount, 2)
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 1)

      const shouldShowLeftDots = leftSiblingIndex > 2
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1

      if (shouldShowLeftDots) {
        pages.push('ellipsis')
      }

      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pages.push(i)
      }

      if (shouldShowRightDots) {
        pages.push('ellipsis')
      }

      // Always show last page
      pages.push(totalPages)
    }
    return pages
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
                <SelectItem value="2">Livrée</SelectItem>
                <SelectItem value="1">En attente</SelectItem>
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
                {livraisonTypes.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.label || type.code}
                  </SelectItem>
                ))}
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
              <TableHead className="bg-muted text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {paginatedLivraisons.length > 0 ? (
            paginatedLivraisons.map((livraison) => (
              <TableRow key={livraison.id} className="border-border hover:bg-muted/50">
                <TableCell className="font-medium">{formatDate(livraison.date_expedition)}</TableCell>
                <TableCell>{formatDate(livraison.date_livraison)}</TableCell>
                <TableCell>{livraison.client_livre}</TableCell>
                <TableCell>{livraison.commande_livre}</TableCell>
                <TableCell>{livraison.site_vente}</TableCell>
                <TableCell>
                  <Badge variant="outline">{livraison.type}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(livraison.status || 'default')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Mettre en attente"
                      className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                      onClick={() => handleStatusChange(livraison.id, '1')}
                      disabled={livraison.status === '1' || livraison.status === '2'}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Marquer comme livrée"
                      className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                      onClick={() => handleStatusChange(livraison.id, '2')}
                      disabled={livraison.status === '2'}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
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
      <div className="border-t border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          Affichage {filteredLivraisons.length === 0 ? 0 : startIndex + 1} à{' '}
          {Math.min(endIndex, filteredLivraisons.length)} sur {filteredLivraisons.length} livraisons
        </div>
        
        <div className="order-1 sm:order-2">
          <Pagination>
            <PaginationContent>
              {/* Skip to First */}
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="h-9 w-9 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">Première page</span>
                </Button>
              </PaginationItem>

              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) handlePageChange(currentPage - 1)
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(page as number)
                      }}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) handlePageChange(currentPage + 1)
                  }}
                  className={currentPage === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* Skip to Last */}
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-9 w-9 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Dernière page</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </Card>
  )
}
