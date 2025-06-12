<template>
  <div class="container">
    <Toolbar />
    <FileList />
  </div>
</template>

<script setup>
  import { useFileStore } from './stores/fileStore';
  import Toolbar from './components/Toolbar.vue';
  import FileList from './components/FileList.vue';

  const fileStore = useFileStore();
</script>

<style scoped>
  .container {
    width: 80%;
    height: 80%;
    margin: 0;
    padding: 30px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.2s ease;
  }

  @media (max-width: 740px) {
    .container {
      width: 100%;
      height: 100%;
      padding: 0;
      border-radius: 0;
    }
  }
</style>
