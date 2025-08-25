"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { NotebookCard } from "@/components/notebook-card"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { RenameModal } from "@/components/rename-modal"
import { CreateItemModal } from "@/components/create-item-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface Notebook {
  id: string
  title: string
  noteCount: number
}

// Mock data - in a real app, this would come from a database
const mockBinder = {
  id: "sample-1",
  title: "Sample Binder",
  notebooks: [
    {
      id: "notebook-1",
      title: "Sample Notebook",
      noteCount: 1,
    },
  ],
}

export default function BinderPage({ params }: { params: { id: string } }) {
  const [binder, setBinder] = useState(mockBinder)
  const [notebooks, setNotebooks] = useState<Notebook[]>(mockBinder.notebooks)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; notebook?: Notebook }>({ isOpen: false })
  const [renameModal, setRenameModal] = useState<{ isOpen: boolean; notebook?: Notebook }>({ isOpen: false })
  const [createModal, setCreateModal] = useState(false)

  const handleCreateNotebook = () => {
    setCreateModal(true)
  }

  const confirmCreateNotebook = (name: string) => {
    const newNotebook: Notebook = {
      id: `notebook-${Date.now()}`,
      title: name,
      noteCount: 0,
    }
    setNotebooks([...notebooks, newNotebook])
  }

  const handleNotebookClick = (id: string) => {
    console.log("Opening notebook:", id)
    // Navigate to notebook view
    window.location.href = `/notebook/${id}`
  }

  const handleRenameNotebook = (id: string) => {
    const notebook = notebooks.find((n) => n.id === id)
    if (notebook) {
      setRenameModal({ isOpen: true, notebook })
    }
  }

  const handleDeleteNotebook = (id: string) => {
    const notebook = notebooks.find((n) => n.id === id)
    if (notebook) {
      setDeleteModal({ isOpen: true, notebook })
    }
  }

  const confirmRename = (newName: string) => {
    if (renameModal.notebook) {
      setNotebooks(
        notebooks.map((notebook) =>
          notebook.id === renameModal.notebook?.id ? { ...notebook, title: newName } : notebook,
        ),
      )
    }
  }

  const confirmDelete = () => {
    if (deleteModal.notebook) {
      setNotebooks(notebooks.filter((notebook) => notebook.id !== deleteModal.notebook?.id))
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-background px-6 py-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground ml-12 md:ml-0">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground">{binder.title}</span>
          </div>
        </div>

        {/* Header */}
        <header className="border-b border-border bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="ml-12 md:ml-0">
              <h1 className="text-3xl font-bold text-foreground">{binder.title}</h1>
            </div>
            <Button onClick={handleCreateNotebook} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create New Notebook</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {notebooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">No Notebooks Yet</h2>
              <p className="text-muted-foreground mb-4">Create your first notebook to start organizing your notes</p>
              <Button onClick={handleCreateNotebook}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Notebook
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notebooks.map((notebook) => (
                <NotebookCard
                  key={notebook.id}
                  id={notebook.id}
                  title={notebook.title}
                  noteCount={notebook.noteCount}
                  onClick={handleNotebookClick}
                  onRename={handleRenameNotebook}
                  onDelete={handleDeleteNotebook}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete Notebook?"
        description={`Are you sure you want to permanently delete "${deleteModal.notebook?.title}"? This will also delete all notes within it. This action cannot be undone.`}
      />

      <RenameModal
        isOpen={renameModal.isOpen}
        onClose={() => setRenameModal({ isOpen: false })}
        onConfirm={confirmRename}
        currentName={renameModal.notebook?.title || ""}
        itemType="Notebook"
      />

      <CreateItemModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        onConfirm={confirmCreateNotebook}
        itemType="Notebook"
        placeholder="My Study Notebook"
      />
    </div>
  )
}
