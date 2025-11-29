<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const logout = () => {
    authStore.logout();
    ElMessage.success('登出成功');
};
</script>

<template>
    <span>{{ authStore.username }}</span>
    <ElButton @click="logout">退出登录</ElButton>
    <RouterView />
</template>
