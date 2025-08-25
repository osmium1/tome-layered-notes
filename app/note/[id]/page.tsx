"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { NoteEditor } from "@/components/note-editor"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { NoteNode } from "@/lib/note-parser"

export default function NotePage({ params }: { params: { id: string } }) {
  const [note, setNote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchNote()
  }, [params.id])

  const fetchNote = async () => {
    try {
      console.log("[v0] Note page - fetching note with ID:", params.id)

      const { data: noteData, error: noteError } = await supabase
        .from("notes")
        .select(`
          *,
          notebooks (
            id,
            title,
            binders (
              id,
              title
            )
          )
        `)
        .eq("id", params.id)
        .single()

      if (noteError) {
        console.error("[v0] Error fetching note:", noteError)
        setError("Failed to load note")
        return
      }

      console.log("[v0] Note data fetched:", noteData)
      setNote(noteData)
    } catch (err) {
      console.error("[v0] Error in fetchNote:", err)
      setError("Failed to load note")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (title: string, nodes: NoteNode[]) => {
    try {
      console.log("[v0] Saving note:", { title, nodes })

      const { error } = await supabase
        .from("notes")
        .update({
          title,
          content: nodes,
        })
        .eq("id", params.id)

      if (error) {
        console.error("[v0] Error saving note:", error)
        throw error
      }

      setNote((prev: any) => ({ ...prev, title, content: nodes }))
      console.log("[v0] Note saved successfully")
      return true
    } catch (err) {
      console.error("[v0] Error in handleSave:", err)
      return false
    }
  }

  const handleDelete = async () => {
    try {
      console.log("[v0] Deleting note:", params.id)

      const { error } = await supabase.from("notes").delete().eq("id", params.id)

      if (error) {
        console.error("[v0] Error deleting note:", error)
        return
      }

      // Navigate back to notebook view
      if (note?.notebooks) {
        window.location.href = `/notebook/${note.notebooks.id}`
      } else {
        window.location.href = "/dashboard"
      }
    } catch (err) {
      console.error("[v0] Error in handleDelete:", err)
    }
  }

  const handleCopy = () => {
    console.log("[v0] Copying note:", params.id)
    // Copy note logic - could implement later
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading note...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "Note not found"}</p>
            <Link href="/dashboard" className="text-primary hover:underline">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
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
            <Link href={`/binder/${note.notebooks?.binders?.id}`} className="hover:text-foreground">
              {note.notebooks?.binders?.title || "Binder"}
            </Link>
            <span>/</span>
            <Link href={`/notebook/${note.notebooks?.id}`} className="hover:text-foreground">
              {note.notebooks?.title || "Notebook"}
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
