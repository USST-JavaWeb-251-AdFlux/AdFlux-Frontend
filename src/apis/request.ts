import { useAuthStore } from '@/stores/auth';
import type { ApiResponse } from './types';

const isDev = import.meta.env.DEV;

const rawApiHost = import.meta.env.VITE_API_HOST;
const apiHost = isDev ? new URL(rawApiHost).pathname : rawApiHost;

const rawTrackerHost = import.meta.env.VITE_ADS_HOST;
const trackerHost = isDev ? new URL(rawTrackerHost).pathname : rawTrackerHost;

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

    const headers = opts.headers ?? {};
    if (!headers['Content-Type'] && opts.body && !(opts.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    if (!headers['Authorization'] && authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    const init: RequestInit = {
        method: opts.method ?? 'GET',
        body:
            opts.body === undefined || opts.body instanceof FormData
                ? opts.body
                : JSON.stringify(opts.body),
        headers,
    };

    const params = new URLSearchParams();
    if (opts.params) {
        for (const [key, value] of Object.entries(opts.params)) {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        }
    }
    const query = params.size ? `?${params.toString()}` : '';
    const url = `${apiHost}${path}${query}`;
    const response = await fetch(url, init);

    const result: T = await response.json();
    if (!response.ok) {
        if (response.status === 401) {
            authStore.logout();
        }

        throw new Error(result.message || response.statusText);
    }

    return result;
}

export const getBackendFullPath = (path: string) => {
    return path ? `${apiHost}${path}` : '';
};

export const getTrackerFullPath = (path: string) => {
    return path ? `${trackerHost}${path}` : '';
};
