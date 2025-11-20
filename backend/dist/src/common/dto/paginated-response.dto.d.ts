export declare class PaginationMetaDto {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class PaginatedResponseDto<T> {
    data: T[];
    meta: PaginationMetaDto;
    constructor(data: T[], page: number, limit: number, totalItems: number);
}
