<script setup lang="ts">
import { createCategoryApi } from '@/apis/adminApis';
import { type AdCategory, listCategories } from '@/apis/commonApis';
import { formatDateTime } from '@/utils/tools';

const loading = ref(false);
const categories = ref<AdCategory[]>([]);
const dialogVisible = ref(false);
const form = reactive({
    categoryName: '',
});

const fetchCategories = async () => {
    loading.value = true;
    try {
        const res = await listCategories();
        categories.value = res.data;
    } catch (error) {
        ElMessage.error(`获取分类列表失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const handleAdd = () => {
    form.categoryName = '';
    dialogVisible.value = true;
};

const submitForm = async () => {
    if (!form.categoryName) {
        ElMessage.warning('请输入分类名称');
        return;
    }
    try {
        await createCategoryApi({ categoryName: form.categoryName });
        ElMessage.success('创建成功');
        dialogVisible.value = false;
        fetchCategories();
    } catch (error) {
        ElMessage.error(`创建失败：${(error as Error).message}`);
    }
};

onMounted(fetchCategories);
</script>

<template>
    <div class="category-manage-container">
        <div class="header-bar">
            <h2>分类管理</h2>
            <div class="actions">
                <ElButton type="primary" icon="Plus" @click="handleAdd">添加分类</ElButton>
                <ElButton icon="Refresh" @click="fetchCategories" circle />
            </div>
        </div>

        <ElTable v-loading="loading" :data="categories" style="width: 100%">
            <ElTableColumn prop="categoryName" label="分类名称" />
            <ElTableColumn
                prop="createTime"
                label="创建时间"
                :formatter="({ createTime }) => formatDateTime(createTime)"
            />
        </ElTable>

        <ElDialog v-model="dialogVisible" title="添加分类" width="400px">
            <ElForm :model="form">
                <ElFormItem label="分类名称" prop="categoryName">
                    <ElInput v-model="form.categoryName" placeholder="请输入分类名称" />
                </ElFormItem>
            </ElForm>
            <template #footer>
                <span class="dialog-footer">
                    <ElButton @click="dialogVisible = false">取消</ElButton>
                    <ElButton type="primary" @click="submitForm">确定</ElButton>
                </span>
            </template>
        </ElDialog>
    </div>
</template>

<style scoped lang="scss">
.category-manage-container {
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
