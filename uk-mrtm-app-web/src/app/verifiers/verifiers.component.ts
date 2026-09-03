import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject, EMPTY, take } from 'rxjs';

import { VerificationBodiesService } from '@mrtm/api';

import { FeedbackBannerComponent, FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { BusinessErrorService, catchBadRequest, ErrorCodes } from '@netz/common/error';
import { TabDirective, TabLazyDirective, TabsComponent } from '@netz/govuk-components';

import { VerifierUsersListComponent } from '@shared/components';
import { VerificationBodySummaryComponent } from '@shared/components/summaries/verification-body-summary';
import { savePartiallyNotFoundVerifierError } from '@shared/errors';
import { FormUtils } from '@shared/utils/form.utils';
import {
  selectIsEditableVerifierUsersList,
  selectVerifierUsersListItems,
} from '@verifiers/+state/verifier-user.selectors';
import { VerifierUserStore } from '@verifiers/+state/verifier-user.store';
import { DataSupplierComponent, SiteContactsComponent } from '@verifiers/components';

@Component({
  selector: 'mrtm-verifiers',
  imports: [
    PageHeadingComponent,
    TabsComponent,
    AsyncPipe,
    TabDirective,
    VerifierUsersListComponent,
    FeedbackBannerComponent,
    SiteContactsComponent,
    TabLazyDirective,
    DataSupplierComponent,
    VerificationBodySummaryComponent,
  ],
  standalone: true,
  templateUrl: './verifiers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifiersComponent {
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly businessErrorService = inject(BusinessErrorService);
  private readonly store: VerifierUserStore = inject(VerifierUserStore);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly verificationBodiesService = inject(VerificationBodiesService);

  public readonly currentTab$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public readonly authorities$ = this.store.pipe(selectVerifierUsersListItems);
  public readonly verifiersEditable$ = this.store.pipe(selectIsEditableVerifierUsersList);

  readonly verificationBodyDetails = toSignal(this.verificationBodiesService.getVerificationBodyDetails());

  public handleSelectedTab(tab: string): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      preserveFragment: true,
    });
    this.currentTab$.next(tab);
  }

  public onSave({ authoritiesToUpdate, form }) {
    const dirtyControls = FormUtils.findDirtyControlsKeys(form);
    this.store
      .updateVerifierUsers(authoritiesToUpdate)
      .pipe(
        take(1),
        catchBadRequest(ErrorCodes.AUTHORITY1006, () =>
          this.businessErrorService.showError(savePartiallyNotFoundVerifierError),
        ),
        catchBadRequest(ErrorCodes.AUTHORITY1007, () => {
          (form as FormGroup).setErrors({ noAdmin: 'You must have an active verifier admin on your account' });
          this.feedbackBannerStore.setInvalidForm(form);
          this.onDiscardChanges();
          return EMPTY;
        }),
      )
      .subscribe(() => {
        const successMessages = dirtyControls.map((key) => {
          let message = '';
          if (key === 'authorityStatus') {
            message = 'Account status';
          } else if (key === 'roleCode') {
            message = 'User type';
          }
          return `${message} updated`;
        });
        this.feedbackBannerStore.setSuccessMessages(successMessages);
      });
  }

  public onDiscardChanges() {
    this.store.loadVerifierUsers().pipe(take(1)).subscribe();
  }
}
