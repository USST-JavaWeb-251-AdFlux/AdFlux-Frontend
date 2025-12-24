<script setup lang="ts">
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
        <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
                <component :is="Component" />
            </Transition>
        </RouterView>
    </ElConfigProvider>
</template>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
