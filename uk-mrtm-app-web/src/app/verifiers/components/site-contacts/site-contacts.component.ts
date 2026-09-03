import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  Observable,
  ReplaySubject,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import {
  AccountContactVbInfoDTO,
  UserAuthorityInfoDTO,
  VBSiteContactsService,
  VerifierAuthoritiesService,
} from '@mrtm/api';

import { FeedbackBannerStore } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { BusinessErrorService, catchBadRequest, ErrorCodes } from '@netz/common/error';
import { UserFullNamePipe } from '@netz/common/pipes';
import { DestroySubject } from '@netz/common/services';
import {
  ButtonDirective,
  GovukSelectOption,
  GovukTableColumn,
  PaginationComponent,
  SelectComponent,
  TableComponent,
} from '@netz/govuk-components';

import { SITE_CONTACTS_LIST_COLUMNS } from '@verifiers/components/site-contacts/site-contacts.constants';
import { savePartiallyNotFoundSiteContactError } from '@verifiers/errors/business-error';

type TableData = AccountContactVbInfoDTO & { user: UserAuthorityInfoDTO };

@Component({
  selector: 'mrtm-site-contacts',
  imports: [
    ReactiveFormsModule,
    TableComponent,
    SelectComponent,
    PendingButtonDirective,
    ButtonDirective,
    PaginationComponent,
    AsyncPipe,
    UserFullNamePipe,
  ],
  standalone: true,
  templateUrl: './site-contacts.component.html',
  providers: [UserFullNamePipe, DestroySubject],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteContactsComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly siteContactsService = inject(VBSiteContactsService);
  private readonly fullNamePipe = inject(UserFullNamePipe);
  private readonly verifiersAuthoritiesService = inject(VerifierAuthoritiesService);
  private readonly businessErrorService = inject(BusinessErrorService);
  private readonly destroy$ = inject(DestroySubject);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  page$ = new ReplaySubject<number>(1);
  count$: Observable<number>;
  columns: GovukTableColumn<TableData>[] = SITE_CONTACTS_LIST_COLUMNS;
  tableData$: Observable<TableData[]>;
  isEditable$: Observable<boolean>;
  readonly pageSize = 50;
  assigneeOptions$: Observable<GovukSelectOption<string>[]>;
  refresh$ = new Subject<void>();
  form = this.fb.group({ siteContacts: this.fb.array([]) });
  private modifiedAccounts: string[] = [];

  ngOnInit(): void {
    const activatedTab$ = this.route.fragment.pipe(filter((fragment) => fragment === 'site-contacts'));

    const verifiers$ = merge(activatedTab$, this.refresh$).pipe(
      switchMap(() => this.verifiersAuthoritiesService.getVerifierAuthorities()),
      map((state) => state.authorities),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const contacts$ = combineLatest([
      merge(this.refresh$.pipe(switchMap(() => this.page$)), this.page$.pipe(distinctUntilChanged())),
      activatedTab$,
    ]).pipe(
      takeUntil(this.destroy$),
      switchMap(([page]) => this.siteContactsService.getVbSiteContacts(page - 1, this.pageSize)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.count$ = contacts$.pipe(map((state) => state.totalItems));

    this.assigneeOptions$ = verifiers$.pipe(
      map((verifiers: UserAuthorityInfoDTO[]) => verifiers.filter((reg) => reg.authorityStatus === 'ACTIVE')),
      map((users) =>
        [{ text: 'Unassigned', value: null }].concat(
          users.map((user) => ({ text: this.fullNamePipe.transform(user), value: user.userId })),
        ),
      ),
    );
    this.isEditable$ = contacts$.pipe(map((state) => state.editable));
    this.tableData$ = combineLatest([
      contacts$.pipe(
        map((response) => response.contacts.slice().sort((a, b) => a.accountName.localeCompare(b.accountName))),
      ),
      verifiers$,
    ]).pipe(
      map(([contacts, users]) =>
        contacts.map((contact): TableData => ({
          ...contact,
          user: users.find((user) => user.userId === contact.userId),
        })),
      ),
      tap((contacts) =>
        this.form.setControl(
          'siteContacts',
          this.fb.array(
            contacts.map(({ accountId, accountName, userId }) =>
              this.fb.group({
                accountId,
                accountName,
                userId,
              }),
            ),
          ),
        ),
      ),
    );

    this.page$.next(1);
  }

  onSave(): void {
    const siteContacts = (this.form.get('siteContacts').value ?? []).map(({ accountId, userId }) => ({
      accountId,
      userId,
    }));

    if (!this.form.valid || !this.form.dirty || siteContacts.length === 0) {
      return;
    }

    this.siteContactsService
      .updateVbSiteContacts(siteContacts)
      .pipe(
        catchBadRequest(
          [ErrorCodes.AUTHORITY1003, ErrorCodes.ACCOUNT1004, ErrorCodes.ACCOUNT1005, ErrorCodes.AUTHORITY1006],
          () => this.businessErrorService.showError(savePartiallyNotFoundSiteContactError),
        ),
      )
      .subscribe(() => {
        const messages: string[] = this.modifiedAccounts.map((contact) => `${contact} updated`);
        this.feedbackBannerStore.setSuccessMessages(messages);
        this.modifiedAccounts = [];
      });
  }

  handleChange(changedItem) {
    if (this.modifiedAccounts.indexOf(changedItem) === -1) {
      this.modifiedAccounts.push(changedItem);
    }
  }
}
