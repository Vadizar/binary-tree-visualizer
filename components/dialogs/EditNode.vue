<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
    isVisible: {
        type: Boolean,
        required: true,
    },
    nodeValue: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['close', 'save'])

const editValue = ref('')
const editInput = ref(null)

const closeDialog = () => {
    emit('close')
}

const saveEdit = () => {
    if (editValue.value.trim()) {
        emit('save', editValue.value.trim())
    }
}

// Watch for dialog visibility changes
watch(() => props.isVisible, (isVisible) => {
    if (isVisible) {
        editValue.value = props.nodeValue
        nextTick(() => {
            editInput.value?.focus()
            editInput.value?.select()
        })
    }
}, { immediate: true })

// Watch for nodeValue changes
watch(() => props.nodeValue, (newValue) => {
    editValue.value = newValue
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
                Edit Node
            </h3>
            <input
                ref="editInput"
                v-model="editValue"
                type="text"
                placeholder="Enter new value"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                @keydown.enter.prevent="saveEdit"
                @keydown.esc.prevent="closeDialog"
            >
            <div class="flex gap-2 justify-end">
                <button
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors"
                    @click="saveEdit"
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
