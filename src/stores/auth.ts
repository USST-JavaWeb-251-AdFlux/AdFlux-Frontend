import { capitalize } from 'vue';
import { defineStore } from 'pinia';
import { StorageSerializers, useLocalStorage } from '@vueuse/core';
import { authLoginApi } from '@/apis/authApis';

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter();

    const token = useLocalStorage<string>('auth_token', null);
    const userInfo = useLocalStorage<{
        username: string;
        userRole: 'advertiser' | 'publisher' | 'admin';
    }>('user_info', null, { serializer: StorageSerializers.object });

    const login = async (body: { username: string; userPassword: string }) => {
        const { data } = await authLoginApi(body);
        token.value = data.token;
        userInfo.value = { username: data.username, userRole: data.userRole };
        router.push({ name: capitalize(data.userRole) });
    };

    const logout = () => {
        token.value = '';
        userInfo.value = null;
        router.push({ name: 'Login' });
    };

    const username = computed(() => userInfo.value?.username ?? null);
    const role = computed(() => userInfo.value?.userRole ?? null);

    return { token, userInfo, username, role, login, logout };
});
