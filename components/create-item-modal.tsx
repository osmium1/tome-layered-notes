"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CreateItemModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string) => void
  itemType: string
  placeholder?: string
}

export function CreateItemModal({ isOpen, onClose, onConfirm, itemType, placeholder }: CreateItemModalProps) {
  const [name, setName] = useState("")

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim())
      setName("")
    }
    onClose()
  }

  const handleClose = () => {
    setName("")
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm()
    } else if (e.key === "Escape") {
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New {itemType}</DialogTitle>
          <DialogDescription>Enter a name for your new {itemType.toLowerCase()}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || `My ${itemType}`}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!name.trim()}>
            Create {itemType}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
