<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { advAddCompanyNameApi, advGetProfileApi, advGetStatOverviewApi } from '@/apis/advApis';

const stats = ref<{
    ctr: number;
    totalClicks: number;
    totalImpressions: number;
    totalSpend: number;
}>();

const companyName = ref('');
const loading = ref(false);

const fetchStats = async () => {
    try {
        const res = await advGetStatOverviewApi();
        stats.value = res.data;
    } catch (error) {
        ElMessage.error(`获取统计数据失败：${(error as Error).message}`);
    }
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
        const { value } = await ElMessageBox.prompt('请输入新的企业名称', '修改企业名称', {
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
    Promise.all([fetchStats(), fetchProfile()]).finally(() => {
        loading.value = false;
    });
});
</script>

<template>
    <div class="home-container" v-loading="loading">
        <div class="header-section">
            <h1 class="company-title">{{ companyName || '未命名企业' }}</h1>
            <ElButton type="primary" link @click="handleEditCompanyName">
                <ElIcon class="mr-1"><Edit /></ElIcon> 修改
            </ElButton>
        </div>

        <div class="stats-section" v-if="stats">
            <div class="section-title">数据概览</div>
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
                <ElCard shadow="hover" class="stat-item">
                    <template #header>总花费</template>
                    <div class="stat-value">￥{{ stats.totalSpend.toFixed(2) }}</div>
                </ElCard>
            </div>
        </div>
        <div v-else-if="!loading" class="empty-placeholder">暂无数据</div>
    </div>
</template>

<style scoped lang="scss">
.home-container {
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

    .stats-section {
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            color: var(--el-text-color-regular);
        }

        .stats-summary {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;

            .stat-item {
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
    }

    .empty-placeholder {
        text-align: center;
        color: var(--el-text-color-secondary);
        margin-top: 50px;
    }
}

.mr-1 {
    margin-right: 4px;
}
</style>
