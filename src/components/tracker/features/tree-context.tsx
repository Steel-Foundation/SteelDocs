import * as React from "react"
import memoizeOne from "memoize-one"
import type { TreeNode } from "./tree-types"
import { getPathToItem } from "./tree-utils"

export type TreeContextValue = {
  uniqueContextId: symbol
  getPathToItem: (targetId: string) => string[]
  onToggleExpand: (itemId: string) => void
  onMove: (itemId: string, newParentId: string | undefined) => void
  registerElement: (itemId: string, element: HTMLElement) => () => void
}

export const TreeContext = React.createContext<TreeContextValue>({} as TreeContextValue)

export function makeTreeContext(
  treeRef: React.MutableRefObject<TreeNode[]>,
  onToggleExpand: (itemId: string) => void,
  onMove: (itemId: string, newParentId: string | undefined) => void,
  registryRef: React.MutableRefObject<Map<string, HTMLElement>>,
): TreeContextValue {
  return {
    uniqueContextId: Symbol("tree"),
    getPathToItem: memoizeOne((targetId: string) => getPathToItem(treeRef.current, targetId) ?? []),
    onToggleExpand,
    onMove,
    registerElement: (itemId, element) => {
      registryRef.current.set(itemId, element)
      return () => { registryRef.current.delete(itemId) }
    },
  }
}
