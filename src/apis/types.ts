export type ApiResponse<T = unknown> = {
    code: number;
    message: string;
    data: T;
};

export type Pagination<T = unknown> = {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
};

export type PaginationParams = {
    page?: number;
    pageSize?: number;
};
