"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { ExportModal } from "@/components/export-modal"
import { ImportModal } from "@/components/import-modal"

export default function SettingsPage() {
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const handleImportData = () => {
    setShowImportModal(true)
  }

  const handleExportData = () => {
    setShowExportModal(true)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath="/settings" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <header className="border-b border-border bg-background px-6 py-4">
          <div className="ml-12 md:ml-0">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-2xl space-y-8">
            {/* Appearance Section */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how Tome looks and feels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Theme</h3>
                    <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            {/* Data Management Section */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Import and export your learning data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Import Data</h3>
                    <p className="text-sm text-muted-foreground">Import binders and notes from a JSON file</p>
                  </div>
                  <Button variant="secondary" onClick={handleImportData}>
                    Import Data
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Export Data</h3>
                    <p className="text-sm text-muted-foreground">Download all your data as a JSON file</p>
                  </div>
                  <Button variant="secondary" onClick={handleExportData}>
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
      <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  )
}
