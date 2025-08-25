"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { generateExportData, downloadExportFile, getAllAvailableBinders, type ExportBinder } from "@/lib/export-import"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [exportType, setExportType] = useState<"all" | "selected">("all")
  const [selectedBinders, setSelectedBinders] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [availableBinders] = useState<ExportBinder[]>(getAllAvailableBinders())

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const binderIds = exportType === "all" ? undefined : selectedBinders
      const exportData = generateExportData(binderIds)
      downloadExportFile(exportData)
      onClose()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
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
    setSelectedBinders(availableBinders.map((binder) => binder.id))
  }

  const handleDeselectAll = () => {
    setSelectedBinders([])
  }

  const isExportDisabled = exportType === "selected" && selectedBinders.length === 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Your Data</DialogTitle>
          <DialogDescription>Choose what data you want to export as a JSON file.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <RadioGroup value={exportType} onValueChange={(value) => setExportType(value as "all" | "selected")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="export-all" />
              <Label htmlFor="export-all">Export Entire Account</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="selected" id="export-selected" />
              <Label htmlFor="export-selected">Select Binders to Export</Label>
            </div>
          </RadioGroup>

          {exportType === "selected" && (
            <div className="space-y-4">
              <div className="flex space-x-4 text-sm">
                <button type="button" onClick={handleSelectAll} className="text-accent hover:underline">
                  Select All
                </button>
                <button type="button" onClick={handleDeselectAll} className="text-accent hover:underline">
                  Deselect All
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableBinders.map((binder) => (
                  <div key={binder.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`binder-${binder.id}`}
                      checked={selectedBinders.includes(binder.id)}
                      onCheckedChange={(checked) => handleBinderToggle(binder.id, checked as boolean)}
                    />
                    <Label htmlFor={`binder-${binder.id}`} className="text-sm">
                      {binder.title} ({binder.notebooks.length} notebooks)
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExportDisabled || isExporting}>
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
