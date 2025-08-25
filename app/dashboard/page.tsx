"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { BinderCard } from "@/components/binder-card"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { RenameModal } from "@/components/rename-modal"
import { Plus } from "lucide-react"

interface Binder {
  id: string
  title: string
  notebookCount: number
  isSample?: boolean
}

export default function DashboardPage() {
  const [binders, setBinders] = useState<Binder[]>([
    {
      id: "sample-1",
      title: "Sample Binder",
      notebookCount: 1,
      isSample: true,
    },
  ])
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; binder?: Binder }>({ isOpen: false })
  const [renameModal, setRenameModal] = useState<{ isOpen: boolean; binder?: Binder }>({ isOpen: false })

  const handleCreateBinder = () => {
    const newBinder: Binder = {
      id: `binder-${Date.now()}`,
      title: "New Binder",
      notebookCount: 0,
    }
    setBinders([...binders, newBinder])
  }

  const handleBinderClick = (id: string) => {
    console.log("Opening binder:", id)
    window.location.href = `/binder/${id}`
  }

  const handleRenameBinder = (id: string) => {
    const binder = binders.find((b) => b.id === id)
    if (binder) {
      setRenameModal({ isOpen: true, binder })
    }
  }

  const handleDeleteBinder = (id: string) => {
    const binder = binders.find((b) => b.id === id)
    if (binder) {
      setDeleteModal({ isOpen: true, binder })
    }
  }

  const confirmRename = (newName: string) => {
    if (renameModal.binder) {
      setBinders(
        binders.map((binder) => (binder.id === renameModal.binder?.id ? { ...binder, title: newName } : binder)),
      )
    }
  }

  const confirmDelete = () => {
    if (deleteModal.binder) {
      setBinders(binders.filter((binder) => binder.id !== deleteModal.binder?.id))
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath="/dashboard" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <header className="border-b border-border bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="ml-12 md:ml-0">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            </div>
            <Button onClick={handleCreateBinder} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create New Binder</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {binders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">No Binders Yet</h2>
              <p className="text-muted-foreground mb-4">Create your first binder to start organizing your notes</p>
              <Button onClick={handleCreateBinder}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Binder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {binders.map((binder) => (
                <BinderCard
                  key={binder.id}
                  id={binder.id}
                  title={binder.title}
                  notebookCount={binder.notebookCount}
                  isSample={binder.isSample}
                  onClick={handleBinderClick}
                  onRename={handleRenameBinder}
                  onDelete={handleDeleteBinder}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete Binder?"
        description={`Are you sure you want to permanently delete "${deleteModal.binder?.title}"? This will also delete all notebooks and notes within it. This action cannot be undone.`}
      />

      <RenameModal
        isOpen={renameModal.isOpen}
        onClose={() => setRenameModal({ isOpen: false })}
        onConfirm={confirmRename}
        currentName={renameModal.binder?.title || ""}
        itemType="Binder"
      />
    </div>
  )
}
