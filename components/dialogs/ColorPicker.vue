<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    isVisible: {
        type: Boolean,
        required: true,
    },
    currentColor: {
        type: String,
        default: '#3b82f6',
    },
})

const emit = defineEmits(['close', 'apply'])

const selectedColor = ref('#3b82f6')
const customColor = ref('#3b82f6')

const predefinedColors = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Fuchsia', value: '#d946ef' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Gray', value: '#6b7280' },
]

const closeDialog = () => {
    emit('close')
}

const selectColor = (color) => {
    selectedColor.value = color
    customColor.value = color
}

const applyColor = () => {
    emit('apply', selectedColor.value)
}

// Watch for dialog visibility changes
watch(() => props.isVisible, (isVisible) => {
    if (isVisible) {
        selectedColor.value = props.currentColor
        customColor.value = props.currentColor
    }
})

// Watch for currentColor changes
watch(() => props.currentColor, (newColor) => {
    selectedColor.value = newColor
    customColor.value = newColor
})

// Handle keyboard events
const handleKeydown = (event) => {
    if (props.isVisible && event.key === 'Escape') {
        event.preventDefault()
        closeDialog()
    }
}

// Add/remove event listeners
onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <div
        v-if="isVisible"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="closeDialog"
    >
        <div class="bg-white p-6 rounded-xl shadow-2xl min-w-80 max-w-[90vw] max-h-[90vh] overflow-auto">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                Choose Node Color
            </h3>
            <div class="grid grid-cols-6 gap-2 mb-4">
                <div
                    v-for="color in predefinedColors"
                    :key="color.value"
                    class="w-10 h-10 rounded-md cursor-pointer border-2 border-transparent transition-all hover:scale-105 hover:border-gray-700"
                    :style="{ backgroundColor: color.value }"
                    :class="{ 'border-gray-800 scale-105': selectedColor === color.value }"
                    :title="color.name"
                    @click="selectColor(color.value)"
                />
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Custom color:</label>
                <input
                    v-model="customColor"
                    type="color"
                    class="w-full h-12 border border-gray-300 rounded-md cursor-pointer"
                    @input="selectedColor = customColor"
                >
            </div>
            <div class="flex gap-2 justify-end">
                <button
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors"
                    @click="applyColor"
                >
                    Apply
                </button>
                <button
                    class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                    @click="closeDialog"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>
