<script setup lang="ts">
import { getDebugWebSocket } from '@/apis/adminApis';
import CodeBlock from '@/components/CodeBlock.vue';
import { formatDateTime } from '@/utils/tools';

interface AdDebugLog {
    id: number;
    time: string;
    scoringProcess: {
        avgClickRate: number;
        browseHistorySummary: Record<string, number>;
        totalDisplays: number;
        totalClicks: number;
        details: {
            categoryClickRate: number;
            finalNormalizedWeight: number;
            adjustmentRate: number;
            categoryId: number | string;
            baseWeightByContent: number;
        }[];
    };
    selectionLogic: {
        randomSeed: number;
        logicTrace: {
            isHit: boolean;
            weight: number;
            range: string;
            categoryId: number | string;
        }[];
        finalSelectedId: number | string;
    };
    costTime: number;
    budgetFilterDetails: {
        isPassed: boolean;
        adId: number | string;
        weeklyBudget: number;
        currentSpent: number;
    }[];
    finalSelect: {
        adId: number | string;
        adTitle: string;
        categoryId: number | string;
    };
}

const logs = reactive<AdDebugLog[]>([]);
let logId = 0;
const selectedLog = ref<AdDebugLog | null>(null);
const isConnected = ref(false);
let ws: WebSocket | null = null;
let heartbeatTimer: number | null = null;

const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimer = window.setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
        }
    }, 10000);
};

const stopHeartbeat = () => {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
};

const connect = () => {
    ws = getDebugWebSocket();

    ws.onopen = () => {
        isConnected.value = true;
        ElMessage.success('已连接到调试服务器');
        startHeartbeat();
    };

    ws.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
            const data = JSON.parse(event.data);
            const log: AdDebugLog = {
                id: logId++,
                time: formatDateTime(new Date()),
                ...data,
            };
            logs.unshift(log);
            if (!selectedLog.value) {
                selectedLog.value = log;
            }
            if (logs.length > 100) {
                logs.pop();
            }
        } catch (e) {
            console.error('解析消息失败', e);
        }
    };

    ws.onclose = () => {
        isConnected.value = false;
        ElMessage.warning('调试服务器连接已断开');
        stopHeartbeat();
    };

    ws.onerror = (error) => {
        console.error('WebSocket 错误', error);
        ElMessage.error('WebSocket 连接错误');
        stopHeartbeat();
    };
};

const disconnect = () => {
    stopHeartbeat();
    ws?.close();
};

const toggleConnection = () => {
    if (isConnected.value) {
        disconnect();
    } else {
        connect();
    }
};

const clearLogs = () => {
    logs.length = 0;
    selectedLog.value = null;
};

onMounted(connect);
onUnmounted(disconnect);
</script>

