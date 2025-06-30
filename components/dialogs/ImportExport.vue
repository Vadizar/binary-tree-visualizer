<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    isVisible: {
        type: Boolean,
        required: true,
    },
    exportData: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['close', 'import'])

const activeTab = ref('export')
const importData = ref('')
const importError = ref('')

const closeDialog = () => {
    emit('close')
}

const selectAll = (event) => {
    event.target.select()
}

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(props.exportData)
        alert('Tree data copied to clipboard!')
    } catch (err) {
        console.error('Failed to copy to clipboard:', err)
        // Fallback for older browsers
        const textarea = document.createElement('textarea')
        textarea.value = props.exportData
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        alert('Tree data copied to clipboard!')
    }
}

const importTree = () => {
    if (!importData.value.trim()) {
        importError.value = 'Please enter JSON data'
        return
    }

    emit('import', importData.value)
}

// Watch for dialog visibility changes
watch(() => props.isVisible, (isVisible) => {
    if (isVisible) {
        activeTab.value = 'export'
        importData.value = ''
        importError.value = ''
    }
})

// Listen for import results
const handleImportResult = (result) => {
    if (result.success) {
        importData.value = ''
        importError.value = ''
        closeDialog()
        alert('Tree imported successfully!')
    } else {
        importError.value = result.error
    }
}

defineExpose({
    handleImportResult,
})
</script>

<template>
    <div
        v-if="isVisible"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="closeDialog"
    >
        <div class="bg-white p-6 rounded-xl shadow-2xl min-w-[600px] max-w-[90vw] max-h-[90vh] overflow-auto md:min-w-[600px] min-w-auto mx-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                Import/Export Tree
            </h3>

            <div class="flex mb-4 border-b border-gray-200">
                <button
                    :class="{ 'text-blue-500 border-blue-500': activeTab === 'export', 'text-gray-600': activeTab !== 'export' }"
                    class="px-4 py-2 font-medium border-b-2 border-transparent transition-colors"
                    @click="activeTab = 'export'"
                >
                    Export
                </button>
                <button
                    :class="{ 'text-blue-500 border-blue-500': activeTab === 'import', 'text-gray-600': activeTab !== 'import' }"
                    class="px-4 py-2 font-medium border-b-2 border-transparent transition-colors"
                    @click="activeTab = 'import'"
                >
                    Import
                </button>
            </div>

            <div
                v-if="activeTab === 'export'"
                class="space-y-3"
            >
                <p class="text-gray-600 mb-3">
                    Copy the JSON below to save your tree:
                </p>
                <textarea
                    :value="exportData"
                    readonly
                    class="w-full h-48 p-3 border border-gray-300 rounded-md font-mono text-xs resize-y mb-3"
                    @click="selectAll"
                />
                <button
                    class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                    @click="copyToClipboard"
                >
                    📋 Copy to Clipboard
                </button>
            </div>

            <div
                v-if="activeTab === 'import'"
                class="space-y-3"
            >
                <p class="text-gray-600 mb-3">
                    Paste JSON data to import a tree:
                </p>
                <textarea
                    v-model="importData"
                    placeholder="Paste your tree JSON here..."
                    class="w-full h-48 p-3 border border-gray-300 rounded-md font-mono text-xs resize-y mb-3"
                />
                <div
                    v-if="importError"
                    class="text-red-600 bg-red-50 p-2 rounded-md border border-red-200 mb-3 text-sm"
                >
                    {{ importError }}
                </div>
                <button
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors"
                    @click="importTree"
                >
                    Import Tree
                </button>
            </div>

            <div class="flex justify-end mt-6">
                <button
                    class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                    @click="closeDialog"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
</template>
