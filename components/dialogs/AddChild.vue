<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
    isVisible: {
        type: Boolean,
        default: false,
    },
    childPosition: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['close', 'add'])

const nodeValue = ref('')
const input = ref(null)

const handleSubmit = () => {
    if (nodeValue.value.trim()) {
        emit('add', nodeValue.value.trim())
        nodeValue.value = ''
    }
}

// Focus input when dialog opens
watch(() => props.isVisible, (newValue) => {
    if (newValue) {
        nextTick(() => {
            input.value?.focus()
        })
    }
})
</script>

<template>
    <div
        v-if="isVisible"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="$emit('close')"
    >
        <div class="bg-white p-6 rounded-xl shadow-2xl min-w-80 max-w-[90vw] max-h-[90vh] overflow-auto">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                Add {{ childPosition === 'left' ? 'Left' : 'Right' }} Child
            </h3>
            <input
                ref="input"
                v-model="nodeValue"
                type="text"
                placeholder="Enter node value"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                @keydown.enter.prevent="handleSubmit"
                @keydown.esc.prevent="$emit('close')"
            >
            <div class="flex gap-2 justify-end">
                <button
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors"
                    @click="handleSubmit"
                >
                    Add
                </button>
                <button
                    class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                    @click="$emit('close')"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>
