<script setup lang="ts">
import { useRouter } from 'vue-router';
import { getAdminDashboardApi } from '@/apis/adminApis';

const router = useRouter();
const loading = ref(false);
const dashboardData = ref<{
    activeReviewedAds: number;
    pendingAds: number;
    totalAds: number;
    totalUsers: number;
    totalWebsites: number;
} | null>(null);

const fetchDashboardData = async () => {
    loading.value = true;
    try {
        const res = await getAdminDashboardApi();
        dashboardData.value = res.data;
    } catch (error) {
        ElMessage.error(`获取概览数据失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const navigateTo = (name: string) => {
    router.push({ name });
};

onMounted(() => {
    fetchDashboardData();
});
</script>

<template>
    <div class="home-container" v-loading="loading">
        <div class="header-section">
            <h1 class="title">管理概览</h1>
        </div>

        <ElRow :gutter="20" class="data-grid">
            <ElCol :span="8">
                <ElCard
                    shadow="hover"
                    class="data-card clickable"
                    @click="navigateTo('AdminAdReview')"
                >
                    <template #header>
                        <div class="card-header">
                            <span>总广告数</span>
                        </div>
                    </template>
                    <div class="card-value">{{ dashboardData?.totalAds ?? 0 }}</div>
                </ElCard>
            </ElCol>
            <ElCol :span="8">
                <ElCard
                    shadow="hover"
                    class="data-card clickable"
                    @click="navigateTo('AdminAdReview')"
                >
                    <template #header>
                        <div class="card-header">
                            <span>待审核广告</span>
                        </div>
                    </template>
                    <div class="card-value warning">{{ dashboardData?.pendingAds ?? 0 }}</div>
                </ElCard>
            </ElCol>
            <ElCol :span="8">
                <ElCard
                    shadow="hover"
                    class="data-card clickable"
                    @click="navigateTo('AdminAdReview')"
                >
                    <template #header>
                        <div class="card-header">
                            <span>投放中广告</span>
                        </div>
                    </template>
                    <div class="card-value success">
                        {{ dashboardData?.activeReviewedAds ?? 0 }}
                    </div>
                </ElCard>
            </ElCol>
        </ElRow>

        <ElRow :gutter="20" class="data-grid mt-4">
            <ElCol :span="8">
                <ElCard shadow="hover" class="data-card clickable" @click="navigateTo('AdminUser')">
                    <template #header>
                        <div class="card-header">
                            <span>总用户数</span>
                        </div>
                    </template>
                    <div class="card-value">{{ dashboardData?.totalUsers ?? 0 }}</div>
                </ElCard>
            </ElCol>
            <ElCol :span="8">
                <ElCard shadow="hover" class="data-card">
                    <template #header>
                        <div class="card-header">
                            <span>总站点数</span>
                        </div>
                    </template>
                    <div class="card-value">{{ dashboardData?.totalWebsites ?? 0 }}</div>
                </ElCard>
            </ElCol>
            <ElCol :span="8">
                <ElCard
                    shadow="hover"
                    class="data-card clickable"
                    @click="navigateTo('AdminDebug')"
                >
                    <template #header>
                        <div class="card-header">
                            <span>调试面板</span>
                        </div>
                    </template>
                    <div class="card-value primary">DEV</div>
                </ElCard>
            </ElCol>
        </ElRow>
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

    .data-grid {
        margin-bottom: 20px;
    }

    .data-card {
        text-align: center;

        &.clickable {
            cursor: pointer;
            transition: transform 0.2s;
            &:hover {
                transform: translateY(-5px);
            }
        }

        .card-header {
            font-size: 16px;
            color: #606266;
        }

        .card-value {
            font-size: 32px;
            font-weight: bold;
            color: #303133;
            padding: 10px 0;

            &.warning {
                color: var(--el-color-warning);
            }
            &.success {
                color: var(--el-color-success);
            }
            &.primary {
                color: var(--el-color-primary);
            }
        }
    }

    .mt-4 {
        margin-top: 20px;
    }
}
</style>
