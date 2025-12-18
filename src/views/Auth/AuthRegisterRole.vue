<script setup lang="ts">
import { reactive } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { authRegisterApi } from '@/apis/authApis';

const { role } = defineProps<{ role: 'advertiser' | 'publisher' }>();

const formRef = useTemplateRef<FormInstance>('registerForm');

const form = reactive({ username: '', password: '', confirmPassword: '', email: '', phone: '' });
const rules = reactive<FormRules<typeof form>>({
    username: [
        { required: true, message: '请填写用户名', trigger: 'change' },
        { min: 4, max: 256, message: '用户名长度应为 4~256 位', trigger: 'change' },
    ],
    password: [
        { required: true, message: '请填写密码', trigger: 'change' },
        { min: 8, max: 256, message: '密码长度应为 8~256 位', trigger: 'change' },
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'change' },
        {
            validator: (_, value, callback) =>
                callback(value === form.password ? undefined : '两次输入的密码不一致'),
            trigger: 'change',
        },
        { min: 8, max: 256, message: '密码长度应为 8~256 位', trigger: 'change' },
    ],
    email: [{ type: 'email', required: true, message: '请填写正确的邮箱', trigger: 'change' }],
    phone: [
        {
            pattern: /^1[3-9]\d{9}$/,
            required: true,
            message: '请填写正确的手机号',
            trigger: 'change',
        },
    ],
});

const router = useRouter();
const loading = ref(false);
const onSubmit = async () => {
    try {
        await formRef.value?.validate();
    } catch {
        return;
    }

    loading.value = true;
    try {
        await authRegisterApi({
            username: form.username,
            userPassword: form.password,
            email: form.email,
            phone: form.phone,
            role,
        });
        ElMessage.success({
            message: '注册成功',
            duration: 1500,
            onClose: navigateToLogin,
        });
    } catch (err) {
        ElMessage.error(err instanceof Error ? `注册失败：${err.message}` : '注册失败');
    } finally {
        loading.value = false;
    }
};

const navigateToLogin = () => router.push({ name: 'Login' });
</script>

<template>
    <div>
        <h2>{{ { advertiser: '广告主', publisher: '发布主' }[role] }} - 注册</h2>

        <ElForm
            ref="registerForm"
            label-width="auto"
            label-position="right"
            :model="form"
            :rules="rules"
            v-loading="loading"
            @submit.prevent="onSubmit"
        >
            <ElFormItem label="用户名" prop="username">
                <ElInput v-model.trim="form.username" placeholder="用户名" />
            </ElFormItem>
            <ElFormItem label="密码" prop="password">
                <ElInput v-model.trim="form.password" type="password" placeholder="密码" />
            </ElFormItem>
            <ElFormItem label="确认密码" prop="confirmPassword">
                <ElInput
                    v-model.trim="form.confirmPassword"
                    type="password"
                    placeholder="确认密码"
                />
            </ElFormItem>
            <ElFormItem label="邮箱" prop="email">
                <ElInput v-model.trim="form.email" placeholder="邮箱" />
            </ElFormItem>
            <ElFormItem label="手机号" prop="phone">
                <ElInput v-model.trim="form.phone" placeholder="手机号" />
            </ElFormItem>
        </ElForm>

        <ElButton :disabled="loading" type="primary" @click="onSubmit">注册</ElButton>
        <ElButton :disabled="loading" @click="navigateToLogin" text bg>已有帐户？去登录</ElButton>
    </div>
</template>
