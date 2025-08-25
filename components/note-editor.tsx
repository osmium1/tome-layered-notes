"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayeredNode } from "@/components/layered-node"
import { PasteToCreateModal } from "@/components/paste-to-create-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Copy, Trash2, Expand, ListCollapse as Collapse } from "lucide-react"
import {
  parseNoteContent,
  expandAllNodes,
  collapseAllNodes,
  updateNodeContent,
  toggleNodeExpansion,
  type NoteNode,
} from "@/lib/note-parser"

interface NoteEditorProps {
  noteId?: string
  initialTitle?: string
  initialContent?: string
  onSave?: (title: string, nodes: NoteNode[]) => void
  onDelete?: () => void
  onCopy?: () => void
}

export function NoteEditor({
  noteId,
  initialTitle = "Untitled Note",
  initialContent = "",
  onSave,
  onDelete,
  onCopy,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [nodes, setNodes] = useState<NoteNode[]>(() => {
    if (initialContent) {
      return parseNoteContent(initialContent)
    }
    return []
  })
  const [showPasteModal, setShowPasteModal] = useState(nodes.length === 0)

  const handlePasteContent = (content: string) => {
    const parsedNodes = parseNoteContent(content)
    setNodes(parsedNodes)
    onSave?.(title, parsedNodes)
  }

  const handleToggleExpansion = (nodeId: string) => {
    setNodes((prevNodes) => toggleNodeExpansion(prevNodes, nodeId))
  }

  const handleUpdateContent = (nodeId: string, content: string) => {
    setNodes((prevNodes) => updateNodeContent(prevNodes, nodeId, content))
    onSave?.(title, nodes)
  }

  const handleExpandAll = () => {
    setNodes((prevNodes) => expandAllNodes(prevNodes))
  }

  const handleCollapseAll = () => {
    setNodes((prevNodes) => collapseAllNodes(prevNodes))
  }

  const handleTitleSave = () => {
    setIsEditingTitle(false)
    onSave?.(title, nodes)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave()
    } else if (e.key === "Escape") {
      setTitle(initialTitle)
      setIsEditingTitle(false)
    }
  }

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">No Content Yet</h2>
          <p className="text-muted-foreground">Create your first note by pasting structured content</p>
          <Button onClick={() => setShowPasteModal(true)}>Create Note Content</Button>
        </div>
        <PasteToCreateModal
          isOpen={showPasteModal}
          onClose={() => setShowPasteModal(false)}
          onSubmit={handlePasteContent}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {isEditingTitle ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="text-2xl font-bold bg-transparent border-none p-0 h-auto"
                autoFocus
              />
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExpandAll}>
              <Expand className="h-4 w-4 mr-2" />
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={handleCollapseAll}>
              <Collapse className="h-4 w-4 mr-2" />
              Collapse All
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onCopy}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Editor Canvas */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {nodes.map((node) => (
            <LayeredNode
              key={node.id}
              node={node}
              onToggleExpansion={handleToggleExpansion}
              onUpdateContent={handleUpdateContent}
            />
          ))}
        </div>
      </main>

      <PasteToCreateModal
        isOpen={showPasteModal}
        onClose={() => setShowPasteModal(false)}
        onSubmit={handlePasteContent}
      />
    </div>
  )
}
