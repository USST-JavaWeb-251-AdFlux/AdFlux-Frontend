<template>
    <div class="auth-root">
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
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;

    .auth-card {
        width: 360px;

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
