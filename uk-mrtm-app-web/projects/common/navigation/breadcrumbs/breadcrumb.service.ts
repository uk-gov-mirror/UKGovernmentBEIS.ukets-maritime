import { inject, Service } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { BREADCRUMB_ITEMS } from './breadcrumbs.factory';
import { BreadcrumbItem } from './breadcrumbs.interface';

@Service()
export class BreadcrumbService {
  readonly breadcrumbItem$ = inject<BehaviorSubject<BreadcrumbItem[]>>(BREADCRUMB_ITEMS);

  show(items: BreadcrumbItem[]): void {
    this.breadcrumbItem$.next(items);
  }

  showDashboardBreadcrumb(): void {
    this.breadcrumbItem$.next([
      {
        text: 'Dashboard',
        link: ['dashboard'],
      },
    ]);
  }

  clear(): void {
    this.breadcrumbItem$.next(null);
  }
}
