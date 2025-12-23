import { type ValueOf, createEnum } from '@/utils/enum';
import { request } from './request';
import type { ApiResponse } from './types';

export const UserRole = createEnum({
    admin: { value: 'admin', label: '管理员', color: '#E91E63' },
    advertiser: { value: 'advertiser', label: '广告主', color: '#3F51B5' },
    publisher: { value: 'publisher', label: '发布主', color: '#009688' },
} as const);

export type UserInfo = {
    token: string;
    username: string;
    userRole: ValueOf<typeof UserRole>;
};

export const authRegisterApi = (body: {
    username: string;
    userPassword: string;
    phone: string;
    email: string;
    role: Exclude<ValueOf<typeof UserRole>, 'admin'>;
}) => {
    return request<ApiResponse<number>>('/auth/register', { method: 'POST', body });
};

export const authLoginApi = (body: { username: string; userPassword: string }) => {
    return request<ApiResponse<UserInfo>>('/auth/login', { method: 'POST', body });
};

export const authGetCurrentUserApi = () => {
    return request<ApiResponse<UserInfo>>('/users/me', { method: 'GET' });
};
