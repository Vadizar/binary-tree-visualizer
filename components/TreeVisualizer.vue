<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTreeStore } from '../stores/treeStore'
import TreeNode from './TreeNode.vue'
import ControlPanel from './ControlPanel.vue'
import CreateRoot from './dialogs/CreateRoot.vue'
import AddChild from './dialogs/AddChild.vue'
import EditNode from './dialogs/EditNode.vue'
import ColorPicker from './dialogs/ColorPicker.vue'
import Annotation from './dialogs/Annotation.vue'
import ImportExport from './dialogs/ImportExport.vue'

const treeStore = useTreeStore()

// Dialog states
const showCreateRootDialog = ref(false)
const showAddChildDialog = ref(false)
const showEditNodeDialog = ref(false)
const showColorDialog = ref(false)
const showAnnotationDialog = ref(false)
const showImportExportDialog = ref(false)

// Form data
const editNodeValue = ref('')
const annotationValue = ref('')
const pendingParentId = ref(null)
const pendingChildPosition = ref('')
const pendingEditNodeId = ref(null)
const pendingColorNodeId = ref(null)
const pendingAnnotationNodeId = ref(null)

// Color picker
const selectedColor = ref('#3b82f6')

// Import/Export dialog ref
const importExportRef = ref(null)

// Computed properties
const exportData = computed(() => {
    return treeStore.exportTree()
})

// Tree actions
const createRoot = (value) => {
    treeStore.createRoot(value)
    showCreateRootDialog.value = false
}

const clearTree = () => {
    if (confirm('Are you sure you want to clear the entire tree? This action cannot be undone through the history.')) {
        treeStore.clearTree()
    }
}

const loadExample = (type) => {
    treeStore.loadExampleTree(type)
}

const undo = () => {
    treeStore.undo()
}

const redo = () => {
    treeStore.redo()
}

// Node event handlers
const handleNodeClick = (nodeId) => {
    treeStore.selectNode(nodeId)
}

const handleAddChild = (parentId, position) => {
    pendingParentId.value = parentId
    pendingChildPosition.value = position
    showAddChildDialog.value = true
}

const addChild = (value) => {
    if (pendingChildPosition.value === 'left') {
        treeStore.addLeftChild(pendingParentId.value, value)
    } else {
        treeStore.addRightChild(pendingParentId.value, value)
    }
    closeAddChildDialog()
}

const closeAddChildDialog = () => {
    showAddChildDialog.value = false
    pendingParentId.value = null
    pendingChildPosition.value = ''
}

const handleEditNode = (nodeId) => {
    const node = treeStore.tree && findNodeById(treeStore.tree, nodeId)
    if (node) {
        pendingEditNodeId.value = nodeId
        editNodeValue.value = node.value
        showEditNodeDialog.value = true
    }
}

const editNode = (value) => {
    treeStore.editNode(pendingEditNodeId.value, value)
    closeEditNodeDialog()
}

const closeEditNodeDialog = () => {
    showEditNodeDialog.value = false
    editNodeValue.value = ''
    pendingEditNodeId.value = null
}

const handleDeleteNode = (nodeId) => {
    if (confirm('Are you sure you want to delete this node and its subtree?')) {
        treeStore.deleteNode(nodeId)
    }
}

const handleChangeColor = (nodeId) => {
    const node = treeStore.tree && findNodeById(treeStore.tree, nodeId)
    if (node) {
        pendingColorNodeId.value = nodeId
        selectedColor.value = node.color
        showColorDialog.value = true
    }
}

const changeColor = (color) => {
    treeStore.changeNodeColor(pendingColorNodeId.value, color)
    closeColorDialog()
}

const closeColorDialog = () => {
    showColorDialog.value = false
    pendingColorNodeId.value = null
    selectedColor.value = '#3b82f6'
}

const handleChangeAnnotation = (nodeId) => {
    const node = treeStore.tree && findNodeById(treeStore.tree, nodeId)
    if (node) {
        pendingAnnotationNodeId.value = nodeId
        annotationValue.value = node.annotation || ''
        showAnnotationDialog.value = true
    }
}

const changeAnnotation = (annotation) => {
    treeStore.changeNodeAnnotation(pendingAnnotationNodeId.value, annotation)
    closeAnnotationDialog()
}

const closeAnnotationDialog = () => {
    showAnnotationDialog.value = false
    annotationValue.value = ''
    pendingAnnotationNodeId.value = null
}

const handleMoveNode = (moveData) => {
    const success = treeStore.moveNode(moveData.sourceNodeId, moveData.targetNodeId, moveData.position)
    if (!success) {
        alert('Cannot move node: target position is occupied or would create a cycle')
    }
}

// Import/Export functions
const handleImportTree = (data) => {
    const result = treeStore.importTree(data)
    importExportRef.value?.handleImportResult(result)
}

// Helper function to find node by ID
const findNodeById = (node, id) => {
    if (!node) return null
    if (node.id === id) return node

    const leftResult = findNodeById(node.left, id)
    if (leftResult) return leftResult

    return findNodeById(node.right, id)
}

