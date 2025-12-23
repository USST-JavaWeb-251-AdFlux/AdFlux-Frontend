import { request } from './request';
import type { ApiResponse } from './types';

export type AdCategory = {
    categoryId: string;
    categoryName: string;
    createTime: string;
};

export const listCategories = () => {
    return request<ApiResponse<AdCategory[]>>('/common/categories', { method: 'GET' });
};
