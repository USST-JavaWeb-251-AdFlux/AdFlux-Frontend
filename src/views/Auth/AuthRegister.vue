<script setup lang="ts">
import { UserRole } from '@/apis/authApis';
import type { ValueOf } from '@/utils/enum';

const router = useRouter();
const navigateToRegister = (role: Exclude<ValueOf<typeof UserRole>, 'admin'>) =>
    router.push({ name: 'RegisterRole', params: { role } });
const navigateToLogin = () => router.push({ name: 'Login' });
</script>

<template>
    <div>
        <h2>您的身份是？</h2>
        <ElButton
            v-for="role in ['advertiser', 'publisher'] as const"
            :key="role"
            @click="navigateToRegister(role)"
            type="primary"
            size="large"
        >
            {{ UserRole(role).label }}
        </ElButton>
        <ElButton @click="navigateToLogin" size="large" text bg>已有账户？去登录</ElButton>
    </div>
</template>
