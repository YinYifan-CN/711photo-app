<template>
    <div class="toolbar">
        <div class="selection-controls">
            <label class="checkbox-label">
                <input type="checkbox" :checked="isAllSelected" @change="toggleAll">
                全选
            </label>
            <span class="selected-count" v-if="selectedCount > 0">
                <span class="selected-count-text">已选择 </span>
                <span class="selected-count-number">{{ selectedCount }} 个文件</span>
            </span>
        </div>
        <div class="action-buttons">
            <select @change="handleRegionChange" v-model="currentRegion" class="region-select">
                <option v-for="region in availableRegions" :key="region" :value="region">
                    {{ region }}
                </option>
            </select>
            <button @click="handleDownload" class="download-button" :disabled="selectedCount === 0 || isDownloading">
                {{ isDownloading ? '下载中...' : '下载选中的文件' }}
            </button>
        </div>
    </div>
</template>

<script setup>
    import { storeToRefs } from 'pinia';
    import { ref } from 'vue';
    import { useFileStore } from '../stores/fileStore';
    import JSZip from 'jszip';

    const fileStore = useFileStore();
    const { isAllSelected, selectedCount, displayedFiles, currentRegion, availableRegions } = storeToRefs(fileStore);

    const isDownloading = ref(false);

    const toggleAll = () => fileStore.toggleAll();

    const handleRegionChange = () => {
        fileStore.setCurrentRegion(currentRegion.value);
    };

    const handleDownload = async () => {
        if (isDownloading.value) return;

        isDownloading.value = true;

        try {
            const selectedFiles = displayedFiles.value
                .filter(file => fileStore.selectedFiles.has(file.id));

            if (selectedFiles.length === 0) return;

            if (selectedFiles.length === 1) {
                // 单个文件直接下载
                const file = selectedFiles[0];
                const link = document.createElement('a');
                link.href = `/image/${currentRegion.value}/${file.name}`;
                link.download = file.name;
                link.click();
            } else {
                // 多个文件打包为 ZIP 下载
                const zip = new JSZip();
                const loadingPromises = [];

                selectedFiles.forEach(file => {
                    const promise = fetch(`/image/${currentRegion.value}/${file.name}`)
                        .then(response => response.blob())
                        .then(blob => {
                            zip.file(file.name, blob);
                        })
                        .catch(error => {
                            console.error(`Failed to load ${file.name}:`, error);
                        });
                    loadingPromises.push(promise);
                });

                // 等待所有文件加载完成
                await Promise.all(loadingPromises);

                // 生成 ZIP 文件
                const zipBlob = await zip.generateAsync({ type: 'blob' });

                // 下载 ZIP 文件
                const link = document.createElement('a');
                link.href = URL.createObjectURL(zipBlob);
                link.download = `${currentRegion.value}_${selectedFiles.length}个文件.zip`;
                link.click();

                // 清理 URL 对象
                URL.revokeObjectURL(link.href);
            }
        } catch (error) {
            console.error('Failed to download files:', error);
            alert('下载失败，请重试');
        } finally {
            // 防抖：2秒后恢复按钮状态
            setTimeout(() => {
                isDownloading.value = false;
            }, 2000);
        }
    };
</script>

<style scoped>
    .toolbar {
        padding: 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f9fa;
        border-radius: 6px;
        margin-bottom: 20px;
    }

    .selection-controls {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        margin-left: 2px;
    }

    input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
    }

    .selected-count {
        color: #666;
        font-size: 0.9em;
    }

    .action-buttons {
        display: flex;
        gap: 10px;
    }

    .region-select {
        padding: 8px 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        background-color: white;
    }

    .region-select:focus {
        outline: none;
        border-color: #007BFF;
    }

    .download-button {
        padding: 8px 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
        font-size: 14px;
    }

    .download-button:hover {
        background-color: #45a049;
    }

    .download-button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    @media (max-width: 740px) {
        .toolbar {
            margin-bottom: 0;
            padding: 12px;
            padding-left: 18px;
            gap: 8px;
            flex-wrap: nowrap;
        }

        .selection-controls {
            flex-shrink: 1;
            min-width: 0;
            gap: 8px;
        }

        .selected-count-text {
            display: none;
        }

        .action-buttons {
            flex-shrink: 0;
            gap: 6px;
        }

        .download-button {
            padding: 6px 12px;
            font-size: 12px;
            white-space: nowrap;
        }

        .checkbox-label {
            white-space: nowrap;
        }
    }
</style>