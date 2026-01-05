<script setup lang="ts">
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
import type { PubStats } from '@/apis/publisherApis';

echarts.use([LineChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

type ECOption = echarts.ComposeOption<
    LineSeriesOption | TooltipComponentOption | GridComponentOption | LegendComponentOption
>;

const { loading, stats } = defineProps<{
    loading: boolean;
    stats?: PubStats;
}>();

const emit = defineEmits<{ dateChange: [[Date, Date]] }>();

const chartRef = useTemplateRef('chartRef');
let chartInstance: echarts.ECharts | null = null;

useResizeObserver(chartRef, () => {
    chartInstance?.resize();
});

const dateRange = ref<[Date, Date]>();

const shortcuts: { text: string; value: () => [Date, Date] }[] = [
    {
        text: '最近 7 天',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
            return [start, end];
        },
    },
    {
        text: '最近 30 天',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 29);
            return [start, end];
        },
    },
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
];

const initChart = () => {
    if (!chartRef.value || !stats) return;

    if (chartInstance) {
        chartInstance.dispose();
    }

    chartInstance = echarts.init(chartRef.value);

    const daily = stats.daily ?? [];
    const dates = daily.map((d) => d.date);
    const clicks = daily.map((d) => d.clicks);
    const impressions = daily.map((d) => d.impressions);
    const revenues = daily.map((d) => d.revenue);
    const ctrs = daily.map((d) =>
        d.impressions > 0 ? Number(((d.clicks / d.impressions) * 100).toFixed(2)) : 0,
    );

    const option: ECOption = {
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ['展示量', '点击量', '点击率', '收入'],
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
                name: '展示量 / 点击量',
                position: 'left',
                minInterval: 1,
            },
            {
                type: 'value',
                name: '收入',
                position: 'right',
                splitLine: { show: false },
                axisTick: { show: false },
                axisLine: { show: false },
                axisLabel: {
                    formatter: '￥{value}',
                },
            },
            {
                type: 'value',
                position: 'right',
                max: 100,
                splitLine: { show: false },
                axisTick: { show: false },
                axisLine: { show: false },
                axisLabel: { show: false },
            },
        ],
        series: [
            {
                name: '点击率',
                type: 'line',
                data: ctrs,
                yAxisIndex: 2,
                smooth: true,
                showSymbol: false,
                areaStyle: {
                    color: '#FDD835',
                    opacity: 0.2,
                },
                itemStyle: { color: '#FDD835' },
                tooltip: {
                    valueFormatter: (value) => `${value}%`,
                },
                z: 1,
            },
            {
                name: '收入',
                type: 'line',
                lineStyle: {
                    type: 'dotted',
                },
                showSymbol: false,
                data: revenues,
                yAxisIndex: 1,
                itemStyle: { color: '#4CAF50' },
                tooltip: {
                    valueFormatter: (value) => `￥${value}`,
                },
                z: 4,
            },
            {
                name: '展示量',
                type: 'line',
                data: impressions,
                yAxisIndex: 0,
                smooth: false,
                itemStyle: { color: '#3F51B5' },
                z: 2,
            },
            {
                name: '点击量',
                type: 'line',
                data: clicks,
                yAxisIndex: 0,
                smooth: false,
                itemStyle: { color: '#03A9F4' },
                z: 3,
            },
        ],
    };

    chartInstance.setOption(option);
};

const handleDateChange = () => {
    if (dateRange.value) {
        emit('dateChange', dateRange.value);
    }
};

onMounted(() => {
    const shortcut = shortcuts?.[0];
    if (shortcut && typeof shortcut.value === 'function') {
        dateRange.value = shortcut.value();
        handleDateChange();
    }
});

watch(
    () => stats,
    () => nextTick(initChart),
    { deep: true },
);

onUnmounted(() => {
    chartInstance?.dispose();
});
</script>

<template>
    <div class="stats-section" v-loading="loading">
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
                @change="handleDateChange"
            />
        </div>
        <div class="stats-summary" v-if="stats">
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
                <div class="stat-value">
                    {{
                        stats.totalImpressions > 0
                            ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2)
                            : '0.00'
                    }}%
                </div>
            </ElCard>
            <ElCard shadow="hover" class="stat-item">
                <template #header>总收入</template>
                <div class="stat-value">￥{{ stats.totalRevenue.toFixed(2) }}</div>
            </ElCard>
        </div>
        <div class="chart-container" v-show="stats?.daily" ref="chartRef"></div>
    </div>
</template>

<style scoped lang="scss">
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
</style>
