"use client"

import type React from "react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Copy, Trash2 } from "lucide-react"

interface NoteListItemProps {
  id: string
  title: string
  snippet: string
  onRename?: (id: string) => void
  onCopy?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
}

export function NoteListItem({ id, title, snippet, onRename, onCopy, onDelete, onClick }: NoteListItemProps) {
  const handleItemClick = () => {
    onClick?.(id)
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRename?.(id)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCopy?.(id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  return (
    <div
      className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={handleItemClick}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{title}</h3>
        <p className="text-sm text-muted-foreground truncate mt-1">{snippet}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleRename}>
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
