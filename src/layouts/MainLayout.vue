<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const logout = () => {
    authStore.logout();
    ElMessage.success('登出成功');
};

const handleCommand = (command: string) => {
    if (command === 'logout') {
        logout();
    } else if (command === 'profile') {
        // TODO
        ElMessage.info('修改信息功能待开发');
    }
};

const menuRoutes = computed(() => {
    const mainRoute = router.options.routes.find((r) => r.name === 'Main');
    if (!mainRoute || !mainRoute.children) return [];

    const roleRoute = mainRoute.children.find((r) => r.meta?.role === authStore.role);
    if (!roleRoute) return [];

    if (roleRoute.children && roleRoute.children.length > 0) {
        return roleRoute.children
            .filter((r) => !r.meta?.hidden)
            .map((r) => ({
                ...r,
                fullPath: router.resolve({ name: r.name }).fullPath,
            }));
    }

    return [];
});

const activeMenu = computed(() => route.path);
</script>

<template>
    <ElContainer class="layout-container">
        <ElHeader class="header">
            <div class="logo">
                <img src="@/assets/logo.png" alt="Logo" class="logo-img" />
                <span class="logo-text">AdFlux</span>
            </div>

            <ElMenu
                :default-active="activeMenu"
                mode="horizontal"
                router
                class="menu"
                :ellipsis="false"
            >
                <template v-for="item in menuRoutes" :key="item.name">
                    <ElMenuItem :index="item.fullPath">
                        {{ item.meta?.title ?? item.name }}
                    </ElMenuItem>
                </template>
            </ElMenu>

            <div class="user-info">
                <ElDropdown @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{
                            {
                                admin: '管理员',
                                advertiser: '广告主',
                                publisher: '发布主',
                            }[authStore.role]
                        }}
                        - {{ authStore.username }}
                        <ElIcon class="el-icon--right">
                            <ArrowDown />
                        </ElIcon>
                    </span>
                    <template #dropdown>
                        <ElDropdownMenu>
                            <ElDropdownItem command="profile">修改信息</ElDropdownItem>
                            <ElDropdownItem command="logout">退出登录</ElDropdownItem>
                        </ElDropdownMenu>
                    </template>
                </ElDropdown>
            </div>
        </ElHeader>

        <ElMain class="main">
            <RouterView v-slot="{ Component }">
                <Transition name="fade" mode="out-in">
                    <KeepAlive>
                        <component :is="Component" />
                    </KeepAlive>
                </Transition>
            </RouterView>
        </ElMain>
    </ElContainer>
</template>

<style scoped lang="scss">
.layout-container {
    height: 100vh;

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
        border-bottom: 1px solid var(--el-menu-border-color);

        .logo {
            display: flex;
            align-items: center;
            font-size: 20px;
            font-weight: 700;
            margin-right: 24px;
            color: var(--el-color-primary);

            .logo-img {
                height: 32px;
                margin-right: 8px;
            }
        }

        .menu {
            flex: 1;
        }

        .user-info {
            display: flex;
            align-items: center;
            cursor: pointer;

            .el-dropdown {
                height: 32px;

                .el-dropdown-link {
                    display: flex;
                    align-items: center;
                    outline: none;
                }
            }
        }
    }

    .main {
        .fade-enter-active,
        .fade-leave-active {
            transition: opacity 0.3s ease;
        }

        .fade-enter-from,
        .fade-leave-to {
            opacity: 0;
        }
    }
}
</style>
