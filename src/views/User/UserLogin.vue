<script setup lang="ts">
import { reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const formRef = useTemplateRef<FormInstance>('loginForm');

const form = reactive({ username: '', password: '' });
const rules = reactive<FormRules<typeof form>>({
    username: [{ required: true, message: '请填写用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请填写密码', trigger: 'blur' }],
});

const onSubmit = async () => {
    try {
        await formRef.value?.validate();
    } catch {
        return;
    }

    try {
        await auth.login({ username: form.username, userPassword: form.password });
    } catch (err) {
        console.error(err);
    }
};
</script>

<template>
    <div class="login-root">
        <ElCard class="login-card">
            <h2>登录</h2>
            <ElForm
                ref="loginForm"
                label-width="auto"
                label-position="right"
                :model="form"
                :rules
                @submit.prevent="onSubmit"
            >
                <ElFormItem label="用户名" prop="username">
                    <ElInput v-model="form.username" placeholder="用户名" />
                </ElFormItem>
                <ElFormItem label="密码" prop="password">
                    <ElInput v-model="form.password" type="password" placeholder="密码" />
                </ElFormItem>
                <ElFormItem>
                    <ElButton type="primary" @click="onSubmit">登录</ElButton>
                </ElFormItem>
            </ElForm>
        </ElCard>
    </div>
</template>

<style lang="scss" scoped>
.login-root {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;

    h2 {
        text-align: center;
        margin-bottom: 24px;
    }

    .login-card {
        width: 360px;
    }

    .el-button {
        width: 100%;
    }
}
</style>
