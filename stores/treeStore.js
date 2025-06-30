import { defineStore } from 'pinia'

export const useTreeStore = defineStore('tree', {
    state: () => ({
        tree: null,
        selectedNodeId: null,
        history: [],
        historyIndex: -1,
        maxHistorySize: 50,
        isUndoRedo: false, // Flag to prevent saving history during undo/redo
    }),

    getters: {
        hasTree: (state) => state.tree !== null,
        getSelectedNode: (state) => {
            if (!state.selectedNodeId || !state.tree) return null
            return findNodeById(state.tree, state.selectedNodeId)
        },
        getTreeStats: (state) => {
            if (!state.tree) return null

            const stats = {
                totalNodes: 0,
                maxDepth: 0,
                leafNodes: 0,
            }

            const calculateStats = (node, depth = 0) => {
                if (!node) return

                stats.totalNodes++
                stats.maxDepth = Math.max(stats.maxDepth, depth)

                if (!node.left && !node.right) {
                    stats.leafNodes++
                }

                calculateStats(node.left, depth + 1)
                calculateStats(node.right, depth + 1)
            }

            calculateStats(state.tree)
            return stats
        },
        canUndo: (state) => state.historyIndex > 0,
        canRedo: (state) => state.historyIndex < state.history.length - 1,
    },

    actions: {
        // Save current state to history after making changes
        saveToHistory() {
            // Don't save to history during undo/redo operations
            if (this.isUndoRedo) return

            const currentState = JSON.parse(JSON.stringify({
                tree: this.tree,
                selectedNodeId: this.selectedNodeId,
            }))

            // Check if current state is different from the last saved state
            if (this.history.length > 0) {
                const lastState = this.history[this.historyIndex]
                if (JSON.stringify(lastState) === JSON.stringify(currentState)) {
                    return // Skip saving if state hasn't changed
                }
            }

            // Remove any future history if we're in the middle (after undo)
            if (this.historyIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.historyIndex + 1)
            }

            // Add current state to history
            this.history.push(currentState)
            this.historyIndex++

            // Limit history size
            if (this.history.length > this.maxHistorySize) {
                this.history.shift()
                this.historyIndex--
            }
        },

        // Undo last action
        undo() {
            if (this.canUndo) {
                this.isUndoRedo = true
                this.historyIndex--
                const state = this.history[this.historyIndex]

                if (state) {
                    this.tree = state.tree ? JSON.parse(JSON.stringify(state.tree)) : null
                    this.selectedNodeId = state.selectedNodeId
                    localStorage.setItem('binaryTree', JSON.stringify(this.tree))
                }

                this.isUndoRedo = false
            }
        },

        // Redo undone action
        redo() {
            if (this.canRedo) {
                this.isUndoRedo = true
                this.historyIndex++
                const state = this.history[this.historyIndex]

                if (state) {
                    this.tree = state.tree ? JSON.parse(JSON.stringify(state.tree)) : null
                    this.selectedNodeId = state.selectedNodeId
                    localStorage.setItem('binaryTree', JSON.stringify(this.tree))
                }

                this.isUndoRedo = false
            }
        },

        // Create root node
        createRoot(value) {
            this.tree = {
                id: generateId(),
                value: value,
                left: null,
                right: null,
                color: '#3b82f6',
                annotation: '',
            }
            this.saveToHistory()
            this.saveToLocalStorage()
        },

        // Add left child node
        addLeftChild(parentId, value) {
            const parent = findNodeById(this.tree, parentId)
            if (parent && !parent.left) {
                parent.left = {
                    id: generateId(),
                    value: value,
                    left: null,
                    right: null,
                    color: '#3b82f6',
                    annotation: '',
                }
                this.saveToHistory()
                this.saveToLocalStorage()
            }
        },

        // Add right child node
        addRightChild(parentId, value) {
            const parent = findNodeById(this.tree, parentId)
            if (parent && !parent.right) {
                parent.right = {
                    id: generateId(),
                    value: value,
                    left: null,
                    right: null,
                    color: '#3b82f6',
                    annotation: '',
                }
                this.saveToHistory()
                this.saveToLocalStorage()
            }
        },

        // Edit node value
        editNode(nodeId, newValue) {
            const node = findNodeById(this.tree, nodeId)
            if (node) {
                node.value = newValue
                this.saveToHistory()
                this.saveToLocalStorage()
            }
        },

        // Change node color
        changeNodeColor(nodeId, color) {
            const node = findNodeById(this.tree, nodeId)
            if (node) {
                node.color = color
                this.saveToHistory()
                this.saveToLocalStorage()
            }
        },

        // Change node annotation
        changeNodeAnnotation(nodeId, annotation) {
            const node = findNodeById(this.tree, nodeId)
            if (node) {
                node.annotation = annotation
                this.saveToHistory()
                this.saveToLocalStorage()
            }
        },

        // Delete node with subtree
        deleteNode(nodeId) {
            if (this.tree && this.tree.id === nodeId) {
                this.tree = null
                this.selectedNodeId = null
            } else {
                deleteNodeFromTree(this.tree, nodeId)
                if (this.selectedNodeId === nodeId) {
                    this.selectedNodeId = null
                }
            }
            this.saveToHistory()
            this.saveToLocalStorage()
        },

        // Select node
        selectNode(nodeId) {
            this.selectedNodeId = nodeId
        },

        // Deselect node
        deselectNode() {
            this.selectedNodeId = null
        },

        // Save to localStorage
        saveToLocalStorage() {
            localStorage.setItem('binaryTree', JSON.stringify(this.tree))
        },

        // Load from localStorage
        loadFromLocalStorage() {
            const saved = localStorage.getItem('binaryTree')
            if (saved) {
                this.tree = JSON.parse(saved)
                // Ensure backward compatibility - add colors and annotations if missing
                addMissingProperties(this.tree)
            }
            // Initialize history with the loaded state
            this.history = []
            this.historyIndex = -1

            // Save the current state (loaded or empty) as initial history entry
            const initialState = JSON.parse(JSON.stringify({
                tree: this.tree,
                selectedNodeId: this.selectedNodeId,
            }))
            this.history.push(initialState)
            this.historyIndex = 0
        },

        // Clear tree
        clearTree() {
            this.tree = null
            this.selectedNodeId = null
            this.saveToHistory()
            this.saveToLocalStorage()
        },

        // Move node (drag and drop)
        moveNode(sourceNodeId, targetNodeId, position) {
            if (sourceNodeId === targetNodeId) return false

            // Check that target is not a descendant of source (prevent cycles)
            if (isDescendant(this.tree, targetNodeId, sourceNodeId)) return false

            const sourceNode = findNodeById(this.tree, sourceNodeId)
            const targetNode = findNodeById(this.tree, targetNodeId)

            if (!sourceNode || !targetNode) return false

            // Check that target position is free
            if (position === 'left' && targetNode.left) return false
            if (position === 'right' && targetNode.right) return false

            // Remove node from current position
            if (this.tree.id === sourceNodeId) {
                // Cannot move root node
                return false
            } else {
                removeNodeFromTree(this.tree, sourceNodeId)
            }

            // Add node to new position
            if (position === 'left') {
                targetNode.left = sourceNode
            } else {
                targetNode.right = sourceNode
            }

            this.saveToHistory()
            this.saveToLocalStorage()
            return true
        },

        // Export tree to JSON
        exportTree() {
            return JSON.stringify(this.tree, null, 2)
        },

        // Import tree from JSON
        importTree(jsonString) {
            try {
                const importedTree = JSON.parse(jsonString)
                if (validateTreeStructure(importedTree)) {
                    this.tree = importedTree
                    this.selectedNodeId = null
                    this.saveToHistory()
                    this.saveToLocalStorage()
                    return { success: true }
                } else {
                    return { success: false, error: 'Invalid tree structure' }
                }
            } catch (error) {
                return { success: false, error: `Invalid JSON format ${error}` }
            }
        },

        // Load example tree
        loadExampleTree(exampleType) {
            // Change tree first
            switch (exampleType) {
            case 'simple':
                this.tree = {
                    id: generateId(),
                    value: 'A',
                    color: '#ef4444',
                    annotation: 'Root',
                    left: {
                        id: generateId(),
                        value: 'B',
                        color: '#10b981',
                        annotation: 'Left child',
                        left: null,
                        right: null,
                    },
                    right: {
                        id: generateId(),
                        value: 'C',
                        color: '#3b82f6',
                        annotation: 'Right child',
                        left: null,
                        right: null,
                    },
                }
                break
            case 'numbers':
                this.tree = {
                    id: generateId(),
                    value: '10',
                    color: '#8b5cf6',
                    annotation: 'Root',
                    left: {
                        id: generateId(),
                        value: '5',
                        color: '#06b6d4',
                        annotation: 'Left subtree',
                        left: {
                            id: generateId(),
                            value: '2',
                            color: '#84cc16',
                            annotation: '',
                            left: null,
                            right: null,
                        },
                        right: {
                            id: generateId(),
                            value: '7',
                            color: '#f59e0b',
                            annotation: '',
                            left: null,
                            right: null,
                        },
                    },
                    right: {
                        id: generateId(),
                        value: '15',
                        color: '#ec4899',
                        annotation: 'Right subtree',
                        left: null,
                        right: {
                            id: generateId(),
                            value: '20',
                            color: '#ef4444',
                            annotation: '',
                            left: null,
                            right: null,
                        },
                    },
                }
                break
            case 'complex':
                this.tree = {
                    id: generateId(),
                    value: 'Root',
                    color: '#1f2937',
                    annotation: 'Main root',
                    left: {
                        id: generateId(),
                        value: 'L1',
                        color: '#059669',
                        annotation: 'Left branch',
                        left: {
                            id: generateId(),
                            value: 'L2',
                            color: '#0284c7',
                            annotation: '',
                            left: {
                                id: generateId(),
                                value: 'L3',
                                color: '#7c3aed',
                                annotation: 'Deep left',
                                left: null,
                                right: null,
                            },
                            right: null,
                        },
                        right: {
                            id: generateId(),
                            value: 'R2',
                            color: '#dc2626',
                            annotation: '',
                            left: null,
                            right: null,
                        },
                    },
                    right: {
                        id: generateId(),
                        value: 'R1',
                        color: '#ea580c',
                        annotation: 'Right branch',
                        left: {
                            id: generateId(),
                            value: 'L2',
                            color: '#65a30d',
                            annotation: '',
                            left: null,
                            right: null,
                        },
                        right: {
                            id: generateId(),
                            value: 'R2',
                            color: '#db2777',
                            annotation: '',
                            left: null,
                            right: {
                                id: generateId(),
                                value: 'R3',
                                color: '#0891b2',
                                annotation: 'Deep right',
                                left: null,
                                right: null,
                            },
                        },
                    },
                }
                break
            }
            this.selectedNodeId = null
            this.saveToHistory()
            this.saveToLocalStorage()
        },
    },
})

