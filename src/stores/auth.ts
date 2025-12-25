import { StorageSerializers } from '@vueuse/core';
import { UserRole, authLoginApi } from '@/apis/authApis';
import type { ValueOf } from '@/utils/enum';
import { capitalize } from '@/utils/tools';

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter();

    const token = useLocalStorage<string | null>('auth_token', null);
    const userInfo = useLocalStorage<{
        username: string;
        userRole: ValueOf<typeof UserRole>;
    } | null>('user_info', null, { serializer: StorageSerializers.object });

    const login = async (body: { username: string; userPassword: string }) => {
        const { data } = await authLoginApi(body);
        if (!data.token || !data.username || !data.userRole) {
            throw new Error('Invalid login response');
        }
        token.value = data.token;
        userInfo.value = { username: data.username, userRole: data.userRole };
        router.push({ name: capitalize(data.userRole) });
    };

    const logout = () => {
        token.value = null;
        userInfo.value = null;
        router.push({ name: 'Login' });
    };

    const username = computed(() => userInfo.value?.username ?? null);
    const role = computed(() => userInfo.value?.userRole ?? null);

    return { token, userInfo, username, role, login, logout };
});
