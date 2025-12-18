import { useAuthStore } from '@/stores/auth';

export type RequestOptions = Omit<RequestInit, 'headers' | 'body'> & {
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | undefined | null>;
    body?: object;
};

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
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
    if (init.method === 'GET' && opts.params) {
        Object.entries(opts.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
    }
    const queryString = params.size ? `?${params.toString()}` : '';
    const url = `${import.meta.env.VITE_API_HOST}${path}${queryString}`;
    const res = await fetch(url, init);

    const text = await res.text();
    if (!res.ok) {
        if (res.status === 401) {
            authStore.logout();
            throw new Error('登录已失效');
        }

        let json;
        try {
            json = JSON.parse(text);
        } catch {
            throw new Error(text ?? res.statusText);
        }
        throw new Error(json?.message ?? text ?? res.statusText);
    }

    return JSON.parse(text);
}
