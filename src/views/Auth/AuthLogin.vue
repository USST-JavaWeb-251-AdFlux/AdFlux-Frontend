<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const formRef = useTemplateRef<FormInstance>('loginForm');

const form = reactive({ username: '', password: '' });
const rules = reactive<FormRules<typeof form>>({
    username: [{ required: true, message: '请填写用户名', trigger: 'change' }],
    password: [{ required: true, message: '请填写密码', trigger: 'change' }],
});

const loading = ref(false);
const onSubmit = async () => {
    if (loading.value) return;

    try {
        await formRef.value?.validate();
    } catch {
        return;
    }

    loading.value = true;
    try {
        await auth.login({ username: form.username, userPassword: form.password });
        ElMessage.success({
            message: `欢迎，${auth.username}！`,
            duration: 1500,
        });
    } catch (err) {
        ElMessage.error(err instanceof Error ? `登录失败：${err.message}` : '登录失败');
    } finally {
        loading.value = false;
    }
};

const router = useRouter();
const navigateToRegister = () => router.push({ name: 'Register' });
</script>

<template>
    <div>
        <h2>登录</h2>

        <ElForm
            ref="loginForm"
            label-width="auto"
            label-position="right"
            :model="form"
            :rules="rules"
            :disabled="loading"
            v-loading="loading"
            element-loading-background="rgba(0, 0, 0, 0)"
            @keyup.enter="onSubmit"
        >
            <ElFormItem label="用户名" prop="username">
                <ElInput v-model.trim="form.username" placeholder="用户名" />
            </ElFormItem>
            <ElFormItem label="密码" prop="password">
                <ElInput v-model="form.password" type="password" placeholder="密码" />
            </ElFormItem>
        </ElForm>

        <ElButton :disabled="loading" type="primary" @click="onSubmit">登录</ElButton>
        <ElButton :disabled="loading" @click="navigateToRegister" text bg
            >没有帐户？去注册</ElButton
        >
    </div>
</template>
