import { type ValueOf, createEnum } from '@/utils/enum';
import { request } from './request';
import type { ApiResponse, Pagination, PaginationParams } from './types';

export const AdType = createEnum({
    image: { value: 0, label: '图片' },
    video: { value: 1, label: '视频' },
} as const);

export const AdLayout = createEnum({
    video: { value: 0, label: '视频' },
    banner: { value: 1, label: '横幅' },
    sidebar: { value: 2, label: '侧栏' },
} as const);

export const AdActive = createEnum({
    inactive: { value: 0, label: '禁用', type: 'info' },
    active: { value: 1, label: '启用', type: 'success' },
} as const);

export const ReviewStatus = createEnum({
    pending: { value: 0, label: '待审核', type: 'warning' },
    approved: { value: 1, label: '已通过', type: 'success' },
    rejected: { value: 2, label: '已拒绝', type: 'danger' },
} as const);

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
    rejectReason: string | null;
    isActive: ValueOf<typeof AdActive>;
    createTime: string;
    editTime: string;
};

export type AdMeta = Pick<
    AdDetails,
    'adLayout' | 'adType' | 'categoryId' | 'landingPage' | 'mediaUrl' | 'title' | 'weeklyBudget'
>;

export const advListAdsApi = (
    params?: PaginationParams & {
        isActive?: ValueOf<typeof AdActive>;
        reviewStatus?: ValueOf<typeof ReviewStatus>;
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

export type AdStats = {
    ctr: number;
    totalClicks: number;
    totalImpressions: number;
    daily: { clicks: number; date: string; impressions: number }[];
};

export const advGetAdStatsApi = (
    adId: string,
    params?: { startDate?: string; endDate?: string },
) => {
    return request<ApiResponse<{ adId: string } & AdStats>>(`/advertisers/ads/${adId}/statistics`, {
        method: 'GET',
        params,
    });
};

export const advGetStatOverviewApi = (params?: { startDate?: string; endDate?: string }) => {
    return request<ApiResponse<AdStats>>('/advertisers/statistics/summary', {
        method: 'GET',
        params,
    });
};

export const advToggleAdStatusApi = (
    adId: string,
    body: { isActive: ValueOf<typeof AdActive> },
) => {
    return request<ApiResponse<AdDetails>>(`/advertisers/ads/${adId}/status`, {
        method: 'PUT',
        body,
    });
};

export const advAddCompanyNameApi = (body: { companyName: string }) => {
    return request<ApiResponse<{ companyName: string }>>('/advertisers/company-name', {
        method: 'PUT',
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
