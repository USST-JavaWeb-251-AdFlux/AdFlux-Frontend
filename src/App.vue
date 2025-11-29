<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useTitle } from '@vueuse/core';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

const route = useRoute();
const title = computed(() => {
    const baseTitle = 'AdFlux';
    const routeTitle = route.meta.title;
    return routeTitle ? `${routeTitle} | ${baseTitle}` : baseTitle;
});
useTitle(title);
</script>

<template>
    <ElConfigProvider :locale="zhCn">
        <RouterView />
    </ElConfigProvider>
</template>

<style scoped></style>
