<script setup lang="ts">
import { type Highlighter, createHighlighter } from 'shiki';

const { code, lang = 'javascript' } = defineProps<{
    code: string;
    lang?: string;
}>();

const highlightedHtml = ref<string | null>(null);
let highlighter: Highlighter | null = null;

const updateHighlight = async () => {
    if (!highlighter) {
        highlighter = await createHighlighter({
            themes: ['github-light'],
            langs: ['javascript', 'typescript', 'html', 'css', 'json', 'bash'],
        });
    }
    highlightedHtml.value = highlighter.codeToHtml(code, {
        lang,
        theme: 'github-light',
    });
};

const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(code);
        ElMessage.success('已复制');
    } catch {
        ElMessage.error('复制失败');
    }
};

onMounted(updateHighlight);

watch(() => [code, lang], updateHighlight);
</script>

<template>
    <div class="code-block">
        <div v-if="highlightedHtml" class="code-content" v-html="highlightedHtml"></div>
        <code v-else class="code-content">{{ code }}</code>
        <ElButton type="primary" link @click="handleCopy">复制代码</ElButton>
    </div>
</template>

<style scoped lang="scss">
.code-block {
    background-color: #f5f7fa;
    padding: 12px;
    border-radius: 8px;
    margin: 16px 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-family: 'Fira Code', monospace;
    border: 1px solid #e4e7ed;

    .code-content {
        flex: 1;
        margin-right: 16px;
        overflow-x: auto;

        :deep(pre) {
            margin: 0;
            padding: 0 !important;
            background-color: transparent !important;
            font-family: inherit;
        }
    }

    .el-button {
        flex-shrink: 0;
    }
}
</style>
