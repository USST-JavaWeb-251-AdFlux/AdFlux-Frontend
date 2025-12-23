<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useResizeObserver } from '@vueuse/core';
import { LineChart, type LineSeriesOption } from 'echarts/charts';
import {
    GridComponent,
    type GridComponentOption,
    LegendComponent,
    type LegendComponentOption,
    TooltipComponent,
    type TooltipComponentOption,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
    AdActive,
    type AdCategory,
    type AdDetails,
    AdLayout,
    AdType,
    ReviewStatus,
    advDeleteAdApi,
    advGetAdByIdApi,
    advGetAdStatsApi,
    advListCategories,
    advToggleAdStatusApi,
} from '@/apis/advApis';
import { getFileFullPath } from '@/apis/request';
import { formatDateTime } from '@/utils/tools';

echarts.use([LineChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

type ECOption = echarts.ComposeOption<
    LineSeriesOption | TooltipComponentOption | GridComponentOption | LegendComponentOption
>;

const props = defineProps<{ adId: string }>();
const router = useRouter();

const loading = ref(true);
const ad = ref<AdDetails>();
const categories = ref<AdCategory[]>([]);

const stats = ref<{
    ctr: number;
    totalClicks: number;
    totalImpressions: number;
    daily: { clicks: number; date: string; impressions: number }[];
}>();
const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

useResizeObserver(chartRef, () => {
    chartInstance?.resize();
});

const dateRange = ref<[Date, Date]>();

const shortcuts = [
    {
        text: '本自然周',
        value: () => {
            const end = new Date();
            const start = new Date();
            const day = start.getDay() || 7;
            start.setTime(start.getTime() - 3600 * 1000 * 24 * (day - 1));
            return [start, end];
        },
    },
    {
        text: '最近 7 天',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            return [start, end];
        },
    },
    {
        text: '最近 30 天',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            return [start, end];
        },
    },
];

const fetchCategories = async () => {
    try {
        const res = await advListCategories();
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
        const res = await advGetAdByIdApi(props.adId);
        ad.value = res.data;
    } catch (error) {
        ElMessage.error(`获取详情失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const formatDateForApi = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const fetchStats = async () => {
    try {
        let params = {};
        if (dateRange.value && dateRange.value.length === 2) {
            params = {
                startDate: formatDateForApi(dateRange.value[0]),
                endDate: formatDateForApi(dateRange.value[1]),
            };
        }

        const res = await advGetAdStatsApi(props.adId, params);
        stats.value = res.data;
        nextTick(() => {
            initChart();
        });
    } catch (error) {
        ElMessage.error(`获取统计数据失败：${(error as Error).message}`);
    }
};

const initChart = () => {
    if (!chartRef.value || !stats.value) return;

    if (chartInstance) {
        chartInstance.dispose();
    }

    chartInstance = echarts.init(chartRef.value);

    const dates = stats.value.daily.map((d) => d.date);
    const clicks = stats.value.daily.map((d) => d.clicks);
    const impressions = stats.value.daily.map((d) => d.impressions);

    const option: ECOption = {
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ['展示量', '点击量'],
        },
        grid: {
            left: '4%',
            right: '4%',
            bottom: '12%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                rotate: 0,
                interval: 'auto',
                hideOverlap: true,
            },
        },
        yAxis: [
            {
                type: 'value',
                name: '展示量',
                position: 'left',
                minInterval: 1,
            },
            {
                type: 'value',
                name: '点击量',
                position: 'right',
                minInterval: 1,
                alignTicks: true,
            },
        ],
        series: [
            {
                name: '展示量',
                type: 'line',
                data: impressions,
                yAxisIndex: 0,
                smooth: true,
                itemStyle: { color: '#F44336' },
            },
            {
                name: '点击量',
                type: 'line',
                data: clicks,
                yAxisIndex: 1,
                smooth: true,
                itemStyle: { color: '#2196F3' },
            },
        ],
    };

    chartInstance.setOption(option);
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
    const shortcut = shortcuts?.[0];
    if (shortcut && typeof shortcut.value === 'function') {
        dateRange.value = shortcut.value();
    }

    fetchAdDetails();
    fetchCategories();
    fetchStats();
});

onUnmounted(() => {
    chartInstance?.dispose();
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
                            :src="getFileFullPath(ad.mediaUrl)"
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
                            :src="getFileFullPath(ad.mediaUrl)"
                            class="media-preview"
                            controls
                        ></video>
                        <div v-else class="media-placeholder">无媒体资源</div>
                    </div>
                </div>

                <div class="info-section">
                    <ElDescriptions :column="1" border>
                        <ElDescriptionsItem label="广告ID">{{ ad.adId }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="类型">{{
                            AdType(ad.adType)?.label
                        }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="布局">{{
                            AdLayout(ad.adLayout)?.label
                        }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="周预算">
                            ￥{{ ad.weeklyBudget.toFixed(2) }}
                        </ElDescriptionsItem>
                        <ElDescriptionsItem label="落地页">
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

            <div class="stats-section" v-if="stats">
                <div class="section-title">数据统计</div>
                <div class="filter-container">
                    <span class="label">展示周期：</span>
                    <ElDatePicker
                        v-model="dateRange"
                        type="daterange"
                        unlink-panels
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        :shortcuts="shortcuts"
                        @change="fetchStats"
                    />
                </div>
                <div class="stats-summary">
                    <ElCard shadow="hover" class="stat-item">
                        <template #header>总展示量</template>
                        <div class="stat-value">{{ stats.totalImpressions }}</div>
                    </ElCard>
                    <ElCard shadow="hover" class="stat-item">
                        <template #header>总点击量</template>
                        <div class="stat-value">{{ stats.totalClicks }}</div>
                    </ElCard>
                    <ElCard shadow="hover" class="stat-item">
                        <template #header>点击率 (CTR)</template>
                        <div class="stat-value">{{ (stats.ctr * 100).toFixed(2) }}%</div>
                    </ElCard>
                </div>
                <div class="chart-container" ref="chartRef"></div>
            </div>
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
