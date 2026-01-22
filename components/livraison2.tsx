'use client'

import { useState } from 'react'
import { LivraisonList } from '@/components/livraison-list'
import { CreateLivraisonModal } from '@/components/create-livraison-modal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function LivraisonPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreateSuccess = () => {
    setIsModalOpen(false)
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Livraisons</h1>
            <p className="text-muted-foreground mt-1">Gérez vos livraisons et commandes</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer
          </Button>
        </div>

        <LivraisonList key={refreshTrigger} />

        <CreateLivraisonModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </main>
  )
}
