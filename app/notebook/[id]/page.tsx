"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { NoteListItem } from "@/components/note-list-item"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { RenameModal } from "@/components/rename-modal"
import { CreateItemModal } from "@/components/create-item-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Note {
  id: string
  title: string
  snippet: string
}

interface Notebook {
  id: string
  title: string
  binder_id: string
  binder_title: string
}

export default function NotebookPage({ params }: { params: { id: string } }) {
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; note?: Note }>({ isOpen: false })
  const [renameModal, setRenameModal] = useState<{ isOpen: boolean; note?: Note }>({ isOpen: false })
  const [createModal, setCreateModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchNotebookAndNotes = async () => {
      const supabase = createClient()

      // Check if user is authenticated
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push("/login")
        return
      }

      setUser(user)

      // Fetch notebook details with binder info
      const { data: notebookData, error: notebookError } = await supabase
        .from("notebooks")
        .select(`
          id,
          title,
          binder_id,
          binders!inner(title)
        `)
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

      if (notebookError || !notebookData) {
        console.error("Error fetching notebook:", notebookError)
        router.push("/dashboard")
        return
      }

      setNotebook({
        id: notebookData.id,
        title: notebookData.title,
        binder_id: notebookData.binder_id,
        binder_title: notebookData.binders.title,
      })

      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select("id, title, content")
        .eq("notebook_id", params.id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (notesError) {
        console.error("Error fetching notes:", notesError)
      } else {
        const formattedNotes = notesData.map((note) => ({
          id: note.id,
          title: note.title,
          snippet: note.content ? "Click to view content..." : "Click to add content...",
        }))
        setNotes(formattedNotes)
      }

      setIsLoading(false)
    }

    fetchNotebookAndNotes()
  }, [params.id, router])

  const handleCreateNote = () => {
    setCreateModal(true)
  }

  const confirmCreateNote = async (name: string) => {
    if (!user || !notebook) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("notes")
      .insert({
        notebook_id: notebook.id,
        user_id: user.id,
        title: name,
        content: [], // Use empty array instead of null to satisfy not-null constraint
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating note:", error)
    } else {
      const newNote: Note = {
        id: data.id,
        title: data.title,
        snippet: "Click to add content...",
      }
      setNotes([newNote, ...notes])
    }
  }

  const handleNoteClick = (id: string) => {
    router.push(`/note/${id}`)
  }

  const handleRenameNote = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      setRenameModal({ isOpen: true, note })
    }
  }

  const handleCopyNote = async (id: string) => {
    if (!user || !notebook) return

    const supabase = createClient()

    // Get the original note
    const { data: originalNote, error: fetchError } = await supabase
      .from("notes")
      .select("title, content")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !originalNote) {
      console.error("Error fetching note to copy:", fetchError)
      return
    }

    // Create the copy
    const { data, error } = await supabase
      .from("notes")
      .insert({
        notebook_id: notebook.id,
        user_id: user.id,
        title: `${originalNote.title} (Copy)`,
        content: originalNote.content,
      })
      .select()
      .single()

    if (error) {
      console.error("Error copying note:", error)
    } else {
      const copiedNote: Note = {
        id: data.id,
        title: data.title,
        snippet: data.content ? "Click to view content..." : "Click to add content...",
      }
      setNotes([copiedNote, ...notes])
    }
  }

  const handleDeleteNote = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      setDeleteModal({ isOpen: true, note })
    }
  }

  const confirmRename = async (newName: string) => {
    if (!renameModal.note || !user) return

    const supabase = createClient()
    const { error } = await supabase
      .from("notes")
      .update({ title: newName })
      .eq("id", renameModal.note.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error renaming note:", error)
    } else {
      setNotes(notes.map((note) => (note.id === renameModal.note?.id ? { ...note, title: newName } : note)))
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal.note || !user) return

    const supabase = createClient()
    const { error } = await supabase.from("notes").delete().eq("id", deleteModal.note.id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting note:", error)
    } else {
      setNotes(notes.filter((note) => note.id !== deleteModal.note?.id))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar currentPath="/dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!notebook) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar currentPath="/dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Notebook Not Found</h2>
            <p className="text-muted-foreground mb-4">The notebook you're looking for doesn't exist.</p>
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
      <Sidebar userEmail={user?.email} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-background px-6 py-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground ml-12 md:ml-0">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <Link href={`/binder/${notebook.binder_id}`} className="hover:text-foreground">
              {notebook.binder_title}
            </Link>
            <span>/</span>
            <span className="text-foreground">{notebook.title}</span>
          </div>
        </div>

        {/* Header */}
        <header className="border-b border-border bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="ml-12 md:ml-0">
              <h1 className="text-3xl font-bold text-foreground">{notebook.title}</h1>
            </div>
            <Button onClick={handleCreateNote} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create New Note</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">No Notes Yet</h2>
              <p className="text-muted-foreground mb-4">Create your first note to start learning</p>
              <Button onClick={handleCreateNote}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Note
              </Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {notes.map((note) => (
                <NoteListItem
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  snippet={note.snippet}
                  onClick={handleNoteClick}
                  onRename={handleRenameNote}
                  onCopy={handleCopyNote}
                  onDelete={handleDeleteNote}
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
        title="Delete Note?"
        description={`Are you sure you want to permanently delete "${deleteModal.note?.title}"? This action cannot be undone.`}
      />

      <RenameModal
        isOpen={renameModal.isOpen}
        onClose={() => setRenameModal({ isOpen: false })}
        onConfirm={confirmRename}
        currentName={renameModal.note?.title || ""}
        itemType="Note"
      />

      <CreateItemModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        onConfirm={confirmCreateNote}
        itemType="Note"
        placeholder="My Study Note"
      />
    </div>
  )
}
