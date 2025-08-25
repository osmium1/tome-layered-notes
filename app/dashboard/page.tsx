"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { BinderCard } from "@/components/binder-card"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { RenameModal } from "@/components/rename-modal"
import { CreateItemModal } from "@/components/create-item-modal"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"

interface Binder {
  id: string
  title: string
  description?: string
  color?: string
  notebookCount: number
  isSample?: boolean
  created_at?: string
}

export default function DashboardPage() {
  const [binders, setBinders] = useState<Binder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; binder?: Binder }>({ isOpen: false })
  const [renameModal, setRenameModal] = useState<{ isOpen: boolean; binder?: Binder }>({ isOpen: false })
  const [createModal, setCreateModal] = useState(false)
  const router = useRouter()
  const { user, loading: userLoading } = useUser()

  useEffect(() => {
    const fetchBinders = async () => {
      if (userLoading) return

      if (!user) {
        router.push("/login")
        return
      }

      const supabase = createClient()

      const { data: bindersData, error: bindersError } = await supabase
        .from("binders")
        .select(`
          id,
          title,
          description,
          color,
          created_at,
          notebooks(count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (bindersError) {
        console.error("Error fetching binders:", bindersError)
      } else {
        const formattedBinders = bindersData.map((binder) => ({
          id: binder.id,
          title: binder.title,
          description: binder.description,
          color: binder.color,
          notebookCount: binder.notebooks?.[0]?.count || 0,
          isSample: binder.title === "Getting Started with Tome",
          created_at: binder.created_at,
        }))
        setBinders(formattedBinders)
      }

      setIsLoading(false)
    }

    fetchBinders()
  }, [user, userLoading, router])

  const handleCreateBinder = () => {
    setCreateModal(true)
  }

  const confirmCreateBinder = async (name: string) => {
    if (!user) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("binders")
      .insert({
        user_id: user.id,
        title: name,
        description: "",
        color: "#3b82f6",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating binder:", error)
    } else {
      const newBinder: Binder = {
        id: data.id,
        title: data.title,
        description: data.description,
        color: data.color,
        notebookCount: 0,
        created_at: data.created_at,
      }
      setBinders([newBinder, ...binders])
    }
  }

  const handleBinderClick = (id: string) => {
    console.log("[v0] Dashboard - clicking binder with ID:", id)
    console.log("[v0] Dashboard - ID type:", typeof id)
    router.push(`/binder/${id}`)
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

  const confirmRename = async (newName: string) => {
    if (!renameModal.binder || !user) return

    const supabase = createClient()
    const { error } = await supabase
      .from("binders")
      .update({ title: newName })
      .eq("id", renameModal.binder.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error renaming binder:", error)
    } else {
      setBinders(
        binders.map((binder) => (binder.id === renameModal.binder?.id ? { ...binder, title: newName } : binder)),
      )
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal.binder || !user) return

    const supabase = createClient()
    const { error } = await supabase.from("binders").delete().eq("id", deleteModal.binder.id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting binder:", error)
    } else {
      setBinders(binders.filter((binder) => binder.id !== deleteModal.binder?.id))
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar currentPath="/dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your binders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath="/dashboard" />

      <div className="flex-1 flex flex-col md:ml-0">
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

      <CreateItemModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        onConfirm={confirmCreateBinder}
        itemType="Binder"
        placeholder="My Study Binder"
      />
    </div>
  )
}
