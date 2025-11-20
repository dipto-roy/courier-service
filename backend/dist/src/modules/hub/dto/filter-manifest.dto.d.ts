import { ManifestStatus } from '../../../entities/manifest.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class FilterManifestDto extends PaginationDto {
    status?: ManifestStatus;
    originHub?: string;
    destinationHub?: string;
    riderId?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
}