// Helper functions
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9)
}

function findNodeById(node, id) {
    if (!node) return null
    if (node.id === id) return node

    const leftResult = findNodeById(node.left, id)
    if (leftResult) return leftResult

    return findNodeById(node.right, id)
}

function deleteNodeFromTree(node, targetId) {
    if (!node) return false

    if (node.left && node.left.id === targetId) {
        node.left = null
        return true
    }

    if (node.right && node.right.id === targetId) {
        node.right = null
        return true
    }

    return deleteNodeFromTree(node.left, targetId) || deleteNodeFromTree(node.right, targetId)
}

// Remove node from tree (for drag and drop)
function removeNodeFromTree(node, targetId) {
    if (!node) return null

    if (node.left && node.left.id === targetId) {
        const removedNode = node.left
        node.left = null
        return removedNode
    }

    if (node.right && node.right.id === targetId) {
        const removedNode = node.right
        node.right = null
        return removedNode
    }

    return removeNodeFromTree(node.left, targetId) || removeNodeFromTree(node.right, targetId)
}

// Check if node is descendant of another node
function isDescendant(tree, ancestorId, descendantId) {
    const ancestor = findNodeById(tree, ancestorId)
    if (!ancestor) return false

    const checkDescendant = (node) => {
        if (!node) return false
        if (node.id === descendantId) return true
        return checkDescendant(node.left) || checkDescendant(node.right)
    }

    return checkDescendant(ancestor.left) || checkDescendant(ancestor.right)
}

// Validate tree structure
function validateTreeStructure(node) {
    if (!node) return true

    if (!node.id || node.value === undefined) return false

    return validateTreeStructure(node.left) && validateTreeStructure(node.right)
}

// Add missing properties (for backward compatibility)
function addMissingProperties(node) {
    if (!node) return

    if (!node.color) node.color = '#3b82f6'
    if (node.annotation === undefined) node.annotation = ''

    addMissingProperties(node.left)
    addMissingProperties(node.right)
}
