<script setup lang="ts">
import {
    AdActive,
    type AdDetails,
    AdLayout,
    type AdStats,
    AdType,
    ReviewStatus,
    advDeleteAdApi,
    advGetAdByIdApi,
    advGetAdStatsApi,
    advToggleAdStatusApi,
} from '@/apis/advApis';
import { type AdCategory, listCategoriesApi } from '@/apis/commonApis';
import { getBackendFullPath } from '@/apis/request';
import AdDataChart from '@/components/AdDataChart.vue';
import { useSubTitle } from '@/composables/useSubTitle';
import { formatDateForApi, formatDateTime } from '@/utils/tools';

const { adId } = defineProps<{ adId: string }>();
const router = useRouter();

const loading = ref(true);
const statLoading = ref(true);
const ad = ref<AdDetails>();
const categories = ref<AdCategory[]>([]);
useSubTitle(() => ad.value?.title);

const stats = ref<AdStats>();

const currentDateRange = ref<[Date, Date]>();

const fetchCategories = async () => {
    try {
        const res = await listCategoriesApi();
        categories.value = res.data;
    } catch (error) {
        ElMessage.error(`获取分类失败：${(error as Error).message}`);
    }
};

const getCategoryName = (id: string) => {
    const cat = categories.value.find((c) => c.categoryId === id);
    return cat ? cat.categoryName : id;
};

