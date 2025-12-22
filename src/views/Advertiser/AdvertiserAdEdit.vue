<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import {
    type AdCategory,
    AdLayout,
    type AdMeta,
    AdType,
    advCreateAdApi,
    advGetAdByIdApi,
    advListCategories,
    advUpdateAdApi,
} from '@/apis/advApis';

const props = defineProps<{ adId?: string }>();
const router = useRouter();
const formRef = useTemplateRef<FormInstance>('formRef');
const loading = ref(true);
const submitting = ref(false);
const categories = ref<AdCategory[]>([]);

const isEdit = computed(() => !!props.adId);

const formData = reactive<AdMeta>({
    title: '',
    adType: AdType.image.value,
    mediaUrl: '',
    landingPage: '',
    categoryId: '',
    adLayout: AdLayout.banner.value,
    weeklyBudget: 0,
});

const rules = reactive<FormRules<AdMeta>>({
    title: [{ required: true, message: '请输入广告标题', trigger: 'blur' }],
    adType: [{ required: true, message: '请选择广告类型', trigger: 'change' }],
    mediaUrl: [{ required: true, message: '请输入媒体URL', trigger: 'blur' }],
    landingPage: [{ required: true, message: '请输入落地页URL', trigger: 'blur' }],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
    adLayout: [{ required: true, message: '请选择广告布局', trigger: 'change' }],
    weeklyBudget: [{ required: true, message: '请输入周预算', trigger: 'blur' }],
});

const fetchCategories = async () => {
    const res = await advListCategories();
    categories.value = res.data;
};

const fetchAdDetails = async () => {
    if (!props.adId) return;
    loading.value = true;
    try {
        const res = await advGetAdByIdApi(props.adId);
        Object.assign(formData, res.data);
    } catch (error) {
        ElMessage.error(`获取详情失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const handleSubmit = async (formEl: FormInstance | null) => {
    if (!formEl) return;
    try {
        await formEl.validate();
    } catch {
        return;
    }

    submitting.value = true;
    try {
        if (isEdit.value && props.adId) {
            await advUpdateAdApi(props.adId, formData);
            ElMessage.success('更新成功');
            router.replace({ name: 'AdvertiserAdDetail', params: { adId: props.adId } });
        } else {
            const result = await advCreateAdApi(formData);
            ElMessage.success('创建成功');
            router.replace({ name: 'AdvertiserAdDetail', params: { adId: result.data.adId } });
        }
    } catch (error) {
        ElMessage.error(`${isEdit.value ? '更新' : '创建'}失败：${(error as Error).message}`);
    } finally {
        submitting.value = false;
    }
};

const handleCancel = () => {
    router.back();
};

onMounted(async () => {
    const tasks = [fetchCategories()];
    if (isEdit.value) {
        tasks.push(fetchAdDetails());
    }
    await Promise.allSettled(tasks);
    loading.value = false;
});
</script>

<template>
    <div class="edit-container" v-loading="loading">
        <div class="header-bar">
            <ElPageHeader @back="handleCancel">
                <template #content>
                    <span class="text-large font-600 mr-3">
                        {{ isEdit ? '编辑广告' : '创建广告' }}
                    </span>
                </template>
            </ElPageHeader>
        </div>
        <ElCard class="form-card" shadow="never">
            <ElForm
                ref="formRef"
                :model="formData"
                :rules="rules"
                label-width="120px"
                class="edit-form"
            >
                <ElFormItem label="标题" prop="title">
                    <ElInput v-model="formData.title" placeholder="请输入广告标题" />
                </ElFormItem>

                <ElFormItem label="类型" prop="adType">
                    <ElRadioGroup v-model="formData.adType">
                        <ElRadio :label="AdType.image.value">图片</ElRadio>
                        <ElRadio :label="AdType.video.value">视频</ElRadio>
                    </ElRadioGroup>
                </ElFormItem>

                <ElFormItem label="布局" prop="adLayout">
                    <ElSelect v-model="formData.adLayout">
                        <ElOption
                            v-for="opt in AdLayout()"
                            :key="opt.value"
                            :label="opt.label"
                            :value="opt.value"
                        />
                    </ElSelect>
                </ElFormItem>

                <ElFormItem label="媒体URL" prop="mediaUrl">
                    <ElInput v-model="formData.mediaUrl" placeholder="请输入图片或视频地址" />
                </ElFormItem>

                <ElFormItem label="落地页" prop="landingPage">
                    <ElInput v-model="formData.landingPage" placeholder="https://..." />
                </ElFormItem>

                <ElFormItem label="分类" prop="categoryId">
                    <ElSelect v-model="formData.categoryId" placeholder="请选择分类">
                        <ElOption
                            v-for="cat in categories"
                            :key="cat.categoryId"
                            :label="cat.categoryName"
                            :value="cat.categoryId"
                        />
                    </ElSelect>
                </ElFormItem>

                <ElFormItem label="周预算" prop="weeklyBudget">
                    <ElInputNumber
                        v-model="formData.weeklyBudget"
                        :min="0"
                        :precision="2"
                        align="left"
                        controls-position="right"
                    >
                        <template #prefix>
                            <span>￥</span>
                        </template>
                    </ElInputNumber>
                </ElFormItem>

                <ElFormItem>
                    <ElButton type="primary" @click="handleSubmit(formRef)" :loading="submitting">
                        保存
                    </ElButton>
                    <ElButton @click="handleCancel">取消</ElButton>
                </ElFormItem>
            </ElForm>
        </ElCard>
    </div>
</template>

<style scoped lang="scss">
.edit-container {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .header-bar {
        margin-bottom: 16px;
    }

    .form-card {
        flex-grow: 1;
        overflow: auto;

        .edit-form {
            max-width: 800px;
            margin: 0 auto;
        }
    }
}
</style>
