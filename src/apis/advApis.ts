import type { ValueOf } from '@/types/utils';
import { request } from './request';
import type { ApiResponse, Pagination, PaginationParams } from './types';

export const AdType = {
    image: 0,
    video: 1,
} as const;

export const AdLayout = {
    banner: 0,
    sidebar: 1,
    card: 2,
} as const;

export const ReviewStatus = {
    pending: 0,
    approved: 1,
    rejected: 2,
} as const;

export type AdDetails = {
    adId: string;
    title: string;
    adType: ValueOf<typeof AdType>;
    mediaUrl: string;
    landingPage: string;
    categoryId: string;
    adLayout: ValueOf<typeof AdLayout>;
    weeklyBudget: number;
    reviewStatus: ValueOf<typeof ReviewStatus>;
    isActive: number;
    createTime: string;
    editTime: string;
};

export type AdMeta = Pick<
    AdDetails,
    'adLayout' | 'categoryId' | 'landingPage' | 'mediaUrl' | 'title' | 'weeklyBudget'
>;

export const advListAdsApi = (
    params?: PaginationParams & {
        isActive?: boolean;
        reviewStatus?: 'pending' | 'approved' | 'rejected';
    },
) => {
    return request<ApiResponse<Pagination<AdDetails>>>('/advertisers/ads', {
        method: 'GET',
        params,
    });
};

export const advCreateAdApi = (body: AdMeta) => {
    return request<ApiResponse<AdDetails>>('/advertisers/ads', { method: 'POST', body });
};

export const advGetAdByIdApi = (adId: string) => {
    return request<ApiResponse<AdDetails>>(`/advertisers/ads/${adId}`, { method: 'GET' });
};

export const advUpdateAdApi = (adId: string, body: AdMeta) => {
    return request<ApiResponse<AdDetails>>(`/advertisers/ads/${adId}`, { method: 'PUT', body });
};

export const advDeleteAdApi = (adId: string) => {
    return request<ApiResponse<boolean>>(`/advertisers/ads/${adId}`, { method: 'DELETE' });
};

export const advGetAdStatsApi = (
    adId: string,
    params?: { startDate?: string; endDate?: string },
) => {
    return request<
        ApiResponse<{
            adId: string;
            ctr: number;
            daily: {
                clicks: number;
                date: string;
                impressions: number;
            }[];
            totalClicks: number;
            totalImpressions: number;
        }>
    >(`/advertisers/ads/${adId}/statistics`, { method: 'GET', params });
};

export const advGetStatOverviewApi = () => {
    return request<
        ApiResponse<{
            ctr: number;
            totalClicks: number;
            totalImpressions: number;
            totalSpend: number;
        }>
    >('/advertisers/statistics/summary', { method: 'GET' });
};

export const advToggleAdStatusApi = (adId: string, body: { isActive: boolean }) => {
    return request<ApiResponse<AdDetails>>(`/advertisers/ads/${adId}/status`, {
        method: 'PUT',
        body,
    });
};

export const advAddCompanyNameApi = (body: { companyName: string }) => {
    return request<ApiResponse<{ companyName: string }>>('/advertisers/company-name', {
        method: 'POST',
        body,
    });
};

export type PaymentMethod = {
    bankName: string;
    cardNumber: string;
    paymentId: string;
};

export const advGetPaymentMethodsApi = () => {
    return request<ApiResponse<PaymentMethod[]>>('/advertisers/payment-methods', { method: 'GET' });
};

export const advAddPaymentMethodApi = (body: Omit<PaymentMethod, 'paymentId'>) => {
    return request<ApiResponse<PaymentMethod>>('/advertisers/payment-methods', {
        method: 'POST',
        body,
    });
};

export const advGetProfileApi = () => {
    return request<
        ApiResponse<{
            advertiserId: string;
            companyName: string;
            email: string;
            phone: string;
            userId: string;
        }>
    >('/advertisers/profile', { method: 'GET' });
};
