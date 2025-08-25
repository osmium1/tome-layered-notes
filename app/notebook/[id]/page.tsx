"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { NoteListItem } from "@/components/note-list-item"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { RenameModal } from "@/components/rename-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface Note {
  id: string
  title: string
  snippet: string
}

// Mock data - in a real app, this would come from a database
const mockNotebook = {
  id: "notebook-1",
  title: "Sample Notebook",
  binderId: "sample-1",
  binderTitle: "Sample Binder",
  notes: [
    {
      id: "note-1",
      title: "Mitochondria - The Powerhouse",
      snippet: "The Mitochondria - Powerhouse of the Cell Mnemonic",
    },
  ],
}

export default function NotebookPage({ params }: { params: { id: string } }) {
  const [notebook, setNotebook] = useState(mockNotebook)
  const [notes, setNotes] = useState<Note[]>(mockNotebook.notes)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; note?: Note }>({ isOpen: false })
  const [renameModal, setRenameModal] = useState<{ isOpen: boolean; note?: Note }>({ isOpen: false })

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "New Note",
      snippet: "Click to add content...",
    }
    setNotes([...notes, newNote])
  }

  const handleNoteClick = (id: string) => {
    console.log("Opening note:", id)
    // Navigate to note view
    window.location.href = `/note/${id}`
  }

  const handleRenameNote = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      setRenameModal({ isOpen: true, note })
    }
  }

  const handleCopyNote = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      const copiedNote: Note = {
        id: `note-${Date.now()}`,
        title: `${note.title} (Copy)`,
        snippet: note.snippet,
      }
      setNotes([...notes, copiedNote])
    }
  }

  const handleDeleteNote = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      setDeleteModal({ isOpen: true, note })
    }
  }

  const confirmRename = (newName: string) => {
    if (renameModal.note) {
      setNotes(notes.map((note) => (note.id === renameModal.note?.id ? { ...note, title: newName } : note)))
    }
  }

  const confirmDelete = () => {
    if (deleteModal.note) {
      setNotes(notes.filter((note) => note.id !== deleteModal.note?.id))
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
            <Link href={`/binder/${notebook.binderId}`} className="hover:text-foreground">
              {notebook.binderTitle}
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
    </div>
  )
}
