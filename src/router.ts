import { type RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

declare module 'vue-router' {
    interface RouteMeta {
        userRole?: 'admin' | 'advertiser' | 'publisher';
    }
}

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: { name: 'Login' },
    },
    {
        path: '/user',
        name: 'User',
        children: [
            {
                path: 'login',
                name: 'Login',
                component: () => import('@/views/User/UserLogin.vue'),
            },
            {
                path: 'register',
                name: 'Register',
                component: () => import('@/views/User/UserRegister.vue'),
            },
        ],
    },
    {
        path: '/admin',
        name: 'Admin',
        meta: { userRole: 'admin' },
        children: [],
    },
    {
        path: '/advertiser',
        name: 'Advertiser',
        meta: { userRole: 'advertiser' },
        children: [],
    },
    {
        path: '/publisher',
        name: 'Publisher',
        meta: { userRole: 'publisher' },
        children: [],
    },
];

const router = createRouter({ history: createWebHistory(), routes });

export default router;
