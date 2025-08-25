"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash2 } from "lucide-react"

interface NotebookCardProps {
  id: string
  title: string
  noteCount: number
  onRename?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
}

export function NotebookCard({ id, title, noteCount, onRename, onDelete, onClick }: NotebookCardProps) {
  const handleCardClick = () => {
    onClick?.(id)
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRename?.(id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  return (
    <Card className="cursor-pointer transition-all hover:shadow-md" onClick={handleCardClick}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleRename}>
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {noteCount} {noteCount === 1 ? "Note" : "Notes"}
        </p>
      </CardContent>
    </Card>
  )
}
