<template>
    <div class="file-container">
        <ul class="file-list">
            <FileItem v-for="file in files" :key="file.id" :file="file" :is-selected="selectedFiles.has(file.id)"
                @toggle-selection="toggleSelection" />
        </ul>
    </div>
</template>

<script setup>
    import { storeToRefs } from 'pinia';
    import { useFileStore } from '../stores/fileStore';
    import FileItem from './FileItem.vue';

    const fileStore = useFileStore();
    const { selectedFiles, displayedFiles } = storeToRefs(fileStore);

    const files = displayedFiles;

    const toggleSelection = (fileId) => {
        fileStore.toggleSelection(fileId);
    };
</script>

<style scoped>
    .file-container {
        flex: 1;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #eee;
        overflow-y: auto;
        min-height: 400px;
    }

    .file-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    @media (max-width: 740px) {
        .file-container {
            border-radius: 0;
            border: none;
            border-top: 1px solid #eee;
        }
    }
</style>