"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText } from "lucide-react"
import { validateImportFile, type ExportData } from "@/lib/export-import"

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [step, setStep] = useState<"upload" | "select" | "importing">("upload")
  const [importData, setImportData] = useState<ExportData | null>(null)
  const [selectedBinders, setSelectedBinders] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    try {
      const data = await validateImportFile(file)
      setImportData(data)
      setSelectedBinders(data.binders.map((binder) => binder.id))
      setStep("select")
    } catch (error) {
      console.error("File validation failed:", error)
      alert("Invalid file format. Please select a valid Tome export file.")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && files[0].type === "application/json") {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleBinderToggle = (binderId: string, checked: boolean) => {
    if (checked) {
      setSelectedBinders([...selectedBinders, binderId])
    } else {
      setSelectedBinders(selectedBinders.filter((id) => id !== binderId))
    }
  }

  const handleSelectAll = () => {
    if (importData) {
      setSelectedBinders(importData.binders.map((binder) => binder.id))
    }
  }

  const handleDeselectAll = () => {
    setSelectedBinders([])
  }

  const handleImport = async () => {
    if (!importData || selectedBinders.length === 0) return

    setStep("importing")
    setImportProgress(0)

    // Simulate import progress
    const selectedBindersData = importData.binders.filter((binder) => selectedBinders.includes(binder.id))
    const totalItems = selectedBindersData.reduce(
      (acc, binder) => acc + binder.notebooks.reduce((notebookAcc, notebook) => notebookAcc + notebook.notes.length, 0),
      0,
    )

    let processedItems = 0

    for (const binder of selectedBindersData) {
      for (const notebook of binder.notebooks) {
        for (const note of notebook.notes) {
          // Simulate processing time
          await new Promise((resolve) => setTimeout(resolve, 100))
          processedItems++
          setImportProgress((processedItems / totalItems) * 100)
        }
      }
    }

    // Import complete
    console.log("Import completed:", selectedBindersData)
    alert("Import completed successfully!")
    handleClose()
  }

  const handleClose = () => {
    setStep("upload")
    setImportData(null)
    setSelectedBinders([])
    setImportProgress(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload a Tome export file to import your data."}
            {step === "select" && "Select the binders you wish to import."}
            {step === "importing" && "Importing your data..."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-accent bg-accent/10" : "border-border"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Drag & drop your .json file here, or click to browse</p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            </div>

            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileInputChange} className="hidden" />
          </div>
        )}

        {step === "select" && importData && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>Found {importData.binders.length} binders to import</span>
            </div>

            <div className="flex space-x-4 text-sm">
              <button type="button" onClick={handleSelectAll} className="text-accent hover:underline">
                Select All
              </button>
              <button type="button" onClick={handleDeselectAll} className="text-accent hover:underline">
                Deselect All
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {importData.binders.map((binder) => (
                <div key={binder.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`import-binder-${binder.id}`}
                    checked={selectedBinders.includes(binder.id)}
                    onCheckedChange={(checked) => handleBinderToggle(binder.id, checked as boolean)}
                  />
                  <Label htmlFor={`import-binder-${binder.id}`} className="text-sm">
                    {binder.title} ({binder.notebooks.length} notebooks)
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="space-y-4">
            <Progress value={importProgress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              Importing your data... {Math.round(importProgress)}%
            </p>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === "select" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={selectedBinders.length === 0}>
                Import Selected
              </Button>
            </>
          )}

          {step === "importing" && (
            <Button variant="outline" disabled>
              Importing...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
