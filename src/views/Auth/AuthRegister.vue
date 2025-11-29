<script setup lang="ts">
const router = useRouter();
const navigateToRegister = (role: 'advertiser' | 'publisher') =>
    router.push({ name: 'RegisterRole', params: { role } });
const navigateToLogin = () => router.push({ name: 'Login' });
</script>

<template>
    <div>
        <h2>您的身份是？</h2>
        <ElButton @click="navigateToRegister('advertiser')" type="primary" size="large"
            >广告主</ElButton
        >
        <ElButton @click="navigateToRegister('publisher')" type="primary" size="large"
            >发布主</ElButton
        >
        <ElButton @click="navigateToLogin" size="large" text bg>已有账户？去登录</ElButton>
    </div>
</template>
