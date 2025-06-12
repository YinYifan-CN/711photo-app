<template>
    <li class="file-item" :class="{ 'selected': isSelected }" @click="toggleSelection">
        <label class="checkbox-label" @click.stop>
            <input type="checkbox" :checked="isSelected" @change="toggleSelection">
            {{ file.name }}
        </label>
        <div>
            <button @click.stop="handleDownload" class="download-link" :disabled="isDownloading">
                {{ isDownloading ? '下载中...' : '下载' }}
            </button>
        </div>
    </li>
</template>

<script setup>
    import { ref } from 'vue';

    const props = defineProps({
        file: Object,
        isSelected: Boolean
    });

    const emit = defineEmits(['toggle-selection']);

    const isDownloading = ref(false);

    const toggleSelection = () => {
        emit('toggle-selection', props.file.id);
    };

    const handleDownload = () => {
        if (isDownloading.value) return;

        isDownloading.value = true;

        try {
            const link = document.createElement('a');
            link.href = `/image/${props.file.region}/${props.file.name}`;
            link.download = props.file.name;
            link.click();
        } catch (error) {
            console.error('下载失败:', error);
        } finally {
            // 防抖：2秒后恢复按钮状态
            setTimeout(() => {
                isDownloading.value = false;
            }, 2000);
        }
    };
</script>

<style scoped>
    .file-item {
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
        transition: background-color 0.2s, cursor 0.2s;
        cursor: pointer;
        position: relative;
    }

    .file-item:last-child {
        border-bottom: none;
    }

    .file-item:hover {
        background-color: #f8f9fa;
        cursor: pointer;
    }

    .file-item.selected {
        background-color: #e8f5e9;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }

    input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
    }

    .download-link {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        color: #4CAF50;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 14px;
        transition: color 0.2s;
    }

    .download-link:hover:not(:disabled) {
        color: #81C784;
    }

    .download-link:disabled {
        color: #cccccc;
        cursor: not-allowed;
    }
</style>