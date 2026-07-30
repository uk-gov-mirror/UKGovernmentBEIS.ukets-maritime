import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { BehaviorSubject, combineLatestWith, map, Observable } from 'rxjs';

import { MrtmAccountViewDTO, UserStateDTO } from '@mrtm/api';

import { AuthStore, selectUserRoleType } from '@netz/common/auth';
import { FeedbackBannerComponent, PageHeadingComponent } from '@netz/common/components';
import { ButtonDirective, TabLazyDirective, TabsComponent, TagComponent } from '@netz/govuk-components';

import {
  EmissionsPlanHistoryTabComponent,
  NonComplianceTabComponent,
  OperatorAccountDetailsComponent,
  OperatorAccountReportingDetailsComponent,
  ReportsTabComponent,
  UserContactsVerifiersTabComponent,
} from '@accounts/components';
import { ActiveEmissionsPlanComponent } from '@accounts/components/active-emissions-plan/active-emissions-plan.component';
import { OperatorAccountsStatusColorPipe } from '@accounts/pipes';
import { OperatorAccountsStore, selectAccount } from '@accounts/store';
import { NotesListComponent } from '@notes/components';

interface ViewModel {
  accountInfo: MrtmAccountViewDTO;
  userRoleType: UserStateDTO['roleType'];
  isAccountEditable: boolean;
}

@Component({
  selector: 'mrtm-view-operator-account',
  imports: [
    ButtonDirective,
    RouterLink,
    PageHeadingComponent,
    TabsComponent,
    OperatorAccountDetailsComponent,
    OperatorAccountReportingDetailsComponent,
    UserContactsVerifiersTabComponent,
    TagComponent,
    OperatorAccountsStatusColorPipe,
    AsyncPipe,
    TitleCasePipe,
    FeedbackBannerComponent,
    TabLazyDirective,
    EmissionsPlanHistoryTabComponent,
    NotesListComponent,
    ActiveEmissionsPlanComponent,
    ReportsTabComponent,
    NonComplianceTabComponent,
  ],
  standalone: true,
  templateUrl: './view-operator-account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewOperatorAccountComponent {
  private readonly store: OperatorAccountsStore = inject(OperatorAccountsStore);
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly currentTab$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  readonly vm$: Observable<ViewModel> = this.store.pipe(
    selectAccount,
    combineLatestWith(this.authStore.rxSelect(selectUserRoleType)),
    map(([accountInfo, userRoleType]) => ({
      accountInfo,
      userRoleType,
      isAccountEditable: accountInfo?.status !== 'CLOSED' && userRoleType === 'REGULATOR',
    })),
  );

  handleSelectedTab(tab: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      preserveFragment: true,
    });
    this.currentTab$.next(tab);
  }
}
