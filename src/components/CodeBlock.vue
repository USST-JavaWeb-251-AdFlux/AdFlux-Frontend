<script setup lang="ts">
import {
    type BundledLanguage,
    type Highlighter,
    type SpecialLanguage,
    type ThemedToken,
    createHighlighter,
} from 'shiki';

const { code, lang = 'javascript' } = defineProps<{
    code: string;
    lang?: BundledLanguage | SpecialLanguage;
}>();

const tokens = ref<ThemedToken[][]>([]);
let highlighter: Highlighter | null = null;

const updateHighlight = async () => {
    if (!highlighter) {
        highlighter = await createHighlighter({
            themes: ['github-light'],
            langs: ['javascript', 'typescript', 'html', 'css', 'json', 'bash'],
        });
    }
    const result = highlighter.codeToTokens(code, { lang, theme: 'github-light' });
    tokens.value = result.tokens;
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
onUnmounted(() => highlighter?.dispose());

watch(
    () => [code, lang],
    async () => {
        tokens.value.length = 0;
        await nextTick();
        updateHighlight();
    },
);
</script>

<template>
    <div class="code-block">
        <pre
            v-if="tokens.length"
            class="code-content"
        ><code><div v-for="(line, i) in tokens" :key="i" class="line"><span v-for="(token, j) in line" :key="j" :style="{ color: token.color }">{{ token.content }}</span></div></code></pre>
        <pre v-else class="code-content"><code>{{ code }}</code></pre>
        <ElButton type="primary" size="small" link @click="handleCopy">复制代码</ElButton>
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
    border: 1px solid #e4e7ed;

    .code-content {
        flex: 1;
        margin-right: 16px;
        overflow-x: auto;

        code {
            font-size: 14px;
            line-height: 16px;
            font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
        }
    }

    .el-button {
        flex-shrink: 0;
        border: none;
    }
}
</style>
