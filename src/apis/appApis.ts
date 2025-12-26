import { getTrackerFullPath, request } from './request';
import type { ApiResponse } from './types';

export const getBackendVersion = () => {
    return request<ApiResponse<string>>('/app/version');
};

export const getTrackerVersion = async () => {
    const response = await fetch(getTrackerFullPath('/version.txt'));
    return await response.text();
};
