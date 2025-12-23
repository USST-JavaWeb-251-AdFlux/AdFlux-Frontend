import type { ValueOf } from '@/utils/enum';
import { AdType } from './advApis';
import { request } from './request';
import type { ApiResponse } from './types';

export const uploadFileApi = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return request<
        ApiResponse<{
            adType: ValueOf<typeof AdType>;
            mediaUrl: string;
        }>
    >('/file/upload', {
        method: 'POST',
        body: formData,
    });
};
