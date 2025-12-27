<script setup lang="ts">
import { listCategoriesApi } from '@/apis/commonApis';
import {
    type WebsiteDetails,
    WebsiteVerification,
    getSiteDetailsApi,
    pubVerifySiteApi,
} from '@/apis/publisherApis';
import CodeBlock from '@/components/CodeBlock.vue';
import { useSubTitle } from '@/composables/useSubTitle';
import { formatDateTime } from '@/utils/tools';

const router = useRouter();
const { websiteId } = defineProps<{ websiteId: string }>();

const loading = ref(true);
const website = ref<WebsiteDetails | null>(null);
useSubTitle(() => website.value?.websiteName);
const categories = ref<string[]>([]);

const fetchWebsite = async () => {
    loading.value = true;
    try {
        const res = await getSiteDetailsApi(websiteId);
        website.value = res.data;
    } catch (error) {
        ElMessage.error(`获取网站信息失败：${(error as Error).message}`);
    } finally {
        loading.value = false;
    }
};

const handleVerify = async () => {
    if (!website.value) return;
    try {
        await pubVerifySiteApi(website.value.websiteId);
        ElMessage.success('验证请求已发送，请刷新查看状态');
        fetchWebsite();
    } catch (error) {
        ElMessage.error(`验证失败：${(error as Error).message}`);
    }
};

const metaTag = computed(() => {
    if (!website.value) return '';
    return `<meta name="adflux-verification" content="${website.value.verificationToken}" />`;
});

const adsHost = import.meta.env.VITE_ADS_HOST;
const adScript = `<script type="module" src="${import.meta.resolve(`${adsHost}/main.js`)}"><\/script>`;

const slotScript = `<adflux-slot></adflux-slot>`;

const categoryScript = `<meta name="adflux-page-category" content="(分类名)" />`;

onMounted(() => {
    listCategoriesApi().then((res) => (categories.value = res.data.map((cat) => cat.categoryName)));
    watch(() => websiteId, fetchWebsite, { immediate: true });
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
                        <ElTag :type="WebsiteVerification(website.isVerified).type">
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
            </ElCard>

            <ElCard
                class="detail-card"
                v-if="website.isVerified === WebsiteVerification.unverified.value"
                shadow="never"
            >
                <template #header>
                    <div class="card-header">
                        <span class="title">网站验证</span>
                    </div>
                </template>
                <div class="verification-steps">
                    <div class="step">
                        <h4>第一步：添加 Meta 标签</h4>
                        <p>
                            请将以下 Meta 标签添加到您网站首页的 <code>&lt;head&gt;</code> 标签中：
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
                            class="verify-btn"
                            >立即验证</ElButton
                        >
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
                        <p>在每个广告展示的位置添加相应的广告栏位代码：</p>
                        <CodeBlock :code="slotScript" lang="html" />
                        <p>
                            提示：如果您使用 Vue，请在
                            <code>compilerOptions</code> 中注册广告栏位组件：
                        </p>
                        <CodeBlock
                            code="compilerOptions: { isCustomElement: (tag) => (tag === 'adflux-slot') }"
                            lang="javascript"
                        />
                        <p>
                            提示：您可以使用 <code>style</code> 或
                            <code>class</code> 属性来设置广告的尺寸。
                        </p>
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
                                categories.length ? categories.join('、') : '(暂无)'
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
    }

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
</style>
