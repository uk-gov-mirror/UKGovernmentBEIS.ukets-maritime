import { Pipe, PipeTransform } from '@angular/core';

import { TagColor } from '@netz/govuk-components';

import { MrtmRequestStatus } from '@shared/types';

@Pipe({
  name: 'requestStatusTagColor',
  standalone: true,
})
export class RequestStatusTagColorPipe implements PipeTransform {
  transform(status: MrtmRequestStatus): TagColor {
    switch (status) {
      case 'CANCELLED':
      case 'CLOSED':
      case 'EXEMPT':
        return 'grey';

      case 'COMPLETED':
      case 'APPROVED':
      case 'ACCEPTED':
        return 'green';

      case 'IN_PROGRESS':
        return 'teal';

      case 'WITHDRAWN':
        return 'orange';

      case 'REJECTED':
        return 'red';

      case 'MIGRATED':
        return 'yellow';

      default:
        return null;
    }
  }
}
