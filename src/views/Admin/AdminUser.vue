<script setup lang="ts">
import { onMounted, reactive, ref, useTemplateRef } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { type UserDetails, createAdminApi, listUsersApi } from '@/apis/adminApis';
import { UserRole } from '@/apis/authApis';
import { formatDateTime } from '@/utils/tools';

const loading = ref(false);
const users = ref<UserDetails[]>([]);
const dialogVisible = ref(false);
const formRef = useTemplateRef<FormInstance>('adminFormRef');
const adminForm = reactive({
    username: '',
    password: '',
    email: '',
    phone: '',
});

const rules = reactive<FormRules<typeof adminForm>>({
    username: [
        { required: true, message: '请填写用户名', trigger: 'change' },
        { min: 4, max: 256, message: '用户名长度应为 4~256 位', trigger: 'change' },
    ],
    password: [
        { required: true, message: '请填写密码', trigger: 'change' },
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

const fetchUsers = async () => {
    loading.value = true;
    try {
        const res = await listUsersApi();
        users.value = res.data;
    } catch (error) {
        ElMessage.error(`获取用户列表失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const handleAddAdmin = () => {
    adminForm.username = '';
    adminForm.password = '';
    adminForm.email = '';
    adminForm.phone = '';
    dialogVisible.value = true;
};

const submitAdmin = async () => {
    try {
        await formRef.value?.validate();
    } catch {
        return;
    }

    try {
        await createAdminApi(adminForm);
        ElMessage.success('管理员创建成功');
        dialogVisible.value = false;
        fetchUsers();
    } catch (error) {
        ElMessage.error(`创建失败：${(error as Error).message}`);
    }
};

onMounted(fetchUsers);
</script>

<template>
    <div class="user-manage-container">
        <div class="header-bar">
            <h2>用户管理</h2>
            <div class="actions">
                <ElButton type="primary" icon="Plus" @click="handleAddAdmin">添加管理员</ElButton>
                <ElButton icon="Refresh" @click="fetchUsers" circle />
            </div>
        </div>

        <ElTable v-loading="loading" :data="users" style="width: 100%">
            <ElTableColumn prop="username" label="用户名" sortable />
            <ElTableColumn prop="email" label="邮箱" sortable />
            <ElTableColumn prop="phone" label="电话" sortable />
            <ElTableColumn
                prop="userRole"
                label="角色"
                :filters="
                    Object.values(UserRole).map((role) => ({ text: role.label, value: role.value }))
                "
                :filter-method="(value, row) => row.userRole === value"
            >
                <template #default="{ row }">
                    <ElTag
                        :style="{
                            '--el-tag-text-color': UserRole(row.userRole).color,
                            '--el-tag-border-color': `${UserRole(row.userRole).color}60`,
                        }"
                        effect="plain"
                        disable-transitions
                        >{{ UserRole(row.userRole).label }}</ElTag
                    >
                </template>
            </ElTableColumn>
            <ElTableColumn
                prop="createTime"
                label="注册时间"
                sortable
                :formatter="({ createTime }) => formatDateTime(createTime)"
            />
        </ElTable>

        <ElDialog v-model="dialogVisible" title="添加管理员" width="500px">
            <ElForm ref="adminFormRef" :model="adminForm" :rules="rules" label-width="80px">
                <ElFormItem label="用户名" prop="username">
                    <ElInput v-model="adminForm.username" placeholder="请输入用户名" />
                </ElFormItem>
                <ElFormItem label="密码" prop="password">
                    <ElInput
                        v-model="adminForm.password"
                        type="password"
                        placeholder="请输入密码"
                        show-password
                    />
                </ElFormItem>
                <ElFormItem label="邮箱" prop="email">
                    <ElInput v-model="adminForm.email" placeholder="请输入邮箱" />
                </ElFormItem>
                <ElFormItem label="电话" prop="phone">
                    <ElInput v-model="adminForm.phone" placeholder="请输入电话" />
                </ElFormItem>
            </ElForm>
            <template #footer>
                <span class="dialog-footer">
                    <ElButton @click="dialogVisible = false">取消</ElButton>
                    <ElButton type="primary" @click="submitAdmin">确定</ElButton>
                </span>
            </template>
        </ElDialog>
    </div>
</template>

<style scoped lang="scss">
.user-manage-container {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;

    .header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
        }

        .actions {
            display: flex;
            gap: 10px;
        }
    }
}
</style>
