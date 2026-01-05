<script setup lang="ts">
import { listCategoriesApi } from '@/apis/commonApis';
import {
    type PubStats,
    type WebsiteDetails,
    WebsiteVerification,
    getSiteDetailsApi,
    pubGetSiteStatsApi,
    pubVerifySiteApi,
} from '@/apis/publisherApis';
import CodeBlock from '@/components/CodeBlock.vue';
import PubDataChart from '@/components/PubDataChart.vue';
import { useSubTitle } from '@/composables/useSubTitle';
import { formatDateForApi, formatDateTime } from '@/utils/tools';

const router = useRouter();
const { websiteId } = defineProps<{ websiteId: string }>();

const loading = ref(true);
const verifying = ref(false);
const website = ref<WebsiteDetails | null>(null);
useSubTitle(() => website.value?.websiteName);
const categories = ref<string[]>([]);
const isVerificationExpanded = ref(true);

const stats = ref<PubStats>();
const statsLoading = ref(false);
const currentDateRange = ref<[Date, Date]>();

const fetchStats = async () => {
    statsLoading.value = true;
    try {
        let params = {};
        if (currentDateRange.value && currentDateRange.value.length === 2) {
            params = {
                startDate: formatDateForApi(currentDateRange.value[0]),
                endDate: formatDateForApi(currentDateRange.value[1]),
            };
        }
        const res = await pubGetSiteStatsApi(websiteId, params);
        stats.value = res.data;
    } catch (error) {
        ElMessage.error(`获取统计数据失败：${(error as Error).message}`);
    } finally {
        statsLoading.value = false;
    }
};

const handleDateChange = (range: [Date, Date]) => {
    currentDateRange.value = range;
    fetchStats();
};

