<script setup>
defineProps({
    selectedNode: {
        type: Object,
        default: null,
    },
})
</script>

<template>
    <div
        v-if="selectedNode"
        class="mb-6 p-4 bg-sky-50 rounded-lg border border-sky-200"
    >
        <h3 class="text-base font-semibold text-sky-900 mb-3">
            Selected Node:
        </h3>
        <div class="space-y-2">
            <p class="text-sm text-slate-900">
                <strong>Value:</strong> {{ selectedNode.value }}
            </p>
            <p class="text-sm text-slate-900 flex items-center">
                <strong>Color:</strong>
                <span
                    class="inline-block w-4 h-4 rounded border border-gray-300 mx-2"
                    :style="{ backgroundColor: selectedNode.color }"
                />
                {{ selectedNode.color }}
            </p>
            <p
                v-if="selectedNode.annotation"
                class="text-sm text-slate-900"
            >
                <strong>Annotation:</strong> {{ selectedNode.annotation }}
            </p>
        </div>
    </div>
</template>
