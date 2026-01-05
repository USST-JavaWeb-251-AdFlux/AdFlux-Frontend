<script setup lang="ts">
import type { FormInstance, FormRules, UploadFile } from 'element-plus';
import {
    AdLayout,
    type AdMeta,
    AdType,
    ReviewStatus,
    advCreateAdApi,
    advGetAdByIdApi,
    advUpdateAdApi,
} from '@/apis/advApis';
import { type AdCategory, listCategoriesApi } from '@/apis/commonApis';
import { uploadFileApi } from '@/apis/fileApis';
import { getBackendFullPath } from '@/apis/request';
import { useSubTitle } from '@/composables/useSubTitle';

const { adId } = defineProps<{ adId?: string }>();
const router = useRouter();
const formRef = useTemplateRef<FormInstance>('formRef');
const loading = ref(true);
const submitting = ref(false);
const categories = ref<AdCategory[]>([]);
const uploadFile = ref<File>();
const objectUrl = useObjectUrl(uploadFile);

const isEdit = computed(() => !!adId);
const isReviewPassed = ref(false);

const formData = reactive<AdMeta>({
    title: '',
    adType: AdType.image.value,
    mediaUrl: '',
    landingPage: '',
    categoryId: '',
    adLayout: AdLayout.banner.value,
    weeklyBudget: 0,
});
useSubTitle(() => formData.title);

const rules = reactive<FormRules<AdMeta>>({
    title: [{ required: true, message: '请输入广告标题', trigger: 'blur' }],
    mediaUrl: [{ required: true, message: '请上传媒体文件', trigger: 'change' }],
    landingPage: [
        { required: true, message: '请输入落地页 URL', trigger: 'blur' },
        {
            validator: (_, value, callback) => {
                if (!value) callback();
                try {
                    const url = new URL(value);
                    if (url.protocol === 'https:') {
                        callback();
                    } else {
                        callback('落地页 URL 仅支持 https 协议');
                    }
                } catch {
                    callback('落地页 URL 格式不正确');
                }
            },
            trigger: 'blur',
        },
    ],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
    adLayout: [{ required: true, message: '请选择广告布局', trigger: 'change' }],
    weeklyBudget: [{ required: true, message: '请输入周预算', trigger: 'blur' }],
});

watch(objectUrl, (url) => {
    if (url) {
        formData.mediaUrl = url;
        formRef.value?.clearValidate('mediaUrl');
    }
});

const fetchCategories = async () => {
    const res = await listCategoriesApi();
    categories.value = res.data;
};

const fetchAdDetails = async () => {
    if (!adId) return;
    loading.value = true;
    try {
        const res = await advGetAdByIdApi(adId);
        Object.assign(formData, res.data);
        isReviewPassed.value = res.data.reviewStatus === ReviewStatus.approved.value;
    } catch (error) {
        ElMessage.error(`获取详情失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const handleFileChange = ({ raw }: UploadFile) => {
    if (raw) {
        uploadFile.value = raw;
        if (raw.type.startsWith('image/')) {
            formData.adType = AdType.image.value;
            formData.adLayout = AdLayout.banner.value;
        } else if (raw.type.startsWith('video/')) {
            formData.adType = AdType.video.value;
            formData.adLayout = AdLayout.video.value;
        } else {
            ElMessage.error('仅支持上传图片或视频文件');
            uploadFile.value = undefined;
        }
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
        if (uploadFile.value) {
            const uploadRes = await uploadFileApi(uploadFile.value);
            formData.mediaUrl = uploadRes.data.mediaUrl;
            formData.adType = uploadRes.data.adType;
        }

        if (isEdit.value && adId) {
            await advUpdateAdApi(adId, formData);
            ElMessage.success('更新成功');
            router.replace({ name: 'AdvertiserAdDetail', params: { adId } });
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
    fetchCategories();

    watch(
        () => adId,
        async (newAdId) => {
            formRef.value?.resetFields();
            isReviewPassed.value = false;

            if (newAdId) {
                await fetchAdDetails();
            } else {
                loading.value = false;
            }
        },
        { immediate: true },
    );
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
                <ElAlert
                    v-if="isEdit && isReviewPassed"
                    title="注意：广告修改后需重新审核。"
                    type="warning"
                    show-icon
                />
                <ElFormItem label="标题" prop="title">
                    <ElInput v-model="formData.title" placeholder="请输入广告标题" />
                </ElFormItem>
                <ElFormItem label="布局" prop="adLayout">
                    <ElSelect
                        v-model="formData.adLayout"
                        :disabled="formData.adLayout === AdLayout.video.value"
                    >
                        <template v-for="opt in AdLayout()" :key="opt.value">
                            <ElOption
                                v-if="
                                    (formData.adType === AdType.video.value) ===
                                    (opt.value === AdLayout.video.value)
                                "
                                :label="opt.label"
                                :value="opt.value"
                            />
                        </template>
                    </ElSelect>
                </ElFormItem>
                <ElFormItem label="媒体文件" prop="mediaUrl">
                    <ElUpload
                        class="media-uploader"
                        action="#"
                        :auto-upload="false"
                        :show-file-list="false"
                        :on-change="handleFileChange"
                        accept="image/*,video/*"
                        drag
                    >
                        <div v-if="formData.mediaUrl" class="preview-container">
                            <img
                                v-if="formData.adType === AdType.image.value"
                                :src="
                                    formData.mediaUrl.startsWith('blob:')
                                        ? formData.mediaUrl
                                        : getBackendFullPath(formData.mediaUrl)
                                "
                                class="media-preview"
                            />
                            <video
                                v-else
                                :src="
                                    formData.mediaUrl.startsWith('blob:')
                                        ? formData.mediaUrl
                                        : getBackendFullPath(formData.mediaUrl)
                                "
                                class="media-preview"
                                controls
                            />
                            <div class="reupload-mask">
                                <ElIcon><Plus /></ElIcon>
                                <span>点击更换</span>
                            </div>
                        </div>
                        <div v-else class="upload-placeholder">
                            <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
                            <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
                        </div>
                    </ElUpload>
                </ElFormItem>
                <ElFormItem prop="landingPage">
                    <template #label>
                        <div style="display: flex; align-items: center; gap: 4px">
                            落地页
                            <ElTooltip
                                content="访客点击广告时跳转的页面，会自动添加 utm_source 参数。"
                                placement="top"
                            >
                                <ElIcon><QuestionFilled /></ElIcon>
                            </ElTooltip>
                        </div>
                    </template>
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
            max-width: 600px;

            .el-alert {
                margin: 0 0 24px 40px;
            }
        }

        .media-uploader {
            width: 100%;

            :deep(.el-upload) {
                width: 100%;

                .el-upload-dragger {
                    width: 100%;
                    height: auto;
                    min-height: 180px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    overflow: hidden;
                }
            }

            .preview-container {
                width: 100%;
                height: 100%;
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 200px;

                .media-preview {
                    max-width: 100%;
                    max-height: 300px;
                    object-fit: contain;
                }

                .reupload-mask {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                    cursor: pointer;

                    .el-icon {
                        font-size: 24px;
                        margin-bottom: 8px;
                    }
                }

                &:hover .reupload-mask {
                    opacity: 1;
                }
            }

            .upload-placeholder {
                padding: 40px 0;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
        }
    }
}
</style>