const fetchAdDetails = async () => {
    loading.value = true;
    try {
        const res = await advGetAdByIdApi(adId);
        ad.value = res.data;
    } catch (error) {
        ElMessage.error(`获取详情失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const fetchStats = async () => {
    statLoading.value = true;
    try {
        let params = {};
        if (currentDateRange.value && currentDateRange.value.length === 2) {
            params = {
                startDate: formatDateForApi(currentDateRange.value[0]),
                endDate: formatDateForApi(currentDateRange.value[1]),
            };
        }

        const res = await advGetAdStatsApi(adId, params);
        stats.value = res.data;
    } catch (error) {
        ElMessage.error(`获取统计数据失败：${(error as Error).message}`);
    } finally {
        statLoading.value = false;
    }
};

const handleDateChange = (range: [Date, Date]) => {
    currentDateRange.value = range;
    fetchStats();
};

const handleBack = () => {
    router.back();
};

const handleEdit = () => {
    if (ad.value) {
        router.replace({ name: 'AdvertiserAdEdit', params: { adId: ad.value.adId } });
    }
};

const handleToggleStatus = async () => {
    if (!ad.value) return;
    const newStatus =
        ad.value.isActive === AdActive.active.value
            ? AdActive.inactive.value
            : AdActive.active.value;
    try {
        await advToggleAdStatusApi(ad.value.adId, { isActive: newStatus });
        ElMessage.success('状态更新成功');
        fetchAdDetails();
    } catch (error) {
        ElMessage.error(`状态更新失败：${(error as Error).message}`);
    }
};

const handleDelete = async () => {
    if (!ad.value) return;
    try {
        await ElMessageBox.confirm('确定要删除这个广告吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        });
    } catch {
        return;
    }
    try {
        await advDeleteAdApi(ad.value.adId);
        ElMessage.success('删除成功');
        router.push({ name: 'AdvertiserAds' });
    } catch (error) {
        ElMessage.error(`删除失败：${(error as Error).message}`);
    }
};

onMounted(() => {
    fetchCategories();

    watch(
        () => adId,
        () => {
            fetchAdDetails();
            fetchStats();
        },
        { immediate: true },
    );
});
</script>

<template>
    <div class="detail-container" v-loading="loading">
        <div class="header-bar" v-if="ad">
            <ElPageHeader @back="handleBack">
                <template #content>
                    <span class="text-large font-600 mr-3">广告详情</span>
                </template>
                <template #extra>
                    <ElButton
                        :type="ad.isActive === AdActive.active.value ? 'warning' : 'success'"
                        @click="handleToggleStatus"
                    >
                        {{ ad.isActive === AdActive.active.value ? '禁用' : '启用' }}
                    </ElButton>
                    <ElButton type="primary" @click="handleEdit">编辑</ElButton>
                    <ElButton type="danger" @click="handleDelete">删除</ElButton>
                </template>
            </ElPageHeader>
        </div>

        <ElCard v-if="ad" class="detail-card" shadow="never">
            <template #header>
                <div class="card-header">
                    <span class="title">{{ ad.title || '未命名广告' }}</span>
                    <div class="tags">
                        <ElTag :type="ReviewStatus(ad.reviewStatus)?.type" disable-transitions>{{
                            ReviewStatus(ad.reviewStatus)?.label
                        }}</ElTag>
                        <ElTag :type="AdActive(ad.isActive)?.type" disable-transitions>{{
                            AdActive(ad.isActive)?.label
                        }}</ElTag>
                    </div>
                </div>
            </template>

            <div class="content-wrapper">
                <div class="media-section">
                    <div class="media-container">
                        <ElImage
                            v-if="ad.adType === AdType.image.value"
                            :src="getBackendFullPath(ad.mediaUrl)"
                            fit="contain"
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
                            :src="getBackendFullPath(ad.mediaUrl)"
                            class="media-preview"
                            controls
                        ></video>
                        <div v-else class="media-placeholder">无媒体资源</div>
                    </div>
                </div>

                <div class="info-section">
                    <ElDescriptions :column="1" border>
                        <ElDescriptionsItem label="广告ID">{{ ad.adId }}</ElDescriptionsItem>
                        <ElDescriptionsItem
                            v-if="ad.reviewStatus === ReviewStatus.rejected.value"
                            label="审核拒绝原因"
                        >
                            <ElText type="danger">{{ ad.rejectReason || '未提供拒绝原因' }}</ElText>
                        </ElDescriptionsItem>
                        <ElDescriptionsItem label="类型">{{
                            AdType(ad.adType)?.label
                        }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="布局">{{
                            AdLayout(ad.adLayout)?.label
                        }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="周预算">
                            ￥{{ ad.weeklyBudget.toFixed(2) }}
                        </ElDescriptionsItem>
                        <ElDescriptionsItem>
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
                            <a
                                :href="ad.landingPage"
                                target="_blank"
                                class="link"
                                rel="noopener noreferrer"
                                >{{ ad.landingPage }}</a
                            >
                        </ElDescriptionsItem>
                        <ElDescriptionsItem label="分类">{{
                            getCategoryName(ad.categoryId)
                        }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="创建时间">{{
                            formatDateTime(ad.createTime)
                        }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="更新时间">{{
                            formatDateTime(ad.editTime)
                        }}</ElDescriptionsItem>
                    </ElDescriptions>
                </div>
            </div>

            <AdDataChart
                :loading="!loading && statLoading"
                :stats="stats"
                @dateChange="handleDateChange"
            />
        </ElCard>
    </div>
</template>

<style scoped lang="scss">
.detail-container {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .header-bar {
        margin-bottom: 16px;
    }

    .detail-card {
        flex-grow: 1;
        overflow: auto;

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .title {
                font-size: 18px;
                font-weight: bold;
            }

            .tags {
                display: flex;
                gap: 10px;
            }
        }

        .content-wrapper {
            display: flex;
            gap: 30px;
            flex-wrap: wrap;

            .media-section {
                flex: 0 0 400px;

                .media-container {
                    width: 100%;
                    height: 300px;
                    background-color: #f5f7fa;
                    border: 1px solid var(--el-border-color-lighter);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;

                    .media-preview {
                        max-width: 100%;
                        max-height: 100%;
                    }

                    .media-placeholder {
                        color: var(--el-text-color-secondary);
                    }

                    .image-slot {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                        height: 100%;
                        color: var(--el-text-color-secondary);
                        font-size: 30px;
                    }
                }
            }

            .info-section {
                flex: 1;
                min-width: 300px;

                .link {
                    color: var(--el-color-primary);
                    text-decoration: none;
                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
        }

        .stats-section {
            margin-top: 30px;
            border-top: 1px solid var(--el-border-color-lighter);
            padding-top: 20px;

            .section-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }

            .filter-container {
                margin-bottom: 20px;
                display: flex;
                align-items: center;

                .label {
                    margin-right: 10px;
                    font-size: 14px;
                    color: var(--el-text-color-regular);
                }

                :deep(.el-date-editor) {
                    flex-grow: 0;
                }
            }

            .stats-summary {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;

                .stat-item {
                    flex: 1;
                    text-align: center;

                    .stat-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: var(--el-color-primary);
                    }
                }
            }

            .chart-container {
                width: 100%;
                height: 400px;
            }
        }
    }
}
</style>
