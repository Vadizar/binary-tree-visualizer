<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    node: {
        type: Object,
        required: true,
    },
    selectedNodeId: {
        type: String,
        default: null,
    },
    level: {
        type: Number,
        default: 0,
    },
})

const emit = defineEmits(['nodeClick', 'addChild', 'editNode', 'deleteNode', 'changeColor', 'changeAnnotation', 'moveNode'])

const isHovered = ref(false)
const isDragOver = ref(false)
const dragPosition = ref(null) // 'left' or 'right'

const isSelected = computed(() => props.selectedNodeId === props.node.id)
const hasChildren = computed(() => props.node.left || props.node.right)

const nodeActions = computed(() => [
    {
        action: 'addChild',
        params: [props.node.id, 'left'],
        label: '←+',
        title: 'Add left node',
        classes: 'bg-emerald-500 hover:bg-emerald-600',
        condition: !props.node.left,
    },
    {
        action: 'editNode',
        params: [props.node.id],
        label: '✎',
        title: 'Edit',
        classes: 'bg-blue-500 hover:bg-blue-600',
        condition: true,
    },
    {
        action: 'changeColor',
        params: [props.node.id],
        label: '🎨',
        title: 'Change color',
        classes: 'bg-purple-500 hover:bg-purple-600',
        condition: true,
    },
    {
        action: 'changeAnnotation',
        params: [props.node.id],
        label: '📝',
        title: 'Annotation',
        classes: 'bg-amber-500 hover:bg-amber-600',
        condition: true,
    },
    {
        action: 'deleteNode',
        params: [props.node.id],
        label: '✕',
        title: 'Delete node',
        classes: 'bg-red-500 hover:bg-red-600',
        condition: true,
    },
    {
        action: 'addChild',
        params: [props.node.id, 'right'],
        label: '+→',
        title: 'Add right node',
        classes: 'bg-emerald-500 hover:bg-emerald-600',
        condition: !props.node.right,
    },
])

const handleNodeClick = () => {
    emit('nodeClick', props.node.id)
}

const handleAddChild = (nodeId, position) => {
    emit('addChild', nodeId, position)
}

const handleActionClick = (action, params) => {
    if (params.length === 1) {
        emit(action, ...params)
    } else {
        emit(action, ...params)
    }
}

// Drag and Drop handlers
const handleDragStart = (event) => {
    event.dataTransfer.setData('text/plain', props.node.id)
    event.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    // Determine drop position
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2

    if (event.clientX < centerX) {
        dragPosition.value = 'left'
    } else {
        dragPosition.value = 'right'
    }

    isDragOver.value = true
}

const handleDragLeave = () => {
    isDragOver.value = false
    dragPosition.value = null
}

const handleDrop = (event) => {
    event.preventDefault()
    const sourceNodeId = event.dataTransfer.getData('text/plain')

    if (sourceNodeId !== props.node.id) {
        // Emit move event
        emit('moveNode', {
            sourceNodeId,
            targetNodeId: props.node.id,
            position: dragPosition.value,
        })
    }

    isDragOver.value = false
    dragPosition.value = null
}

const handleDragEnd = () => {
    isDragOver.value = false
    dragPosition.value = null
}
</script>

<template>
    <div class="flex flex-col items-center relative m-5 animate-fade-in">
        <!-- Node -->
        <div
            class="relative w-15 h-15 border-2 rounded-full bg-white flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out z-10 hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg"
            :class="{
                'animate-pulse border-red-400 shadow-red-200': isSelected,
                'border-4': hasChildren,
                'shadow-lg scale-105': isDragOver
            }"
            :style="{
                borderColor: node.color,
            }"
            draggable="true"
            @click="handleNodeClick"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
            @dragstart="handleDragStart"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
            @dragend="handleDragEnd"
        >
            <div class="text-sm text-gray-800 max-w-12 text-center overflow-hidden text-ellipsis mb-0.5">
                {{ node.value }}
            </div>

            <!-- Annotation -->
            <div
                v-if="node.annotation"
                class="absolute -top-3 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 bg-white px-1 border border-gray-200 rounded max-w-20 overflow-hidden text-ellipsis whitespace-nowrap"
            >
                {{ node.annotation }}
            </div>

            <!-- Control buttons (shown on hover or selection) -->
            <div
                v-if="isSelected || isHovered"
                class="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-1 bg-white px-2 py-1 rounded-lg shadow-md border border-gray-200"
                @click.stop
            >
                <button
                    v-for="nodeAction in nodeActions"
                    v-show="nodeAction.condition"
                    :key="`${nodeAction.action}-${nodeAction.params.join('-')}`"
                    class="w-6 h-6 text-white rounded flex items-center justify-center text-xs transition-colors"
                    :class="nodeAction.classes"
                    :title="nodeAction.title"
                    @click="handleActionClick(nodeAction.action, nodeAction.params)"
                >
                    {{ nodeAction.label }}
                </button>
            </div>
        </div>

        <!-- Diagonal lines to child nodes -->
        <div
            v-if="hasChildren"
            class="relative w-full h-10"
        >
            <svg
                class="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <!-- Line to left child -->
                <line
                    v-if="node.left"
                    x1="50"
                    y1="0"
                    :x2="node.left && node.right ? '25' : '50'"
                    y2="100"
                    stroke="white"
                    stroke-width="1"
                    vector-effect="non-scaling-stroke"
                />

                <!-- Line to right child -->
                <line
                    v-if="node.right"
                    x1="50"
                    y1="0"
                    :x2="node.left && node.right ? '75' : '50'"
                    y2="100"
                    stroke="white"
                    stroke-width="1"
                    vector-effect="non-scaling-stroke"
                />
            </svg>
        </div>

        <!-- Child nodes -->
        <div
            v-if="hasChildren"
            class="flex w-full"
        >
            <template
                v-for="child in [node.left, node.right]"
                :key="child?.id"
            >
                <div
                    v-if="child"
                    class="flex-1 flex justify-center"
                >
                    <TreeNode
                        :node="child"
                        :selected-node-id="selectedNodeId"
                        :level="level + 1"
                        v-on="$attrs"
                        @node-click="$emit('nodeClick', $event)"
                        @add-child="handleAddChild"
                        @edit-node="$emit('editNode', $event)"
                        @delete-node="$emit('deleteNode', $event)"
                        @change-color="$emit('changeColor', $event)"
                        @change-annotation="$emit('changeAnnotation', $event)"
                        @move-node="$emit('moveNode', $event)"
                    />
                </div>
            </template>
        </div>
    </div>
</template>
