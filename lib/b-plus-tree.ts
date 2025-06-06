// Implementation of B+ Tree for efficient bin data storage and retrieval

import type { Bin } from "./types"

// B+ Tree Node
class BPlusTreeNode {
  keys: number[]
  children: BPlusTreeNode[]
  values: (Bin | null)[]
  isLeaf: boolean
  next: BPlusTreeNode | null

  constructor(isLeaf = false) {
    this.keys = []
    this.children = []
    this.values = []
    this.isLeaf = isLeaf
    this.next = null
  }
}

// B+ Tree implementation
export class BPlusTree {
  root: BPlusTreeNode
  order: number

  constructor(order = 5) {
    this.root = new BPlusTreeNode(true)
    this.order = order
  }

  // Insert a key-value pair into the tree
  insert(key: number, value: Bin): void {
    // If the root is full, split it
    if (this.root.keys.length === 2 * this.order - 1) {
      const newRoot = new BPlusTreeNode(false)
      newRoot.children.push(this.root)
      this.splitChild(newRoot, 0)
      this.root = newRoot
    }
    this.insertNonFull(this.root, key, value)
  }

  // Split a child node
  private splitChild(parentNode: BPlusTreeNode, index: number): void {
    const childNode = parentNode.children[index]
    const newNode = new BPlusTreeNode(childNode.isLeaf)

    // Move keys and children to the new node
    const midIndex = this.order - 1

    for (let i = 0; i < this.order - 1; i++) {
      newNode.keys.push(childNode.keys[midIndex + 1 + i])
    }

    if (!childNode.isLeaf) {
      for (let i = 0; i < this.order; i++) {
        newNode.children.push(childNode.children[midIndex + 1 + i])
      }
      childNode.children.splice(midIndex + 1)
    } else {
      // For leaf nodes, copy values
      for (let i = 0; i < this.order - 1; i++) {
        newNode.values.push(childNode.values[midIndex + 1 + i])
      }
      childNode.values.splice(midIndex + 1)

      // Set up leaf node pointers
      newNode.next = childNode.next
      childNode.next = newNode
    }

    // Update parent node
    parentNode.keys.splice(index, 0, childNode.keys[midIndex])
    parentNode.children.splice(index + 1, 0, newNode)

    // Update child node
    childNode.keys.splice(midIndex)
  }

  // Insert into a non-full node
  private insertNonFull(node: BPlusTreeNode, key: number, value: Bin): void {
    let i = node.keys.length - 1

    if (node.isLeaf) {
      // Insert into leaf node
      while (i >= 0 && key < node.keys[i]) {
        node.keys[i + 1] = node.keys[i]
        node.values[i + 1] = node.values[i]
        i--
      }

      node.keys[i + 1] = key
      node.values[i + 1] = value
    } else {
      // Find the child to insert into
      while (i >= 0 && key < node.keys[i]) {
        i--
      }
      i++

      // If child is full, split it
      if (node.children[i].keys.length === 2 * this.order - 1) {
        this.splitChild(node, i)
        if (key > node.keys[i]) {
          i++
        }
      }

      this.insertNonFull(node.children[i], key, value)
    }
  }

  // Search for a key in the tree
  search(key: number): Bin | null {
    return this.searchNode(this.root, key)
  }

  // Search for a key in a node
  private searchNode(node: BPlusTreeNode, key: number): Bin | null {
    let i = 0
    while (i < node.keys.length && key > node.keys[i]) {
      i++
    }

    if (node.isLeaf) {
      if (i < node.keys.length && key === node.keys[i]) {
        return node.values[i]
      }
      return null
    }

    return this.searchNode(node.children[i], key)
  }

  // Get all values in the tree
  getAll(): Bin[] {
    const result: Bin[] = []
    let current = this.findLeftmostLeaf(this.root)

    while (current !== null) {
      for (let i = 0; i < current.keys.length; i++) {
        if (current.values[i] !== null) {
          result.push(current.values[i] as Bin)
        }
      }
      current = current.next
    }

    return result
  }

  // Find the leftmost leaf node
  private findLeftmostLeaf(node: BPlusTreeNode): BPlusTreeNode {
    if (node.isLeaf) {
      return node
    }
    return this.findLeftmostLeaf(node.children[0])
  }

  // Clear the tree
  clear(): void {
    this.root = new BPlusTreeNode(true)
  }
}
