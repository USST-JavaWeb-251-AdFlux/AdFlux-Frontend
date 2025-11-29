import { type RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { capitalize } from '@/utils/tools';

declare module 'vue-router' {
    interface RouteMeta {
        role?: 'admin' | 'advertiser' | 'publisher' | null;
    }
}

const routes: RouteRecordRaw[] = [
    {
        path: '/auth',
        name: 'Auth',
        meta: { role: null },
        component: () => import('@/layouts/AuthLayout.vue'),
        children: [
            {
                path: 'login',
                name: 'Login',
                component: () => import('@/views/Auth/AuthLogin.vue'),
            },
            {
                path: 'register',
                name: 'Register',
                component: () => import('@/views/Auth/AuthRegister.vue'),
            },
            {
                path: 'register/:role',
                name: 'RegisterRole',
                component: () => import('@/views/Auth/AuthRegisterRole.vue'),
                props: true,
            },
        ],
    },
    {
        path: '/',
        name: 'Main',
        redirect: { name: 'Login' },
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: '/admin',
                name: 'Admin',
                meta: { role: 'admin' },
                component: () => import('@/views/Admin/AdminHome.vue'),
            },
            {
                path: '/advertiser',
                name: 'Advertiser',
                meta: { role: 'advertiser' },
                component: () => import('@/views/Advertiser/AdvertiserHome.vue'),
            },
            {
                path: '/publisher',
                name: 'Publisher',
                meta: { role: 'publisher' },
                component: () => import('@/views/Publisher/PublisherHome.vue'),
            },
        ],
    },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
    const authStore = useAuthStore();
    if (to.meta.role !== null && authStore.role !== to.meta.role) {
        return { name: 'Login' };
    } else if (to.meta.role === null && authStore.role) {
        return { name: capitalize(authStore.role) };
    }
    return true;
});

export default router;
