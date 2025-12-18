import { request } from './request';
import type { ApiResponse } from './types';

export type UserInfo = {
    token: string;
    username: string;
    userRole: 'advertiser' | 'publisher' | 'admin';
};

export const authRegisterApi = (body: {
    username: string;
    userPassword: string;
    phone: string;
    email: string;
    role: 'advertiser' | 'publisher';
}) => {
    return request<ApiResponse<number>>('/auth/register', { method: 'POST', body });
};

export const authLoginApi = (body: { username: string; userPassword: string }) => {
    return request<ApiResponse<UserInfo>>('/auth/login', { method: 'POST', body });
};

export const authGetCurrentUserApi = () => {
    return request<ApiResponse<UserInfo>>('/users/me', { method: 'GET' });
};
