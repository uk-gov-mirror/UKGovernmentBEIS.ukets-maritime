import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject, catchError, map, shareReplay, take, throwError } from 'rxjs';

import { FeedbackBannerComponent, FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { BusinessErrorService, ErrorCodes, isBadRequest } from '@netz/common/error';
import { TabDirective, TabLazyDirective, TabsComponent } from '@netz/govuk-components';

import { VerifierUsersListComponent } from '@shared/components';
import { VerificationBodySummaryComponent } from '@shared/components/summaries';
import { deleteUniqueActiveVerifierError, savePartiallyNotFoundVerifierError } from '@shared/errors';
import { FormUtils } from '@shared/utils';
import {
  selectCurrentVerificationBody,
  selectIsVerificationBodySubmitted,
  selectVerificationBodyContactsState,
} from '@verification-bodies/+state/verification-bodies.selectors';
import { VerificationBodiesStoreService } from '@verification-bodies/+state/verification-bodies-store.service';
import { DataSupplierTabComponent } from '@verification-bodies/components/data-supplier-tab';
import { VerifierUserStore } from '@verifiers/+state/verifier-user.store';

@Component({
  selector: 'mrtm-verification-body-details',
  imports: [
    PageHeadingComponent,
    TabsComponent,
    TabDirective,
    TabLazyDirective,
    VerificationBodySummaryComponent,
    AsyncPipe,
    FeedbackBannerComponent,
    VerifierUsersListComponent,
    DataSupplierTabComponent,
  ],
  standalone: true,
  templateUrl: './verification-body-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationBodyDetailsComponent implements OnInit {
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly verifierUserStore: VerifierUserStore = inject(VerifierUserStore);
  private readonly businessErrorService: BusinessErrorService = inject(BusinessErrorService);
  private readonly verificationBodiesStoreService: VerificationBodiesStoreService =
    inject(VerificationBodiesStoreService);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  readonly currentTab$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public readonly verificationBodyId = toSignal(
    this.activatedRoute.paramMap.pipe(map((paramMap) => Number(paramMap.get('id')))),
  );
  public readonly summaryInfo$ = this.verificationBodiesStoreService.pipe(selectCurrentVerificationBody);
  private readonly verifierUsers$ = this.verificationBodiesStoreService.pipe(
    selectVerificationBodyContactsState,
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );
  public readonly authorities$ = this.verifierUsers$.pipe(map((verifierUsers) => verifierUsers.items));
  public readonly isEditable$ = this.verifierUsers$.pipe(map((verifierUsers) => verifierUsers.editable));

  ngOnInit(): void {
    this.verificationBodiesStoreService.pipe(selectIsVerificationBodySubmitted, take(1)).subscribe((isSubmitted) => {
      if (isSubmitted) {
        this.feedbackBannerStore.setSuccessMessages(['Verification body details updated']);
        this.verificationBodiesStoreService.setUpdateVerificationBodyIsSubmitted(false);
      }
    });
  }

  public handleSelectedTab(tab: string): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      preserveFragment: true,
    });
    this.currentTab$.next(tab);
  }

  public handleSaveChanges({ authoritiesToUpdate, form }) {
    const dirtyControlsKeys = FormUtils.findDirtyControlsKeys(form);
    this.verificationBodiesStoreService
      .updateVerifierUsersStatuses(this.verificationBodyId(), authoritiesToUpdate)
      .pipe(
        catchError((err: unknown) => {
          if (!isBadRequest(err)) {
            return throwError(() => err);
          }

          switch (err?.error?.code) {
            case ErrorCodes.AUTHORITY1007:
              return this.businessErrorService.showError(deleteUniqueActiveVerifierError(this.verificationBodyId()));
            case ErrorCodes.AUTHORITY1006:
              return this.businessErrorService.showError(savePartiallyNotFoundVerifierError);
            default:
              return throwError(() => err);
          }
        }),
        take(1),
      )
      .subscribe(() => {
        this.feedbackBannerStore.setSuccessMessages(
          dirtyControlsKeys.map((key) => {
            let message = '';
            if (key === 'authorityStatus') {
              message = 'Account status';
            } else if (key === 'roleCode') {
              message = 'User type';
            }
            return `${message} updated`;
          }),
        );
      });
  }

  public handleDiscardChanges() {
    this.verificationBodiesStoreService.loadVerifierUsers(this.verificationBodyId()).pipe(take(1)).subscribe();
  }
}
