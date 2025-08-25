"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash2, Star } from "lucide-react"

interface BinderCardProps {
  id: string
  title: string
  notebookCount: number
  isSample?: boolean
  onRename?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
}

export function BinderCard({
  id,
  title,
  notebookCount,
  isSample = false,
  onRename,
  onDelete,
  onClick,
}: BinderCardProps) {
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
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSample ? "ring-2 ring-accent ring-opacity-50" : ""
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {isSample && <Star className="h-4 w-4 text-accent fill-accent" />}
        </div>
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
          {notebookCount} {notebookCount === 1 ? "Notebook" : "Notebooks"}
        </p>
      </CardContent>
    </Card>
  )
}
