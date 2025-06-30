<script setup>
import TreeStats from './TreeStats.vue'
import NodeInfoPanel from './NodeInfoPanel.vue'
import HotkeysHelp from './HotkeysHelp.vue'

defineProps({
    hasTree: {
        type: Boolean,
        required: true,
    },
    canUndo: {
        type: Boolean,
        required: true,
    },
    canRedo: {
        type: Boolean,
        required: true,
    },
    treeStats: {
        type: Object,
        default: null,
    },
    selectedNode: {
        type: Object,
        default: null,
    },
})

defineEmits([
    'createRoot',
    'undo',
    'redo',
    'importExport',
    'clearTree',
    'loadExample',
])

const treeActions = [
    {
        action: 'createRoot',
        label: 'New Tree',
        classes: 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200',
    },
    {
        action: 'undo',
        label: '↶ Undo',
        classes: 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
        title: 'Undo (Ctrl+Z)',
        disabled: (props) => !props.canUndo,
    },
    {
        action: 'redo',
        label: '↷ Redo',
        classes: 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
        title: 'Redo (Ctrl+Y)',
        disabled: (props) => !props.canRedo,
    },
    {
        action: 'importExport',
        label: '📥📤 Import/Export',
        classes: 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200',
    },
    {
        action: 'clearTree',
        label: '🗑️ Clear Tree',
        classes: 'bg-red-500 text-white hover:bg-red-600',
    },
]

const examples = [
    { type: 'simple', label: 'Simple' },
    { type: 'numbers', label: 'Numbers' },
    { type: 'complex', label: 'Complex' },
]
</script>

<template>
    <div class="md:max-h-screen overflow-y-auto bg-white p-6 shadow-lg border-r border-gray-200 md:w-80 w-full">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">
            Binary Tree Visualizer
        </h2>

        <div class="mb-6">
            <!-- Create root node button -->
            <button
                v-if="!hasTree"
                class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors mb-4"
                @click="$emit('createRoot')"
            >
                Create Root Node
            </button>

            <!-- Tree management buttons -->
            <div
                v-if="hasTree"
                class="flex flex-col gap-2 mb-4"
            >
                <button
                    v-for="action in treeActions"
                    :key="action.action"
                    :disabled="action.disabled?.({ canUndo, canRedo })"
                    :title="action.title"
                    class="w-full px-4 py-2 rounded-lg font-semibold transition-colors"
                    :class="action.classes"
                    @click="$emit(action.action)"
                >
                    {{ action.label }}
                </button>
            </div>

            <!-- Example trees -->
            <div class="flex flex-col gap-2">
                <label class="font-semibold text-gray-700 mb-1">Examples:</label>
                <button
                    v-for="example in examples"
                    :key="example.type"
                    class="w-full px-4 py-2 bg-transparent text-blue-500 border border-blue-500 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-colors"
                    @click="$emit('loadExample', example.type)"
                >
                    {{ example.label }}
                </button>
            </div>
        </div>

        <!-- Tree Statistics -->
        <TreeStats
            v-if="hasTree && treeStats"
            :stats="treeStats"
        />

        <!-- Selected Node Info -->
        <NodeInfoPanel
            v-if="selectedNode"
            :node="selectedNode"
        />

        <!-- Hotkeys Help -->
        <HotkeysHelp />
    </div>
</template>
