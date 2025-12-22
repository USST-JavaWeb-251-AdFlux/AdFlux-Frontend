<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';

const bgCanvas = useTemplateRef('bgCanvas');
const { width, height } = useWindowSize();
let animationId: number;

// 主题色
const colors = ['#1e9fbe', '#39b576', '#f2a33f'] as const;

class Orb {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;

    constructor(w: number, h: number) {
        // 随机半径：屏幕较短边的 30% ~ 60%，保证足够大覆盖屏幕
        const minDim = Math.min(w, h);
        this.radius = minDim * 0.3 + Math.random() * (minDim * 0.3);

        // 随机位置
        this.x = Math.random() * w;
        this.y = Math.random() * h;

        // 随机速度
        const speed = 2;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;

        this.color = colors[Math.floor(Math.random() * colors.length)] ?? colors[0];
    }

    update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;

        // 碰到边界反弹，允许稍微出界以保持自然
        const buffer = this.radius * 0.5;
        if (this.x < -buffer || this.x > w + buffer) this.vx *= -1;
        if (this.y < -buffer || this.y > h + buffer) this.vy *= -1;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

const orbs: Orb[] = [];
const ORB_COUNT = 8; // 足够多的球体以覆盖屏幕

const initCanvas = () => {
    const canvas = bgCanvas.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置初始尺寸
    canvas.width = width.value;
    canvas.height = height.value;

    // 初始化球体
    orbs.length = 0;
    for (let i = 0; i < ORB_COUNT; i++) {
        orbs.push(new Orb(width.value, height.value));
    }

    const animate = () => {
        const w = canvas.width;
        const h = canvas.height;

        // 清空画布
        ctx.clearRect(0, 0, w, h);

        // 绘制底色，防止留白
        ctx.fillStyle = '#1e9fbe';
        ctx.fillRect(0, 0, w, h);

        // 更新并绘制所有球体
        orbs.forEach((orb) => {
            orb.update(w, h);
            orb.draw(ctx);
        });

        animationId = requestAnimationFrame(animate);
    };

    animate();

    // 监听窗口大小变化
    watch([width, height], () => {
        canvas.width = width.value;
        canvas.height = height.value;
    });
};

onMounted(() => {
    initCanvas();
});

onUnmounted(() => {
    cancelAnimationFrame(animationId);
});
</script>

<template>
    <div class="auth-root">
        <canvas ref="bgCanvas" class="bg-canvas"></canvas>
        <div class="logo-container">
            <img src="@/assets/logo.png" alt="Logo" />
            <span>AdFlux</span>
        </div>
        <ElCard class="auth-card">
            <RouterView v-slot="{ Component }">
                <Transition name="fade" mode="out-in">
                    <component :is="Component" />
                </Transition>
            </RouterView>
        </ElCard>
    </div>
</template>

<style lang="scss" scoped>
.auth-root {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: #1e9fbe;

    .bg-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        filter: blur(100px); /* 使用 CSS 模糊滤镜将球体融合成渐变 */
        transform: scale(1.2); /* 放大一点以消除边缘模糊带来的白边 */
    }

    .logo-container {
        position: absolute;
        top: 24px;
        left: 24px;
        z-index: 10;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        user-select: none;

        img {
            width: 32px;
            height: 32px;
            object-fit: contain;
        }

        span {
            font-size: 20px;
            font-weight: 600;
            line-height: 32px;
            color: var(--el-text-color-primary);
            letter-spacing: 0.5px;
        }
    }

    .auth-card {
        position: relative;
        z-index: 1;
        width: 360px;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border-radius: 16px;

        .fade-enter-active,
        .fade-leave-active {
            transition: opacity 0.28s ease;
        }

        .fade-enter-from,
        .fade-leave-to {
            opacity: 0;
        }

        .fade-enter-to,
        .fade-leave-from {
            opacity: 1;
        }

        ::v-deep(h2) {
            text-align: center;
            margin-bottom: 24px;
        }

        ::v-deep(.el-button) {
            width: 100%;

            + .el-button {
                margin: 8px 0 0;
            }
        }
    }
}
</style>
