import { type ValueOf } from '@/utils/enum';
import type { AdDetails, ReviewStatus } from './advApis';
import type { UserRole } from './authApis';
import { request } from './request';
import type { ApiResponse, PaginationParams } from './types';

export const listAllAdsApi = (
    params?: PaginationParams & { status?: ValueOf<typeof ReviewStatus> },
) => {
    return request<ApiResponse<AdDetails[]>>('/admin/ads', { method: 'GET', params });
};

export const reviewAdApi = (
    adId: string,
    body: { status: ValueOf<typeof ReviewStatus>; reason: string },
) => {
    return request<ApiResponse<AdDetails>>(`/admin/ads/${adId}/review`, { method: 'PUT', body });
};

export const createCategoryApi = (body: { categoryName: string }) => {
    return request<ApiResponse<{ categoryId: string; categoryName: string }>>('/admin/categories', {
        method: 'POST',
        body,
    });
};

export type UserDetails = {
    userId: string;
    username: string;
    userRole: ValueOf<typeof UserRole>;
    email: string;
    phone: string;
    createTime: string;
};

export const listUsersApi = (params?: { role?: ValueOf<typeof UserRole> }) => {
    return request<ApiResponse<UserDetails[]>>('/admin/users', { method: 'GET', params });
};

export const createAdminApi = (body: {
    username: string;
    password: string;
    email: string;
    phone: string;
}) => {
    return request<ApiResponse<UserDetails>>('/admin/users', { method: 'POST', body });
};
