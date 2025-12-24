<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { useSubTitle } from './composables/useSubTitle';

const isDev = import.meta.env.DEV ? 'DEV' : '';
const route = useRoute();
const subTitle = useSubTitle();

useTitle(() =>
    [isDev, subTitle.value, route.meta.title, 'AdFlux'].filter((seg) => seg).join(' | '),
);
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
