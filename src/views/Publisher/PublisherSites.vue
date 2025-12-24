<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import {
    type WebsiteDetails,
    type WebsiteMeta,
    WebsiteVerification,
    pubCreateSiteApi,
    pubListSitesApi,
} from '@/apis/publisherApis';
import { formatDateTime } from '@/utils/tools';

const router = useRouter();
const loading = ref(false);
const websites = ref<WebsiteDetails[]>([]);
const dialogVisible = ref(false);
const formRef = useTemplateRef<FormInstance>('formRef');
const form = reactive<WebsiteMeta>({
    websiteName: '',
    domain: '',
});

const rules: FormRules<WebsiteMeta> = {
    websiteName: [{ required: true, message: '请输入网站名称', trigger: 'change' }],
    domain: [
        {
            required: true,
            validator: (_, value, callback) => {
                if (!value) {
                    callback();
                } else if (/^https?:\/\//.test(value)) {
                    callback('请勿包含协议前缀（http / https），仅需输入域名');
                } else if (
                    !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,63}$/i.test(
                        value,
                    )
                ) {
                    callback('请输入有效的域名格式，如 example.com');
                } else {
                    callback();
                }
            },
            trigger: ['blur', 'change'],
        },
    ],
};

const fetchWebsites = async () => {
    loading.value = true;
    try {
        const res = await pubListSitesApi();
        websites.value = res.data;
    } catch (error) {
        ElMessage.error(`获取网站列表失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const handleAdd = () => {
    formRef.value?.resetFields();
    dialogVisible.value = true;
};

const handleSubmit = async () => {
    try {
        await formRef.value?.validate();
    } catch {
        return;
    }
    try {
        await pubCreateSiteApi(form);
        ElMessage.success('添加成功');
        dialogVisible.value = false;
        fetchWebsites();
    } catch (error) {
        ElMessage.error(`添加失败：${(error as Error).message}`);
    }
};

const handleDetails = (row: WebsiteDetails) => {
    router.push({ name: 'PublisherSiteDetail', params: { websiteId: row.websiteId } });
};

onMounted(fetchWebsites);
</script>

<template>
    <div class="publisher-websites">
        <div class="page-header">
            <h2>网站管理</h2>
            <ElButton type="primary" @click="handleAdd">添加网站</ElButton>
        </div>

        <ElTable :data="websites" v-loading="loading" style="width: 100%">
            <ElTableColumn prop="websiteName" label="网站名称" />
            <ElTableColumn prop="domain" label="域名" />
            <ElTableColumn label="状态">
                <template #default="{ row }">
                    <ElTag :type="WebsiteVerification(row.isVerified).type" disable-transitions>
                        {{ WebsiteVerification(row.isVerified).label }}
                    </ElTag>
                </template>
            </ElTableColumn>
            <ElTableColumn prop="createTime" label="创建时间">
                <template #default="{ row }">
                    {{ formatDateTime(row.createTime) }}
                </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="150">
                <template #default="{ row }">
                    <ElButton type="primary" link @click="handleDetails(row)"> 详情 </ElButton>
                </template>
            </ElTableColumn>
        </ElTable>

        <ElDialog v-model="dialogVisible" title="添加网站" width="500px">
            <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
                <ElFormItem label="网站名称" prop="websiteName">
                    <ElInput v-model="form.websiteName" placeholder="请输入网站名称" />
                </ElFormItem>
                <ElFormItem label="域名" prop="domain">
                    <ElInput v-model="form.domain" placeholder="请输入域名" />
                </ElFormItem>
            </ElForm>
            <template #footer>
                <span class="dialog-footer">
                    <ElButton @click="dialogVisible = false">取消</ElButton>
                    <ElButton type="primary" @click="handleSubmit">确定</ElButton>
                </span>
            </template>
        </ElDialog>
    </div>
</template>

<style scoped lang="scss">
.publisher-websites {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
        }
    }
}
</style>
