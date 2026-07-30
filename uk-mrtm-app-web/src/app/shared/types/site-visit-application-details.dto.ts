import { SiteVisitApplicationDetails } from '@mrtm/api';

import { AttachedFile } from '@shared/types/attached-file.interface';

export interface SiteVisitApplicationDetailsDto extends Omit<SiteVisitApplicationDetails, 'files'> {
  reportingYear: number;
  files: AttachedFile[];
}
