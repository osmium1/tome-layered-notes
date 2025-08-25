"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PasteToCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (content: string) => void
}

export function PasteToCreateModal({ isOpen, onClose, onSubmit }: PasteToCreateModalProps) {
  const [content, setContent] = useState("")

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content)
      setContent("")
      onClose()
    }
  }

  const handleCancel = () => {
    setContent("")
    onClose()
  }

  const exampleContent = `# [L1] The Mitochondria - Powerhouse of the Cell Mnemonic
## [L2] ATP Production
### [L3] Cellular respiration occurs here, converting glucose and oxygen into ATP.
#### [L4] Example: Krebs Cycle and Electron Transport Chain.
## [L2] Double Membrane
### [L3] Has an outer and inner membrane with different functions.
#### [L4] Inner membrane has cristae that increase surface area.`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
          <DialogDescription>
            Paste your structured content below. Use the format: # [L1], ## [L2], ### [L3], #### [L4] for different
            layers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder={exampleContent}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              Create Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
