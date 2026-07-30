import { SiteVisit } from '@mrtm/api';

import { SubTaskListMap } from '@shared/types';

export const siteVisitSubtasksMap: SubTaskListMap<SiteVisit & { submit: boolean }> = {
  title: 'Site visit',
  applicationDetails: {
    title: 'Details of the application',
    caption: 'Application details',
  },
  submit: {
    title: 'Send application to regulator',
    caption: 'Send application',
  },
};
