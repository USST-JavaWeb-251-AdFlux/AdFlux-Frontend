import { defineStore } from 'pinia';
import { authLoginApi } from '@/apis/authApis';

export const useAuthStore = defineStore('auth', () => {
    const login = async (body: { username: string; userPassword: string }) => {
        await authLoginApi(body);
    };

    return { login };
});
