import { I18nSelectPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';

import { MrtmAccountViewDTO, RequestDetailsDTO, RequestsService } from '@mrtm/api';

import { GovukDatePipe } from '@netz/common/pipes';
import { getYearFromRequestId } from '@netz/common/utils';
import { CheckboxComponent, CheckboxesComponent, LinkDirective, TagComponent } from '@netz/govuk-components';

import { ReportGroupType } from '@accounts/components/reports-tab/reports-tab.types';
import { OperatorAccountsStore, selectAccount } from '@accounts/store';
import { BigNumberPipe, RequestStatusTagColorPipe } from '@shared/pipes';
import { MrtmRequestStatus, MrtmRequestType, reportStatusMap, reportTypesMap } from '@shared/types';
import { FormUtils, isNil, originalOrder, taskActionTypeToTitleTransformer } from '@shared/utils';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'mrtm-reports-tab',
  imports: [
    CheckboxComponent,
    CheckboxesComponent,
    KeyValuePipe,
    ReactiveFormsModule,
    GovukDatePipe,
    RouterLink,
    LinkDirective,
    TagComponent,
    RequestStatusTagColorPipe,
    I18nSelectPipe,
    BigNumberPipe,
  ],
  standalone: true,
  templateUrl: './reports-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsTabComponent {
  private readonly fb: UntypedFormBuilder = inject(UntypedFormBuilder);
  private readonly requestsService: RequestsService = inject(RequestsService);
  private readonly store: OperatorAccountsStore = inject(OperatorAccountsStore);

  readonly reportTypesMap = reportTypesMap;
  readonly reportStatusMap = reportStatusMap;
  readonly taskActionTypeToTitleTransformer = taskActionTypeToTitleTransformer;
  readonly getYearFromRequestId = getYearFromRequestId;
  readonly originalOrder = originalOrder;
  readonly pageSize = 10000; //TODO: need to be clarify by analysis team how to paginate grouped result

  searchForm: UntypedFormGroup = this.fb.group({
    requestTypes: [[], { updateOn: 'change' }],
    requestStatuses: [[], { updateOn: 'change' }],
  });
  page$ = new BehaviorSubject<number>(1);
  accountId$ = this.store.pipe(selectAccount).pipe(
    filter((account) => !!account),
    map((account: MrtmAccountViewDTO) => account.id),
  );
  selectedTypes$: Observable<MrtmRequestType[]> = FormUtils.debounceDistinct(this.searchForm.get('requestTypes'), 0);
  selectedStatuses$: Observable<MrtmRequestStatus[]> = FormUtils.debounceDistinct(
    this.searchForm.get('requestStatuses'),
    0,
  );

  readonly reportResults = toSignal(
    combineLatest([
      this.accountId$,
      this.selectedTypes$,
      this.selectedStatuses$,
      this.page$.pipe(distinctUntilChanged()),
    ]).pipe(
      switchMap(([accountId, types, statuses, page]) =>
        this.requestsService.getRequestDetailsByResource({
          resourceType: 'ACCOUNT',
          resourceId: String(accountId),
          historyCategory: 'REPORTING',
          requestTypes: types,
          requestStatuses: statuses,
          pageNumber: page - 1,
          pageSize: this.pageSize,
        }),
      ),
    ),
  );

  readonly groupedReports: Signal<Array<ReportGroupType>> = computed(() => {
    const reports = this.reportResults()?.requestDetails ?? [];

    const reducedResult = reports.reduce((result, report) => {
      const year = getYearFromRequestId(report.id);

      return {
        ...result,
        [year]: [...(result[year] || []), report].sort(
          (a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime(),
        ),
      };
    }, {});

    return Object.entries(reducedResult)
      .map(([reportingYear, items]) => {
        const doeItem = items.find(
          (reportItem: RequestDetailsDTO) =>
            reportItem?.requestType === 'DOE' &&
            !isNil((reportItem?.requestMetadata as any)?.emissions?.surrenderEmissions),
        );
        const nonDoeItems = items.filter((item: RequestDetailsDTO) => item?.requestType !== 'DOE');

        return {
          reportingYear,
          total: doeItem
            ? new BigNumber(0).plus((doeItem?.requestMetadata as any)?.emissions?.surrenderEmissions)
            : nonDoeItems.filter(Boolean).reduce((acc: BigNumber | undefined, reportItem: RequestDetailsDTO) => {
                const surrenderEmissions = (reportItem?.requestMetadata as any)?.emissions?.surrenderEmissions;

                if (!isNil(surrenderEmissions)) {
                  return (acc ?? new BigNumber(0)).plus(surrenderEmissions);
                }

                return acc;
              }, undefined),
          items,
        };
      })
      .sort((a: any, b: any) => +(b?.reportingYear ?? 0) - +(a?.reportingYear ?? 0));
  });
}