<template>
    <div class="admin-debug">
        <div class="toolbar">
            <ElSpace>
                <ElButton :type="isConnected ? 'danger' : 'success'" @click="toggleConnection">
                    {{ isConnected ? '断开连接' : '连接调试' }}
                </ElButton>
                <ElButton @click="clearLogs">清空日志</ElButton>
                <ElTag disable-transitions :type="isConnected ? 'success' : 'info'">
                    {{ isConnected ? '已连接' : '未连接' }}
                </ElTag>
            </ElSpace>
        </div>

        <div class="content">
            <div class="log-list">
                <ElScrollbar>
                    <div
                        v-for="log in logs"
                        :key="log.id"
                        class="log-item"
                        :class="{ active: selectedLog?.id === log.id }"
                        @click="selectedLog = log"
                    >
                        <div class="log-time">{{ log.time }}</div>
                        <div class="log-title">{{ log.finalSelect.adTitle }}</div>
                        <div class="log-meta">
                            RT: {{ log.costTime }}ms | Cat: {{ log.finalSelect.categoryId }}
                        </div>
                    </div>
                    <ElEmpty v-if="logs.length === 0" description="暂无调试日志" />
                </ElScrollbar>
            </div>

            <div class="log-detail" v-if="selectedLog">
                <ElScrollbar>
                    <div class="detail-container">
                        <ElCard header="最终选择" class="detail-card">
                            <ElDescriptions :column="2" border>
                                <ElDescriptionsItem label="广告标题">
                                    {{ selectedLog.finalSelect.adTitle }}
                                </ElDescriptionsItem>
                                <ElDescriptionsItem label="广告 ID">
                                    {{ selectedLog.finalSelect.adId }}
                                </ElDescriptionsItem>
                                <ElDescriptionsItem label="分类 ID">
                                    {{ selectedLog.finalSelect.categoryId }}
                                </ElDescriptionsItem>
                                <ElDescriptionsItem label="响应耗时">
                                    <ElTag disable-transitions type="warning"
                                        >{{ selectedLog.costTime }} ms</ElTag
                                    >
                                </ElDescriptionsItem>
                            </ElDescriptions>
                        </ElCard>

                        <ElCard header="评分过程 (Scoring Process)" class="detail-card">
                            <ElDescriptions :column="2" border class="mb-4">
                                <ElDescriptionsItem label="平均点击率">
                                    {{
                                        (selectedLog.scoringProcess.avgClickRate * 100).toFixed(2)
                                    }}%
                                </ElDescriptionsItem>
                                <ElDescriptionsItem label="总推荐数">
                                    {{ selectedLog.scoringProcess.totalDisplays }}
                                </ElDescriptionsItem>
                                <ElDescriptionsItem label="总点击数">
                                    {{ selectedLog.scoringProcess.totalClicks }}
                                </ElDescriptionsItem>
                            </ElDescriptions>

                            <h4 class="section-title">浏览历史摘要</h4>
                            <ElTable
                                :data="
                                    Object.entries(
                                        selectedLog.scoringProcess.browseHistorySummary,
                                    ).map(([id, time]) => ({ id, time }))
                                "
                                size="small"
                                border
                            >
                                <ElTableColumn prop="id" label="分类 ID" />
                                <ElTableColumn prop="time" label="停留时长 (s)" />
                            </ElTable>

                            <h4 class="section-title">分类权重详情</h4>
                            <ElTable :data="selectedLog.scoringProcess.details" size="small" border>
                                <ElTableColumn prop="categoryId" label="分类 ID" />
                                <ElTableColumn label="分类点击率">
                                    <template #default="{ row }">
                                        {{ (row.categoryClickRate * 100).toFixed(2) }}%
                                    </template>
                                </ElTableColumn>
                                <ElTableColumn prop="baseWeightByContent" label="基础权重" />
                                <ElTableColumn prop="adjustmentRate" label="调节率" />
                                <ElTableColumn prop="finalNormalizedWeight" label="归一化权重" />
                            </ElTable>
                        </ElCard>

                        <ElCard header="选择逻辑 (Selection Logic)" class="detail-card">
                            <div class="mb-2">
                                随机种子: {{ selectedLog.selectionLogic.randomSeed }}
                            </div>
                            <ElTable
                                :data="selectedLog.selectionLogic.logicTrace"
                                size="small"
                                border
                            >
                                <ElTableColumn prop="categoryId" label="分类 ID" />
                                <ElTableColumn prop="weight" label="权重" />
                                <ElTableColumn prop="range" label="范围" />
                                <ElTableColumn label="是否命中">
                                    <template #default="{ row }">
                                        <ElTag
                                            disable-transitions
                                            :type="row.isHit ? 'success' : 'info'"
                                        >
                                            {{ row.isHit ? '命中' : '未命中' }}
                                        </ElTag>
                                    </template>
                                </ElTableColumn>
                            </ElTable>
                            <div class="mt-2">
                                最终选择分类 ID:
                                <b>{{ selectedLog.selectionLogic.finalSelectedId }}</b>
                            </div>
                        </ElCard>

                        <ElCard header="预算过滤 (Budget Filter)" class="detail-card">
                            <ElTable :data="selectedLog.budgetFilterDetails" size="small" border>
                                <ElTableColumn prop="adId" label="广告 ID" />
                                <ElTableColumn prop="weeklyBudget" label="周预算" />
                                <ElTableColumn prop="currentSpent" label="当前消耗" />
                                <ElTableColumn label="状态">
                                    <template #default="{ row }">
                                        <ElTag
                                            disable-transitions
                                            :type="row.isPassed ? 'success' : 'danger'"
                                        >
                                            {{ row.isPassed ? '通过' : '预算不足' }}
                                        </ElTag>
                                    </template>
                                </ElTableColumn>
                            </ElTable>
                        </ElCard>

                        <ElCard header="原始数据" class="detail-card">
                            <CodeBlock :code="JSON.stringify(selectedLog, null, 4)" lang="json" />
                        </ElCard>
                    </div>
                </ElScrollbar>
            </div>
            <div class="log-detail-empty" v-else>
                <ElEmpty description="请从左侧选择一条日志查看详情" />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.admin-debug {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .toolbar {
        background: #fff;
        border-radius: 8px;
    }

    .content {
        flex: 1;
        display: flex;
        gap: 16px;
        overflow: hidden;

        .log-list {
            width: 300px;
            background: #fff;
            border-radius: 8px;
            overflow-y: auto;
            border: 1px solid #ebeef5;

            .log-item {
                padding: 12px;
                border-bottom: 1px solid #ebeef5;
                cursor: pointer;
                transition: all 0.3s;

                &:hover {
                    background-color: #f5f7fa;
                }

                &.active {
                    background-color: #ecf5ff;
                    border-left: 4px solid #409eff;
                }

                .log-time {
                    font-size: 12px;
                    color: #909399;
                }

                .log-title {
                    font-weight: bold;
                    margin: 4px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .log-meta {
                    font-size: 12px;
                    color: #606266;
                }
            }
        }

        .log-detail {
            flex: 1;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #ebeef5;

            .detail-container {
                padding: 20px;

                .detail-card {
                    margin-bottom: 20px;

                    &:last-child {
                        margin-bottom: 0;
                    }
                }

                .section-title {
                    margin: 16px 0 8px;
                    font-size: 14px;
                    color: #303133;
                    border-left: 4px solid #409eff;
                    padding-left: 8px;
                }
            }
        }

        .log-detail-empty {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
            border-radius: 8px;
        }
    }

    .mb-4 {
        margin-bottom: 16px;
    }

    .mb-2 {
        margin-bottom: 8px;
    }

    .mt-2 {
        margin-top: 8px;
    }

    .code-block {
        margin: 0;
    }
}
</style>
