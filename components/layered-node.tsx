"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, ChevronDown } from "lucide-react"
import type { NoteNode } from "@/lib/note-parser"

interface LayeredNodeProps {
  node: NoteNode
  onToggleExpansion: (nodeId: string) => void
  onUpdateContent: (nodeId: string, content: string) => void
}

export function LayeredNode({ node, onToggleExpansion, onUpdateContent }: LayeredNodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(node.content)

  const handleToggle = () => {
    if (node.children.length > 0) {
      onToggleExpansion(node.id)
    }
  }

  const handleContentClick = () => {
    setIsEditing(true)
    setEditContent(node.content)
  }

  const handleSave = () => {
    onUpdateContent(node.id, editContent)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditContent(node.content)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const getNodeStyles = () => {
    switch (node.level) {
      case 1:
        return "text-xl font-semibold text-foreground mb-3"
      case 2:
        return "inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium mb-2 border border-primary/30"
      case 3:
        return "text-base text-foreground leading-relaxed"
      case 4:
        return "text-sm text-muted-foreground leading-relaxed"
      default:
        return "text-sm text-muted-foreground"
    }
  }

  const getIndentation = () => {
    return `${(node.level - 1) * 24}px`
  }

  return (
    <div className="relative" style={{ marginLeft: getIndentation() }}>
      {/* Connecting line for hierarchy */}
      {node.level > 1 && (
        <div
          className="absolute left-0 top-0 w-px bg-border opacity-30"
          style={{
            height: "100%",
            left: "-12px",
          }}
        />
      )}

      <div className="flex items-start space-x-2 mb-2">
        {/* Disclosure control */}
        {node.children.length > 0 && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 mt-1 flex-shrink-0" onClick={handleToggle}>
            {node.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-sm"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors ${getNodeStyles()}`}
              onClick={handleContentClick}
            >
              {node.level === 2 ? (
                <span className={getNodeStyles()}>{node.content}</span>
              ) : (
                <span className={getNodeStyles()}>{node.content}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {node.isExpanded && node.children.length > 0 && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <LayeredNode
              key={child.id}
              node={child}
              onToggleExpansion={onToggleExpansion}
              onUpdateContent={onUpdateContent}
            />
          ))}
        </div>
      )}
    </div>
  )
}
