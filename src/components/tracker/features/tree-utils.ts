import type { TreeNode } from "./tree-types"

export function findNode(nodes: TreeNode[], id: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
}

/**
 * Returns the full path of IDs from root to the target (inclusive).
 * e.g. for a grandchild: ["root-id", "parent-id", "target-id"]
 */
export function getPathToItem(nodes: TreeNode[], targetId: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    const current = [...path, node.id]
    if (node.id === targetId) return current
    const found = getPathToItem(node.children, targetId, current)
    if (found) return found
  }
  return null
}

export function removeNode(nodes: TreeNode[], id: string): TreeNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: removeNode(n.children, id) }))
}

export function insertBefore(nodes: TreeNode[], targetId: string, newNode: TreeNode): TreeNode[] {
  const result: TreeNode[] = []
  for (const node of nodes) {
    if (node.id === targetId) result.push(newNode)
    result.push({ ...node, children: insertBefore(node.children, targetId, newNode) })
  }
  return result
}

export function insertAfter(nodes: TreeNode[], targetId: string, newNode: TreeNode): TreeNode[] {
  const result: TreeNode[] = []
  for (const node of nodes) {
    result.push({ ...node, children: insertAfter(node.children, targetId, newNode) })
    if (node.id === targetId) result.push(newNode)
  }
  return result
}

export function insertAsLastChild(nodes: TreeNode[], targetId: string, newNode: TreeNode): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return { ...node, isExpanded: true, children: [...node.children, newNode] }
    }
    return { ...node, children: insertAsLastChild(node.children, targetId, newNode) }
  })
}

export function setExpandedInTree(nodes: TreeNode[], targetId: string, isExpanded: boolean): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) return { ...node, isExpanded }
    return { ...node, children: setExpandedInTree(node.children, targetId, isExpanded) }
  })
}

export function getParentId(nodes: TreeNode[], targetId: string): string | null {
  for (const node of nodes) {
    if (node.children.some((c) => c.id === targetId)) return node.id
    const found = getParentId(node.children, targetId)
    if (found !== null) return found
  }
  return null
}

type FlatFeature = {
  _id: string
  name: string
  completeStatus: boolean
  parentId?: string
}

/**
 * Build a tree from a flat Convex feature list, preserving expanded state.
 */
export function buildTree(features: FlatFeature[], expandedIds: Set<string>): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>()
  for (const f of features) {
    nodeMap.set(f._id, {
      id: f._id as any,
      name: f.name,
      completeStatus: f.completeStatus,
      isExpanded: expandedIds.has(f._id),
      children: [],
    })
  }
  const roots: TreeNode[] = []
  for (const f of features) {
    const node = nodeMap.get(f._id)!
    if (f.parentId && nodeMap.has(f.parentId)) {
      nodeMap.get(f.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}
