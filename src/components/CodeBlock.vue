<script setup lang="ts">
import { ElMessage } from 'element-plus';

const { code } = defineProps<{
    code: string;
}>();

const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(code);
        ElMessage.success('已复制');
    } catch {
        ElMessage.error('复制失败');
    }
};
</script>

<template>
    <div class="code-block">
        <code class="code-content">{{ code }}</code>
        <ElButton type="primary" link @click="handleCopy">复制代码</ElButton>
    </div>
</template>

<style scoped lang="scss">
.code-block {
    background-color: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: monospace;
    word-break: break-all;

    .code-content {
        margin-right: 10px;
    }
}
</style>
