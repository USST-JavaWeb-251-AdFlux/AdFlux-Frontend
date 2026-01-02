<script setup lang="ts">
import {
    type AdStats,
    advAddCompanyNameApi,
    advGetProfileApi,
    advGetStatOverviewApi,
} from '@/apis/advApis';
import AdDataChart from '@/components/AdDataChart.vue';
import { formatDateForApi } from '@/utils/tools';

const stats = ref<AdStats>();

const companyName = ref('');
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
        const res = await advGetStatOverviewApi(params);
        stats.value = res.data;
    } catch (error) {
        ElMessage.error(`获取统计数据失败：${(error as Error).message}`);
    }
};

const handleDateChange = (range: [Date, Date]) => {
    currentDateRange.value = range;
    fetchStats();
};

const fetchProfile = async () => {
    try {
        const res = await advGetProfileApi();
        companyName.value = res.data.companyName;
    } catch (error) {
        ElMessage.error(`获取企业信息失败：${(error as Error).message}`);
    }
};

const handleEditCompanyName = async () => {
    try {
        const { value } = await ElMessageBox.prompt('设置企业名称后不可再次修改', '设置企业名称', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: companyName.value,
            inputPattern: /\S+/,
            inputErrorMessage: '企业名称不能为空',
        });

        await advAddCompanyNameApi({ companyName: value.trim() });
        await fetchProfile();
        ElMessage.success('修改成功');
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(`修改失败：${(error as Error).message}`);
        }
    }
};

onMounted(() => {
    loading.value = true;
    fetchProfile().finally(() => {
        loading.value = false;
    });
});
</script>

<template>
    <div class="home-container" v-loading="loading">
        <div class="header-section">
            <h1 class="company-title">{{ companyName || '未命名企业' }}</h1>
            <ElButton v-if="!companyName" type="primary" link @click="handleEditCompanyName">
                <ElIcon class="mr-1"><Edit /></ElIcon>
                <span>设置</span>
            </ElButton>
        </div>

        <AdDataChart :loading="loading" :stats="stats" @dateChange="handleDateChange" />
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

        .company-title {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            color: var(--el-text-color-primary);
        }
    }

    :deep(.stat-item) {
        flex: 1;
        min-width: 200px;
        text-align: center;

        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: var(--el-color-primary);
        }
    }
}

.mr-1 {
    margin-right: 4px;
}
</style>
