<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    isVisible: {
        type: Boolean,
        required: true,
    },
    currentAnnotation: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['close', 'save'])

const annotationText = ref('')
const annotationInput = ref(null)

const closeDialog = () => {
    emit('close')
}

const saveAnnotation = () => {
    emit('save', annotationText.value)
}

// Watch for dialog visibility changes
watch(() => props.isVisible, (isVisible) => {
    if (isVisible) {
        annotationText.value = props.currentAnnotation || ''
        nextTick(() => {
            annotationInput.value?.focus()
            annotationInput.value?.select()
        })
    }
}, { immediate: true })

// Watch for currentAnnotation changes
watch(() => props.currentAnnotation, (newAnnotation) => {
    annotationText.value = newAnnotation || ''
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
                Add/Edit Annotation
            </h3>
            <input
                ref="annotationInput"
                v-model="annotationText"
                type="text"
                placeholder="Enter annotation (leave empty to remove)"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                @keydown.enter.prevent="saveAnnotation"
                @keydown.esc.prevent="closeDialog"
            >
            <div class="flex gap-2 justify-end">
                <button
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors"
                    @click="saveAnnotation"
                >
                    Save
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
