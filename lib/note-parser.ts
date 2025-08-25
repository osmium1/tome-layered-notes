export interface NoteNode {
  id: string
  level: number
  content: string
  children: NoteNode[]
  isExpanded?: boolean
}

export function parseNoteContent(content: string): NoteNode[] {
  const lines = content.split("\n").filter((line) => line.trim() !== "")
  const nodes: NoteNode[] = []
  const stack: NoteNode[] = []

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    // Parse markdown headers with layer tags
    const headerMatch = trimmedLine.match(/^(#{1,6})\s*\[L(\d+)\]\s*(.+)$/)
    if (headerMatch) {
      const [, hashes, levelStr, content] = headerMatch
      const level = Number.parseInt(levelStr)

      const node: NoteNode = {
        id: `node-${index}`,
        level,
        content: content.trim(),
        children: [],
        isExpanded: false,
      }

      // Find the correct parent based on level
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      if (stack.length === 0) {
        nodes.push(node)
      } else {
        stack[stack.length - 1].children.push(node)
      }

      stack.push(node)
    } else {
      // Handle regular content lines (treat as continuation of previous node)
      if (stack.length > 0) {
        const lastNode = stack[stack.length - 1]
        lastNode.content += " " + trimmedLine
      }
    }
  })

  return nodes
}

export function expandAllNodes(nodes: NoteNode[]): NoteNode[] {
  return nodes.map((node) => ({
    ...node,
    isExpanded: true,
    children: expandAllNodes(node.children),
  }))
}

export function collapseAllNodes(nodes: NoteNode[]): NoteNode[] {
  return nodes.map((node) => ({
    ...node,
    isExpanded: false,
    children: collapseAllNodes(node.children),
  }))
}

export function updateNodeContent(nodes: NoteNode[], nodeId: string, newContent: string): NoteNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, content: newContent }
    }
    return {
      ...node,
      children: updateNodeContent(node.children, nodeId, newContent),
    }
  })
}

export function toggleNodeExpansion(nodes: NoteNode[], nodeId: string): NoteNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, isExpanded: !node.isExpanded }
    }
    return {
      ...node,
      children: toggleNodeExpansion(node.children, nodeId),
    }
  })
}
