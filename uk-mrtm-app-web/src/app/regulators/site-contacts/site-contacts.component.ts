import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  Signal,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { filter, map, switchMap, tap } from 'rxjs';

import {
  AccountContactInfoDTO,
  AccountContactInfoResponse,
  CaSiteContactsService,
  RegulatorAuthoritiesService,
  RegulatorUserAuthorityInfoDTO,
} from '@mrtm/api';

import { FeedbackBannerStore } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { BusinessErrorService, catchBadRequest, ErrorCodes } from '@netz/common/error';
import { UserFullNamePipe } from '@netz/common/pipes';
import {
  ButtonDirective,
  GovukSelectOption,
  GovukTableColumn,
  PaginationComponent,
  SelectComponent,
  TableComponent,
} from '@netz/govuk-components';

import { savePartiallyNotFoundSiteContactError } from '@regulators/errors/business-error';
import { initialState, selectFilters, SiteContactsStore } from '@regulators/site-contacts/+store';
import { SiteContactsFilterComponent } from '@regulators/site-contacts/site-contacts-filter';
import { FormUtils } from '@shared/utils';

type TableData = AccountContactInfoDTO & { user: RegulatorUserAuthorityInfoDTO; type: string };

const EMPTY_CONTACTS_RESPONSE: AccountContactInfoResponse = { contacts: [], editable: false, totalItems: 0 };

@Component({
  selector: 'mrtm-site-contacts',
  imports: [
    ReactiveFormsModule,
    TableComponent,
    SelectComponent,
    NgTemplateOutlet,
    PendingButtonDirective,
    ButtonDirective,
    PaginationComponent,
    UserFullNamePipe,
    SiteContactsFilterComponent,
  ],
  standalone: true,
  templateUrl: './site-contacts.component.html',
  providers: [UserFullNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteContactsComponent {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly siteContactsService = inject(CaSiteContactsService);
  private readonly fullNamePipe = inject(UserFullNamePipe);
  private readonly regulatorAuthoritiesService = inject(RegulatorAuthoritiesService);
  private readonly businessErrorService = inject(BusinessErrorService);
  private readonly feedbackBannerStore: FeedbackBannerStore = inject(FeedbackBannerStore);
  private readonly store = inject(SiteContactsStore);

  columns: GovukTableColumn<TableData>[] = [
    { field: 'accountName', header: 'Permit holding account', isHeader: true },
    { field: 'type', header: 'Type' },
    { field: 'user', header: 'Assigned to' },
  ];
  readonly pageSize = initialState.paging.pageSize;
  form = this.fb.group({ siteContacts: this.fb.array([]) });

  private readonly refresh = signal(0);
  private readonly filters = this.store.select(selectFilters);
  private readonly businessId = computed(() => this.filters().businessId?.data ?? null);

  protected readonly page = linkedSignal<string | null, number>({
    source: this.businessId,
    computation: (_, previous) => {
      if (previous) {
        return initialState.paging.page;
      }

      const initialPage = this.route.snapshot.queryParams?.['page'];
      return initialPage ? +initialPage : initialState.paging.page;
    },
  });

  private readonly fragment = toSignal(this.route.fragment);
  private readonly isActivated = computed(() => this.fragment() === 'site-contacts');

  private readonly regulators = toSignal(
    toObservable(computed(() => ({ activated: this.isActivated(), refresh: this.refresh() }))).pipe(
      filter(({ activated }) => activated),
      switchMap(() => this.regulatorAuthoritiesService.getCaRegulators()),
      map((state) => state.caUsers),
    ),
    { initialValue: [] as RegulatorUserAuthorityInfoDTO[] },
  );

  private readonly contactsResponse = toSignal(
    toObservable(
      computed(() => ({
        activated: this.isActivated(),
        page: this.page(),
        refresh: this.refresh(),
        businessId: this.businessId(),
      })),
    ).pipe(
      filter(({ activated }) => activated),
      switchMap(({ page, businessId }) =>
        this.siteContactsService.getCaSiteContacts(page - 1, this.pageSize, businessId ? { businessId } : {}),
      ),
    ),
    { initialValue: EMPTY_CONTACTS_RESPONSE },
  ) as Signal<AccountContactInfoResponse>;

  protected readonly count = computed(() => this.contactsResponse().totalItems);
  protected readonly isEditable = computed(() => this.contactsResponse().editable);

  protected readonly assigneeOptions = computed<GovukSelectOption<string>[]>(() =>
    [{ text: 'Unassigned', value: null }].concat(
      this.regulators()
        .filter((regulator) => regulator.authorityStatus === 'ACTIVE')
        .map((user) => ({ text: this.fullNamePipe.transform(user), value: user.userId })),
    ),
  );

  private readonly allTableData = computed<TableData[]>(() => {
    const users = this.regulators();

    return (this.contactsResponse().contacts ?? [])
      .slice()
      .sort((a, b) => a.accountName.localeCompare(b.accountName))
      .map(
        (contact): TableData => ({
          ...contact,
          user: users.find((user) => user.userId === contact.userId),
          type: 'Maritime',
        }),
      );
  });

  protected readonly tableData = toSignal(
    toObservable(this.allTableData).pipe(
      tap((contacts) =>
        this.form.setControl(
          'siteContacts',
          this.fb.array(contacts.map(({ accountId, userId }) => this.fb.group({ accountId, userId }))),
        ),
      ),
    ),
    { initialValue: [] as TableData[] },
  );

  /**
   * The pagination component reads the current page from the 'page' query param,
   * so the URL must follow the 'page' signal when a filter change resets it.
   */
  constructor() {
    effect(() => {
      const page = this.page();
      const urlPage = this.route.snapshot.queryParams?.['page'];
      const resolvedPage = urlPage ? +urlPage : initialState.paging.page;

      if (page !== resolvedPage) {
        this.router.navigate([], {
          queryParams: { page },
          queryParamsHandling: 'merge',
          preserveFragment: true,
          relativeTo: this.route,
        });
      }
    });
  }

  onRefresh(): void {
    this.refresh.update((version) => version + 1);
  }

  onSave(): void {
    const siteContacts = this.form.get('siteContacts').value;

    this.siteContactsService
      .updateCaSiteContacts(siteContacts)
      .pipe(
        catchBadRequest([ErrorCodes.AUTHORITY1003, ErrorCodes.ACCOUNT1004], () =>
          this.businessErrorService.showError(savePartiallyNotFoundSiteContactError),
        ),
      )
      .subscribe(() => {
        const updatedControlsKeys = FormUtils.findDirtyControlsKeys(this.form);

        if (updatedControlsKeys.length !== 0) {
          this.feedbackBannerStore.setSuccessMessages(
            this.createSuccessMessages(updatedControlsKeys.map((x) => (x === 'userId' ? 'user' : x))),
          );
          this.form.markAsPristine();
        } else {
          this.feedbackBannerStore.reset();
        }
      });
  }

  private createSuccessMessages(controlKeys: string[]): string[] {
    return controlKeys.map((key) => `${this.columns.find((col) => col.field === key).header} updated`);
  }
}
