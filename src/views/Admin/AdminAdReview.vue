<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { listAllAdsApi, reviewAdApi } from '@/apis/adminApis';
import { AdActive, type AdDetails, AdType, ReviewStatus } from '@/apis/advApis';
import { getFileFullPath } from '@/apis/request';
import { type ValueOf } from '@/utils/enum';

const loading = ref(false);
const ads = ref<AdDetails[]>([]);
const total = ref(0);

const pagination = reactive({
    page: 1,
    pageSize: 10,
});

const filter = reactive<{
    status?: ValueOf<typeof ReviewStatus>;
}>({
    status: undefined,
});

const fetchAds = async () => {
    loading.value = true;
    try {
        const res = await listAllAdsApi({
            page: pagination.page,
            pageSize: pagination.pageSize,
            status: filter.status,
        });
        if (Array.isArray(res.data)) {
            ads.value = res.data;
            total.value = res.data.length;
        } else {
            ads.value = res.data.records;
            total.value = res.data.total;
        }
    } catch (error) {
        ElMessage.error(`获取广告列表失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const handlePageChange = () => {
    fetchAds();
};

const handleSizeChange = () => {
    pagination.page = 1;
    fetchAds();
};

const handleFilterChange = () => {
    pagination.page = 1;
    fetchAds();
};

const reviewDialogVisible = ref(false);
const currentAd = ref<AdDetails | null>(null);
const reviewForm = reactive({
    reviewStatus: ReviewStatus.approved.value as ValueOf<typeof ReviewStatus>,
    reason: '',
});

const handleReview = (ad: AdDetails) => {
    currentAd.value = ad;
    reviewForm.reviewStatus = ReviewStatus.approved.value;
    reviewForm.reason = '';
    reviewDialogVisible.value = true;
};

const submitReview = async () => {
    if (!currentAd.value) return;
    try {
        await reviewAdApi(currentAd.value.adId, reviewForm);
        ElMessage.success('审核完成');
        reviewDialogVisible.value = false;
        fetchAds();
    } catch (error) {
        ElMessage.error(`审核失败：${(error as Error).message}`);
    }
};

onMounted(fetchAds);
</script>

<template>
    <div class="ads-container">
        <div class="header-bar">
            <div class="filters">
                <ElSelect
                    v-model="filter.status"
                    placeholder="审核状态"
                    clearable
                    class="filter-item"
                    @change="handleFilterChange"
                >
                    <ElOption
                        v-for="opt in ReviewStatus()"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value"
                    />
                </ElSelect>
                <ElButton icon="Search" @click="fetchAds" plain>查询</ElButton>
            </div>
            <div class="pagination-wrapper">
                <ElPagination
                    v-model:current-page="pagination.page"
                    v-model:page-size="pagination.pageSize"
                    :total="total"
                    layout="total, prev, pager, next, sizes"
                    @size-change="handleSizeChange"
                    @current-change="handlePageChange"
                />
            </div>
        </div>
        <div class="list-container" v-loading="loading">
            <div v-if="ads.length === 0 && !loading" class="empty-container">
                <ElEmpty description="暂无广告数据" />
            </div>
            <ElScrollbar v-else>
                <div class="ads-list">
                    <ElCard v-for="ad in ads" :key="ad.adId" class="ad-item" shadow="hover">
                        <div class="ad-content">
                            <div class="ad-media">
                                <ElImage
                                    v-if="ad.adType === AdType.image.value"
                                    :src="getFileFullPath(ad.mediaUrl)"
                                    fit="cover"
                                    class="media-preview"
                                >
                                    <template #error>
                                        <div class="image-slot">
                                            <ElIcon><Picture /></ElIcon>
                                        </div>
                                    </template>
                                </ElImage>
                                <video
                                    v-else-if="ad.adType === AdType.video.value"
                                    :src="ad.mediaUrl"
                                    class="media-preview"
                                    controls
                                ></video>
                                <div v-else class="media-placeholder">无媒体</div>
                            </div>

                            <div class="ad-info">
                                <div class="ad-header">
                                    <h3 class="ad-title">{{ ad.title || '未命名广告' }}</h3>
                                    <ElTag
                                        :type="ReviewStatus(ad.reviewStatus).type"
                                        size="small"
                                        disable-transitions
                                    >
                                        {{ ReviewStatus(ad.reviewStatus).label }}
                                    </ElTag>
                                    <ElTag
                                        :type="AdActive(ad.isActive).type"
                                        size="small"
                                        disable-transitions
                                    >
                                        {{ AdActive(ad.isActive).label }}
                                    </ElTag>
                                </div>

                                <div class="ad-details">
                                    <div class="detail-item">
                                        <span class="label">类型：</span>
                                        <span>{{ AdType(ad.adType).label }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="label">预算：</span>
                                        <span>¥{{ ad.weeklyBudget.toFixed(2) }} / 周</span>
                                    </div>
                                    <div class="detail-item full-width">
                                        <span class="label">落地页：</span>
                                        <a
                                            v-if="ad.landingPage"
                                            :href="ad.landingPage"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="link"
                                            >{{ ad.landingPage }}</a
                                        >
                                        <span v-else>无</span>
                                    </div>
                                </div>
                            </div>

                            <div class="ad-actions">
                                <ElButton link type="primary" @click.stop="handleReview(ad)">
                                    审核
                                </ElButton>
                            </div>
                        </div>
                    </ElCard>
                </div>
            </ElScrollbar>
        </div>

        <ElDialog v-model="reviewDialogVisible" title="广告审核" width="500px">
            <ElForm :model="reviewForm" label-width="80px">
                <ElFormItem label="审核结果">
                    <ElRadioGroup v-model="reviewForm.reviewStatus">
                        <ElRadio :label="ReviewStatus.approved.value">通过</ElRadio>
                        <ElRadio :label="ReviewStatus.rejected.value">拒绝</ElRadio>
                    </ElRadioGroup>
                </ElFormItem>
                <ElFormItem
                    label="原因"
                    v-if="reviewForm.reviewStatus === ReviewStatus.rejected.value"
                >
                    <ElInput
                        v-model="reviewForm.reason"
                        :rows="5"
                        type="textarea"
                        resize="none"
                        placeholder="请输入拒绝原因"
                    />
                </ElFormItem>
            </ElForm>
            <template #footer>
                <span class="dialog-footer">
                    <ElButton @click="reviewDialogVisible = false">取消</ElButton>
                    <ElButton type="primary" @click="submitReview">确定</ElButton>
                </span>
            </template>
        </ElDialog>
    </div>
</template>

<style scoped lang="scss">
.ads-container {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;

    .header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-shrink: 0;

        .filters {
            display: flex;
            gap: 10px;

            .filter-item {
                width: 150px;
            }
        }
    }

    .list-container {
        flex-grow: 1;
        overflow: hidden;

        .empty-container {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .ads-list {
            padding-right: 10px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding-bottom: 20px;

            .ad-item {
                cursor: default;

                :deep(.el-card__body) {
                    padding: 15px;
                }

                .ad-content {
                    display: flex;
                    gap: 20px;
                    align-items: flex-start;

                    .ad-media {
                        width: 160px;
                        height: 100px;
                        flex-shrink: 0;
                        background-color: #f5f7fa;
                        border-radius: 4px;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 1px solid var(--el-border-color-lighter);

                        .media-preview {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }

                        .image-slot {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 100%;
                            height: 100%;
                            color: var(--el-text-color-secondary);
                            font-size: 24px;
                        }

                        .media-placeholder {
                            color: var(--el-text-color-secondary);
                            font-size: 12px;
                        }
                    }

                    .ad-info {
                        flex-grow: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;

                        .ad-header {
                            display: flex;
                            align-items: center;
                            gap: 8px;

                            .ad-title {
                                margin: 0;
                                font-size: 16px;
                                font-weight: 600;
                                color: var(--el-text-color-primary);
                            }
                        }

                        .ad-details {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 8px;
                            font-size: 13px;
                            color: var(--el-text-color-regular);

                            .detail-item {
                                display: flex;
                                align-items: center;

                                .label {
                                    color: var(--el-text-color-secondary);
                                }

                                &.full-width {
                                    width: 100%;
                                }
                            }

                            .link {
                                color: var(--el-color-primary);
                                text-decoration: none;
                                &:hover {
                                    text-decoration: underline;
                                }
                            }
                        }
                    }

                    .ad-actions {
                        display: flex;
                        align-items: center;
                        align-self: center;
                        flex-shrink: 0;
                        margin-left: auto;
                    }
                }
            }
        }
    }
}
</style>
