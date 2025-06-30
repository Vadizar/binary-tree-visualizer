<script setup>
const hotkeys = [
    { key: 'Enter', description: 'Edit selected node' },
    { key: '←', description: 'Add left child' },
    { key: '→', description: 'Add right child' },
    { key: 'Delete', description: 'Delete selected node' },
    { key: 'Escape', description: 'Deselect node' },
    { key: 'C', description: 'Change color' },
    { key: 'A', description: 'Add/edit annotation' },
    { key: 'Ctrl+Z', description: 'Undo' },
    { key: 'Ctrl+Y', description: 'Redo' },
]
</script>

<template>
    <div class="mb-6">
        <h3 class="text-base font-semibold text-gray-800 mb-3">
            Hotkeys:
        </h3>
        <div class="flex flex-col gap-1.5">
            <div
                v-for="hotkey in hotkeys"
                :key="hotkey.key"
                class="flex items-center text-xs text-gray-600"
            >
                <kbd class="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 font-mono text-xs mr-2 min-w-6 text-center">
                    {{ hotkey.key }}
                </kbd>
                {{ hotkey.description }}
            </div>
        </div>
    </div>
</template>
