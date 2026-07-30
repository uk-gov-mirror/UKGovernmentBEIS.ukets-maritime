import { FormControl } from '@angular/forms';

import { SiteVisitRequestCreateActionPayload } from '@mrtm/api';

export type SiteVisitFormGroupModel = Record<keyof SiteVisitRequestCreateActionPayload, FormControl>;
