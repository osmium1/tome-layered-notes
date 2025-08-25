export interface ExportNote {
  id: string
  title: string
  content: string
  createdDate: string
  modifiedDate: string
}

export interface ExportNotebook {
  id: string
  title: string
  createdDate: string
  modifiedDate: string
  notes: ExportNote[]
}

export interface ExportBinder {
  id: string
  title: string
  createdDate: string
  modifiedDate: string
  notebooks: ExportNotebook[]
}

export interface ExportData {
  version: string
  exportDate: string
  binders: ExportBinder[]
}

// Mock data for demonstration
const mockExportData: ExportData = {
  version: "1.0",
  exportDate: new Date().toISOString(),
  binders: [
    {
      id: "sample-1",
      title: "Sample Binder",
      createdDate: "2023-10-26T09:00:00Z",
      modifiedDate: "2023-10-27T10:00:00Z",
      notebooks: [
        {
          id: "notebook-1",
          title: "Sample Notebook",
          createdDate: "2023-10-26T09:30:00Z",
          modifiedDate: "2023-10-26T11:30:00Z",
          notes: [
            {
              id: "note-1",
              title: "Mitochondria - The Powerhouse",
              content:
                "# [L1] The Mitochondria - Powerhouse of the Cell Mnemonic\n## [L2] ATP Production\n### [L3] Cellular respiration occurs here, converting glucose and oxygen into ATP.\n#### [L4] Example: Krebs Cycle and Electron Transport Chain.",
              createdDate: "2023-10-26T09:00:00Z",
              modifiedDate: "2023-10-26T11:30:00Z",
            },
          ],
        },
      ],
    },
  ],
}

export function generateExportData(selectedBinderIds?: string[]): ExportData {
  // In a real app, this would fetch data from the database
  const allBinders = mockExportData.binders

  const bindersToExport = selectedBinderIds
    ? allBinders.filter((binder) => selectedBinderIds.includes(binder.id))
    : allBinders

  return {
    version: "1.0",
    exportDate: new Date().toISOString(),
    binders: bindersToExport,
  }
}

export function downloadExportFile(data: ExportData) {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `tome_export_${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function validateImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    if (file.type !== "application/json") {
      reject(new Error("File must be a JSON file"))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content) as ExportData

        // Basic validation
        if (!data.version || !data.binders || !Array.isArray(data.binders)) {
          reject(new Error("Invalid file format"))
          return
        }

        resolve(data)
      } catch (error) {
        reject(new Error("Invalid JSON file"))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

export function getAllAvailableBinders(): ExportBinder[] {
  // In a real app, this would fetch from the database
  return mockExportData.binders
}