// Keyboard event handlers
const handleKeydown = (event) => {
    // Skip if user is typing in an input or textarea
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
    }

    // Skip if any dialog is open
    if (showCreateRootDialog.value || showAddChildDialog.value || showEditNodeDialog.value ||
        showColorDialog.value || showAnnotationDialog.value || showImportExportDialog.value) {
        return
    }

    const selectedNodeId = treeStore.selectedNodeId

    switch (event.key) {
    case 'Enter':
        if (selectedNodeId) {
            event.preventDefault()
            handleEditNode(selectedNodeId)
        }
        break
    case 'ArrowLeft':
        if (selectedNodeId) {
            const selectedNode = treeStore.tree && findNodeById(treeStore.tree, selectedNodeId)
            if (selectedNode && !selectedNode.left) {
                event.preventDefault()
                handleAddChild(selectedNodeId, 'left')
            }
        }
        break
    case 'ArrowRight':
        if (selectedNodeId) {
            const selectedNode = treeStore.tree && findNodeById(treeStore.tree, selectedNodeId)
            if (selectedNode && !selectedNode.right) {
                event.preventDefault()
                handleAddChild(selectedNodeId, 'right')
            }
        }
        break
    case 'Delete':
    case 'Backspace':
        if (selectedNodeId) {
            event.preventDefault()
            handleDeleteNode(selectedNodeId)
        }
        break
    case 'Escape':
        // Close any open dialog first, then deselect node
        if (showCreateRootDialog.value) {
            showCreateRootDialog.value = false
        } else if (showAddChildDialog.value) {
            closeAddChildDialog()
        } else if (showEditNodeDialog.value) {
            closeEditNodeDialog()
        } else if (showColorDialog.value) {
            closeColorDialog()
        } else if (showAnnotationDialog.value) {
            closeAnnotationDialog()
        } else if (showImportExportDialog.value) {
            showImportExportDialog.value = false
        } else {
            treeStore.deselectNode()
        }
        event.preventDefault()
        break
    case 'c':
    case 'C':
        if (selectedNodeId) {
            handleChangeColor(selectedNodeId)
        }
        break
    case 'a':
    case 'A':
        if (selectedNodeId) {
            handleChangeAnnotation(selectedNodeId)
        }
        break
    case 'z':
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            undo()
        }
        break
    case 'y':
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            redo()
        }
        break
    }
}

// Lifecycle
onMounted(() => {
    treeStore.loadFromLocalStorage()
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <div class="flex min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 md:flex-row flex-col">
        <!-- Control Panel Component -->
        <ControlPanel
            :has-tree="treeStore.hasTree"
            :can-undo="treeStore.canUndo"
            :can-redo="treeStore.canRedo"
            :tree-stats="treeStore.getTreeStats"
            :selected-node="treeStore.getSelectedNode"
            @create-root="showCreateRootDialog = true"
            @undo="undo"
            @redo="redo"
            @import-export="showImportExportDialog = true"
            @clear-tree="clearTree"
            @load-example="loadExample"
        />

        <!-- Tree display area -->
        <div class="md:max-h-screen overflow-y-auto p-6 flex-1 grid items-center justify-center">
            <div
                v-if="!treeStore.hasTree"
                class="text-center text-white"
            >
                <div class="space-y-4">
                    <h3 class="text-3xl font-bold opacity-90">
                        🌳 Create Your Binary Tree
                    </h3>
                    <p class="text-lg opacity-70">
                        Start by creating a root node or loading one of the example trees.
                    </p>
                </div>
            </div>

            <div
                v-else
                class="flex items-start justify-center min-w-full"
            >
                <TreeNode
                    :node="treeStore.tree"
                    :selected-node-id="treeStore.selectedNodeId"
                    @node-click="handleNodeClick"
                    @add-child="handleAddChild"
                    @edit-node="handleEditNode"
                    @delete-node="handleDeleteNode"
                    @change-color="handleChangeColor"
                    @change-annotation="handleChangeAnnotation"
                    @move-node="handleMoveNode"
                />
            </div>
        </div>

        <!-- Create Root Dialog -->
        <CreateRoot
            :is-visible="showCreateRootDialog"
            @close="showCreateRootDialog = false"
            @create="createRoot"
        />

        <!-- Add Child Dialog -->
        <AddChild
            :is-visible="showAddChildDialog"
            :child-position="pendingChildPosition"
            @close="closeAddChildDialog"
            @add="addChild"
        />

        <!-- Edit Node Dialog -->
        <EditNode
            :is-visible="showEditNodeDialog"
            :node-value="editNodeValue"
            @close="closeEditNodeDialog"
            @save="editNode"
        />

        <!-- Color Picker Dialog -->
        <ColorPicker
            :is-visible="showColorDialog"
            :current-color="selectedColor"
            @close="closeColorDialog"
            @apply="changeColor"
        />

        <!-- Annotation Dialog -->
        <Annotation
            :is-visible="showAnnotationDialog"
            :current-annotation="annotationValue"
            @close="closeAnnotationDialog"
            @save="changeAnnotation"
        />

        <!-- Import/Export Dialog -->
        <ImportExport
            ref="importExportRef"
            :is-visible="showImportExportDialog"
            :export-data="exportData"
            @close="showImportExportDialog = false"
            @import="handleImportTree"
        />
    </div>
</template>
