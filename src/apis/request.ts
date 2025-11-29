export type RequestOptions = Omit<RequestInit, 'headers' | 'body'> & {
    headers?: Record<string, string>;
    body?: object;
};

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const init: RequestInit = {
        method: opts.method ?? 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(opts.headers ?? {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : null,
    };

    const res = await fetch(`${import.meta.env.VITE_API_HOST}${path}`, init);

    const text = await res.text();
    if (!res.ok) {
        if (res.status === 401) {
            // TODO
        }

        try {
            const json = JSON.parse(text);
            throw new Error(json?.message ?? text ?? res.statusText);
        } catch {
            throw new Error(text ?? res.statusText);
        }
    }

    return JSON.parse(text);
}