const fetchWebsite = async () => {
    loading.value = true;
    try {
        const res = await getSiteDetailsApi(websiteId);
        website.value = res.data;
        isVerificationExpanded.value =
            website.value.isVerified !== WebsiteVerification.verified.value;
    } catch (error) {
        ElMessage.error(`获取网站信息失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const handleVerify = async () => {
    if (!website.value) return;

    verifying.value = true;
    const verifyMsg = ElMessage.primary({ message: '正在验证中，请稍候…', duration: 0 });
    try {
        await pubVerifySiteApi(website.value.websiteId);
        ElMessage.success('验证成功');
        fetchWebsite();
    } catch (error) {
        ElMessage.error(`验证失败：${(error as Error).message}`);
    } finally {
        verifying.value = false;
        verifyMsg.close();
    }
};

const metaTag = computed(() => {
    if (!website.value) return '';
    return `<meta name="adflux-verification" content="${website.value.verificationToken}" />`;
});

const adsHost = import.meta.env.VITE_ADS_HOST;
const adScript = `<script type="module" src="${import.meta.resolve(`${adsHost}/main.js`)}"><\/script>`;

const slotImgScript = `<adflux-slot></adflux-slot>`;
const slotVideoScript = `<adflux-video></adflux-video>`;

const categoryScript = `<meta name="adflux-page-category" content="(分类名)" />`;

onMounted(async () => {
    watch(() => websiteId, fetchWebsite, { immediate: true });

    try {
        const result = await listCategoriesApi();
        categories.value = result.data.map((cat) => cat.categoryName);
    } catch (error) {
        ElMessage.error(`获取分类列表失败：${(error as Error).message}`);
    }
});
</script>

<template>
    <div class="website-detail" v-loading="loading">
        <div class="page-header">
            <ElPageHeader @back="router.back()">
                <template #content>
                    <span class="text-large font-600 mr-3"> 网站详情 </span>
                </template>
            </ElPageHeader>
        </div>

        <div v-if="website" class="content-container">
            <ElCard class="detail-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <span class="title">基本信息</span>
                        <ElTag
                            :type="WebsiteVerification(website.isVerified).type"
                            disable-transitions
                        >
                            {{ WebsiteVerification(website.isVerified).label }}
                        </ElTag>
                    </div>
                </template>
                <ElDescriptions :column="1" border>
                    <ElDescriptionsItem label="网站名称">{{
                        website.websiteName
                    }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="域名">{{ website.domain }}</ElDescriptionsItem>
                    <ElDescriptionsItem label="创建时间">{{
                        formatDateTime(website.createTime)
                    }}</ElDescriptionsItem>
                    <ElDescriptionsItem
                        label="验证时间"
                        v-if="website.isVerified === WebsiteVerification.verified.value"
                    >
                        {{ formatDateTime(website.verifyTime) }}
                    </ElDescriptionsItem>
                </ElDescriptions>

                <PubDataChart
                    :loading="statsLoading"
                    :stats="stats"
                    @dateChange="handleDateChange"
                />
            </ElCard>

            <ElCard
                class="detail-card"
                :class="{ 'is-collapsed': !isVerificationExpanded }"
                shadow="never"
                :body-style="{ padding: 0 }"
            >
                <template #header>
                    <div class="card-header">
                        <span class="title">网站验证</span>
                        <ElButton
                            link
                            type="primary"
                            v-if="website.isVerified === WebsiteVerification.verified.value"
                            @click="isVerificationExpanded = !isVerificationExpanded"
                        >
                            {{ isVerificationExpanded ? '收起' : '展开' }}
                        </ElButton>
                    </div>
                </template>
                <div class="collapse-wrapper" :class="{ 'is-expanded': isVerificationExpanded }">
                    <div class="collapse-content">
                        <div class="verification-steps">
                            <div class="step">
                                <h4>第一步：添加 Meta 标签</h4>
                                <p>
                                    请将以下 Meta 标签添加到您网站首页的
                                    <code>&lt;head&gt;</code> 标签中：
                                </p>
                                <CodeBlock :code="metaTag" lang="html" />
                            </div>
                            <div class="step">
                                <h4>第二步：点击验证</h4>
                                <p>完成上述步骤后，点击下方按钮进行验证。</p>
                                <ElButton
                                    type="primary"
                                    size="small"
                                    @click="handleVerify"
                                    :disabled="verifying"
                                    class="verify-btn"
                                    >立即验证</ElButton
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </ElCard>

            <ElCard class="detail-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <span class="title">广告投放</span>
                    </div>
                </template>
                <div class="integration-guide">
                    <div class="step">
                        <h4>第一步：添加广告脚本</h4>
                        <p>
                            请将以下脚本代码添加到您网站的 <code>&lt;body&gt;</code> 结束标签之前：
                        </p>
                        <CodeBlock :code="adScript" lang="html" />
                    </div>
                    <div class="step">
                        <h4>第二步：添加广告栏位</h4>
                        <p>对于图片广告，在每个广告展示的位置添加相应的广告栏位代码：</p>
                        <CodeBlock :code="slotImgScript" lang="html" />
                        <p>
                            提示：您可以使用 <code>style</code> 或
                            <code>class</code>
                            属性来设置广告的尺寸，广告会自动根据尺寸选择横幅或侧栏类广告。
                        </p>
                        <p>
                            如果需要手动指定广告类型，可以添加 <code>layout="banner"</code> 或
                            <code>layout="sidebar"</code> 属性。
                        </p>
                        <br />
                        <p>对于视频广告，需要使用下面的广告组件代码：</p>
                        <CodeBlock :code="slotVideoScript" lang="html" />
                        <p>
                            您可以将广告组件设置为隐藏，在需要的时候显示，并调用
                            <code>adFluxVideo.play()</code> 开始播放广告。
                        </p>
                        <p>
                            之后，可以使用 <code>addEventListener</code> 监听
                            <code>ad-finished</code> 和
                            <code>ad-error</code> 事件，分别代表广告播放完成和播放出错。
                        </p>
                        <br />
                        <p>
                            提示：如果您使用 Vue，请在
                            <code>compilerOptions</code> 中注册广告栏位组件：
                        </p>
                        <CodeBlock
                            code="compilerOptions: { isCustomElement: (tag) => (tag.startsWith('adflux-')) }"
                            lang="javascript"
                        />
                    </div>
                    <div class="step">
                        <h4>第三步：添加分类标识（可选）</h4>
                        <p>
                            如果想要更加精准投放广告，可以在每个页面的
                            <code>&lt;head&gt;</code> 标签中，添加内容分类标识：
                        </p>
                        <CodeBlock :code="categoryScript" lang="html" />
                        <p>
                            提示：将 (分类名)
                            替换为该页面的实际内容分类名称，目前可选的分类名称包括：{{
                                categories.length ? categories.join('、') : '暂无可用分类'
                            }}。
                        </p>
                    </div>
                </div>
            </ElCard>
        </div>
    </div>
</template>

<style scoped lang="scss">
.website-detail {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;

    .page-header {
        margin-bottom: 20px;
    }

    .content-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 20px;

        .detail-card {
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .title {
                    font-size: 18px;
                    font-weight: bold;
                }
            }

            :deep(.el-card__header) {
                transition: border-bottom-color 0.3s;
            }

            &.is-collapsed {
                :deep(.el-card__header) {
                    border-bottom-color: transparent;
                }
            }

            .collapse-wrapper {
                display: grid;
                grid-template-rows: 0fr;
                transition: grid-template-rows 0.3s ease;
                overflow: hidden;

                &.is-expanded {
                    grid-template-rows: 1fr;
                }

                .collapse-content {
                    min-height: 0;

                    .verification-steps {
                        padding: var(--el-card-padding);
                    }
                }
            }

            .step {
                h4 {
                    margin: 0 0 12px;
                    font-weight: 600;
                }

                .verify-btn {
                    margin-top: 8px;
                }

                + .step {
                    margin-top: 24px;
                }
            }
        }
    }
}
</style>
