import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { take } from 'rxjs';

import { VerificationBodyUpdateStatusDTO } from '@mrtm/api';

import { FeedbackBannerComponent, FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { BusinessErrorService, catchBadRequest, ErrorCodes } from '@netz/common/error';
import { ButtonDirective } from '@netz/govuk-components';

import { FormUtils } from '@shared/utils';
import {
  selectIsEditableVerificationBodiesList,
  selectVerificationBodiesListItems,
} from '@verification-bodies/+state/verification-bodies.selectors';
import { VerificationBodiesStoreService } from '@verification-bodies/+state/verification-bodies-store.service';
import { VerificationBodiesListComponent } from '@verification-bodies/components';
import { viewNotFoundVerificationBodyError } from '@verification-bodies/errors/business-error';
import {
  createVerificationBodiesFormProvider,
  VERIFICATION_BODIES_FORM,
} from '@verification-bodies/verification-bodies.form-provider';

@Component({
  selector: 'mrtm-verification-bodies',
  imports: [
    PageHeadingComponent,
    AsyncPipe,
    ButtonDirective,
    ReactiveFormsModule,
    VerificationBodiesListComponent,
    PendingButtonDirective,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './verification-bodies.component.html',
  providers: [createVerificationBodiesFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationBodiesComponent implements OnInit {
  public readonly formGroup: UntypedFormGroup = inject<UntypedFormGroup>(VERIFICATION_BODIES_FORM);
  private readonly store: VerificationBodiesStoreService = inject(VerificationBodiesStoreService);
  readonly editable$ = this.store.pipe(selectIsEditableVerificationBodiesList);
  readonly verificationBodies$ = this.store.pipe(selectVerificationBodiesListItems);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly businessErrorService = inject(BusinessErrorService);

  public handleAddNewVerificationBody(): void {
    this.router.navigate(['add'], { relativeTo: this.activatedRoute });
  }

  public ngOnInit(): void {
    this.verificationBodies$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((verificationBodies) => {
      this.formGroup.reset({
        verificationBodies,
      });
    });
  }

  public handleFormSubmit(): void {
    const verificationBodiesStatuses: VerificationBodyUpdateStatusDTO[] = (
      this.formGroup.get('verificationBodies').value as VerificationBodyUpdateStatusDTO[]
    ).filter((verificationBody) => verificationBody.status !== 'PENDING');
    if (!this.formGroup.valid || !this.formGroup.dirty || verificationBodiesStatuses.length === 0) {
      return;
    }

    this.store
      .updateVerificationBodiesStatuses(verificationBodiesStatuses)
      .pipe(
        take(1),
        catchBadRequest(ErrorCodes.VERBODY1002, () =>
          this.businessErrorService.showError(viewNotFoundVerificationBodyError),
        ),
      )
      .subscribe(() => {
        if (FormUtils.findDirtyControlsKeys(this.formGroup).includes('status')) {
          this.feedbackBannerStore.setSuccessMessages(['Account status updated']);
        }
        this.formGroup.markAsPristine();
      });
  }

  public handleDiscardChanges(): void {
    if (!this.formGroup.dirty) {
      return;
    }

    this.store.loadVerificationBodies().pipe(take(1)).subscribe();
  }
}
