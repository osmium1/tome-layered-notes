"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { NotebookCard } from "@/components/notebook-card"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { RenameModal } from "@/components/rename-modal"
import { CreateItemModal } from "@/components/create-item-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"

interface Notebook {
  id: string
  title: string
  noteCount: number
}

interface Binder {
  id: string
  title: string
}

export default function BinderPage({ params }: { params: { id: string } }) {
  const [binder, setBinder] = useState<Binder | null>(null)
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; notebook?: Notebook }>({ isOpen: false })
  const [renameModal, setRenameModal] = useState<{ isOpen: boolean; notebook?: Notebook }>({ isOpen: false })
  const [createModal, setCreateModal] = useState(false)
  const router = useRouter()
  const { user, loading: userLoading } = useUser()

  useEffect(() => {
    const fetchBinderAndNotebooks = async () => {
      if (userLoading) return

      if (!user) {
        router.push("/login")
        return
      }

      const supabase = createClient()

      // Fetch binder details
      const { data: binderData, error: binderError } = await supabase
        .from("binders")
        .select("id, title")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

      if (binderError || !binderData) {
        router.push("/dashboard")
        return
      }

      setBinder(binderData)

      // Fetch notebooks with note counts
      const { data: notebooksData, error: notebooksError } = await supabase
        .from("notebooks")
        .select(`
          id,
          title,
          notes(count)
        `)
        .eq("binder_id", params.id)
        .order("created_at", { ascending: false })

      if (notebooksError) {
        console.error("Error fetching notebooks:", notebooksError)
      } else {
        const formattedNotebooks = notebooksData.map((notebook) => ({
          id: notebook.id,
          title: notebook.title,
          noteCount: notebook.notes?.[0]?.count || 0,
        }))
        setNotebooks(formattedNotebooks)
      }

      setIsLoading(false)
    }

    fetchBinderAndNotebooks()
  }, [params.id, router, user, userLoading])

  const handleCreateNotebook = () => {
    setCreateModal(true)
  }

  const confirmCreateNotebook = async (name: string) => {
    if (!user || !binder) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("notebooks")
      .insert({
        binder_id: binder.id,
        title: name,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating notebook:", error)
    } else {
      const newNotebook: Notebook = {
        id: data.id,
        title: data.title,
        noteCount: 0,
      }
      setNotebooks([newNotebook, ...notebooks])
    }
  }

  const handleNotebookClick = (id: string) => {
    router.push(`/notebook/${id}`)
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

  const confirmRename = async (newName: string) => {
    if (!renameModal.notebook || !user) return

    const supabase = createClient()
    const { error } = await supabase.from("notebooks").update({ title: newName }).eq("id", renameModal.notebook.id)

    if (error) {
      console.error("Error renaming notebook:", error)
    } else {
      setNotebooks(
        notebooks.map((notebook) =>
          notebook.id === renameModal.notebook?.id ? { ...notebook, title: newName } : notebook,
        ),
      )
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal.notebook || !user) return

    const supabase = createClient()
    const { error } = await supabase.from("notebooks").delete().eq("id", deleteModal.notebook.id)

    if (error) {
      console.error("Error deleting notebook:", error)
    } else {
      setNotebooks(notebooks.filter((notebook) => notebook.id !== deleteModal.notebook?.id))
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar currentPath="/dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notebooks...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!binder) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar currentPath="/dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Binder Not Found</h2>
            <p className="text-muted-foreground mb-4">The binder you're looking for doesn't exist.</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath="/dashboard" />

      <div className="flex-1 flex flex-col md:ml-0">
        <div className="border-b border-border bg-background px-6 py-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground ml-12 md:ml-0">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground">{binder.title}</span>
          </div>
        </div>

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
