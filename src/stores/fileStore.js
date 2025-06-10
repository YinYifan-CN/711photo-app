import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { imageData } from '../data/imageData.js';

export const useFileStore = defineStore('files', () => {
    const imageDataRef = ref({});
    const currentRegion = ref('');
    const availableRegions = ref([]);
    const rawFiles = ref([]);

    // 加载图片数据
    const loadImageData = () => {
        imageDataRef.value = imageData;
        availableRegions.value = Object.keys(imageData);
        // 默认选择第一个区域
        if (availableRegions.value.length > 0) {
            setCurrentRegion(availableRegions.value[0]);
        }
    };

    // 设置当前区域并更新文件列表
    const setCurrentRegion = (region) => {
        currentRegion.value = region;
        if (imageDataRef.value[region]) {
            rawFiles.value = imageDataRef.value[region].map((fileName, index) => ({
                id: `${region}-${index}`,
                name: fileName,
                region: region
            }));
            displayedFiles.value = [...rawFiles.value];
            // 默认全选所有文件
            selectedFiles.value = new Set(rawFiles.value.map(file => file.id));
        }
    };

    const selectedFiles = ref(new Set());
    const displayedFiles = ref([]);

    // 初始化数据
    loadImageData();

    const isAllSelected = computed(() =>
        selectedFiles.value.size === displayedFiles.value.length
    );

    const selectedCount = computed(() => selectedFiles.value.size);

    function toggleSelection(fileId) {
        const newSet = new Set(selectedFiles.value);
        newSet.has(fileId) ? newSet.delete(fileId) : newSet.add(fileId);
        selectedFiles.value = newSet;
    }

    function toggleAll() {
        selectedFiles.value = isAllSelected.value ?
            new Set() :
            new Set(displayedFiles.value.map(file => file.id));
    }

    return {
        rawFiles,
        selectedFiles,
        displayedFiles,
        isAllSelected,
        selectedCount,
        toggleSelection,
        toggleAll,
        currentRegion,
        availableRegions,
        setCurrentRegion
    };
});