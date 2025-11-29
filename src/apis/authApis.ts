import { request } from './request';

export const authRegisterApi = (body: {
    username: string;
    userPassword: string;
    phone: string;
    email: string;
    role: 'advertiser' | 'publisher';
}) => {
    return request('/auth/register', { method: 'POST', body });
};

export const authLoginApi = (body: { username: string; userPassword: string }) => {
    return request<{
        code: number;
        data: {
            token: string;
            username: string;
            userRole: 'advertiser' | 'publisher' | 'admin';
        };
        message: string;
    }>('/auth/login', { method: 'POST', body });
};
