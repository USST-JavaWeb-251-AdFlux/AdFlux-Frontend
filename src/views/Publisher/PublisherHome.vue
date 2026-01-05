<script setup lang="ts">
import { type PubStats, pubGetSummaryStatsApi } from '@/apis/publisherApis';
import PubDataChart from '@/components/PubDataChart.vue';
import { formatDateForApi } from '@/utils/tools';

const stats = ref<PubStats>();
const loading = ref(false);
const currentDateRange = ref<[Date, Date]>();

const fetchStats = async () => {
    try {
        let params = {};
        if (currentDateRange.value && currentDateRange.value.length === 2) {
            params = {
                startDate: formatDateForApi(currentDateRange.value[0]),
                endDate: formatDateForApi(currentDateRange.value[1]),
            };
        }
        const res = await pubGetSummaryStatsApi(params);
        stats.value = res.data;
    } catch (error) {
        ElMessage.error(`获取统计数据失败：${(error as Error).message}`);
    }
};

const handleDateChange = (range: [Date, Date]) => {
    currentDateRange.value = range;
    fetchStats();
};

onMounted(() => {
    loading.value = true;
    fetchStats().finally(() => {
        loading.value = false;
    });
});
</script>

<template>
    <div class="home-container" v-loading="loading">
        <div class="header-section">
            <h1 class="title">站长概览</h1>
        </div>

        <PubDataChart :loading="loading" :stats="stats" @dateChange="handleDateChange" />
    </div>
</template>

<style scoped lang="scss">
.home-container {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;

    .header-section {
        display: flex;
        align-items: baseline;
        margin-bottom: 30px;
        gap: 10px;

        .title {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
    }
}
</style>
