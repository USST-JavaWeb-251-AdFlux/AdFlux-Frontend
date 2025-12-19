import { useAuthStore } from '@/stores/auth';
import type { ApiResponse } from './types';

const rawHost = import.meta.env.VITE_API_HOST;
const isDev = import.meta.env.DEV;
const apiHost = isDev ? new URL(rawHost).pathname : rawHost;

type RequestOptions = Omit<RequestInit, 'headers' | 'body'> & {
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | undefined | null>;
    body?: object;
};

export async function request<T extends ApiResponse>(
    path: string,
    opts: RequestOptions = {},
): Promise<T> {
    const authStore = useAuthStore();

    const init: RequestInit = {
        method: opts.method ?? 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
            ...(opts.headers ?? {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : null,
    };

    const params = new URLSearchParams();
    if (opts.params) {
        Object.entries(opts.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
    }
    const queryString = params.size ? `?${params.toString()}` : '';
    const url = `${apiHost}${path}${queryString}`;
    const response = await fetch(url, init);

    const result: T = await response.json();
    if (!response.ok) {
        if (response.status === 401) {
            authStore.logout();
            throw new Error('登录已失效');
        }

        throw new Error(result.message || response.statusText);
    }

    return result;
}
