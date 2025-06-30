<script setup>
defineProps({
    stats: {
        type: Object,
        default: null,
    },
})

const statsItems = [
    { key: 'totalNodes', label: 'Total nodes' },
    { key: 'maxDepth', label: 'Tree depth' },
    { key: 'leafNodes', label: 'Leaf nodes' },
]
</script>

<template>
    <div
        v-if="stats"
        class="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200"
    >
        <h3 class="text-base font-semibold text-gray-800 mb-3">
            Statistics:
        </h3>
        <div class="flex flex-col gap-2">
            <div
                v-for="item in statsItems"
                :key="item.key"
                class="flex justify-between items-center"
            >
                <span class="text-sm text-gray-600">{{ item.label }}:</span>
                <span class="text-base font-semibold text-gray-800">{{ stats[item.key] }}</span>
            </div>
        </div>
    </div>
</template>
