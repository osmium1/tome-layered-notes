"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { NoteEditor } from "@/components/note-editor"
import Link from "next/link"
import type { NoteNode } from "@/lib/note-parser"

// Mock data - in a real app, this would come from a database
const mockNote = {
  id: "note-1",
  title: "Mitochondria - The Powerhouse",
  content: `# [L1] The Mitochondria - Powerhouse of the Cell Mnemonic
## [L2] ATP Production
### [L3] Cellular respiration occurs here, converting glucose and oxygen into ATP.
#### [L4] Example: Krebs Cycle and Electron Transport Chain.
## [L2] Double Membrane
### [L3] Has an outer and inner membrane with different functions.
#### [L4] Inner membrane has cristae that increase surface area.
## [L2] Matrix
### [L3] The innermost compartment containing enzymes for the citric acid cycle.
#### [L4] Contains mitochondrial DNA and ribosomes.`,
}

export default function NotePage({ params }: { params: { id: string } }) {
  const [note, setNote] = useState(mockNote)

  const handleSave = (title: string, nodes: NoteNode[]) => {
    console.log("Saving note:", { title, nodes })
    setNote((prev) => ({ ...prev, title }))
  }

  const handleDelete = () => {
    console.log("Deleting note:", note.id)
    // Navigate back to notebook view
  }

  const handleCopy = () => {
    console.log("Copying note:", note.id)
    // Copy note logic
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
            <Link href="/binder/sample-1" className="hover:text-foreground">
              Sample Binder
            </Link>
            <span>/</span>
            <Link href="/notebook/notebook-1" className="hover:text-foreground">
              Sample Notebook
            </Link>
            <span>/</span>
            <span className="text-foreground">{note.title}</span>
          </div>
        </div>

        <NoteEditor
          noteId={note.id}
          initialTitle={note.title}
          initialContent={note.content}
          onSave={handleSave}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />
      </div>
    </div>
  )
}
