import { type ValueOf, createEnum } from '@/utils/enum';
import { request } from './request';
import type { ApiResponse } from './types';

export const WebsiteVerification = createEnum({
    unverified: { value: 0, label: '未验证', type: 'warning' },
    verified: { value: 1, label: '已验证', type: 'success' },
} as const);

export type WebsiteDetails = {
    createTime: string;
    domain: string;
    isVerified: ValueOf<typeof WebsiteVerification>;
    verificationToken: string;
    verifyTime: string;
    websiteId: string;
    websiteName: string;
};

export type WebsiteMeta = Pick<WebsiteDetails, 'domain' | 'websiteName'>;

export const pubCreateSiteApi = (body: WebsiteMeta) => {
    return request<ApiResponse<WebsiteDetails>>('/publishers/sites', {
        method: 'POST',
        body,
    });
};

export const pubListSitesApi = () => {
    return request<ApiResponse<WebsiteDetails[]>>('/publishers/sites', {
        method: 'GET',
    });
};

export const getSiteDetailsApi = (websiteId: string) => {
    return request<ApiResponse<WebsiteDetails>>(`/publishers/sites/${websiteId}`, {
        method: 'GET',
    });
};

export const pubVerifySiteApi = (websiteId: string) => {
    return request<ApiResponse<boolean>>(`/publishers/sites/${websiteId}/verification`, {
        method: 'POST',
    });
};

export const pubGetStatisticsApi = (params?: { startDate?: string; endDate?: string }) => {
    return request<
        ApiResponse<{
            estimatedRevenue: number;
            totalClicks: number;
            totalImpressions: number;
        }>
    >(`/publishers/statistics`, {
        method: 'GET',
        params,
    });
};
