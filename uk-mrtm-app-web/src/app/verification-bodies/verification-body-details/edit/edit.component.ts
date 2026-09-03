import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EMPTY, of, take } from 'rxjs';

import { BusinessErrorService, catchBadRequest, catchElseRethrow, ErrorCodes, HttpStatuses } from '@netz/common/error';

import { LocationStateFormComponent, WizardStepComponent } from '@shared/components';
import { VerificationBodiesStoreService } from '@verification-bodies/+state/verification-bodies-store.service';
import { VerificationBodyFormComponent } from '@verification-bodies/components';
import { viewNotFoundVerificationBodyError } from '@verification-bodies/errors/business-error';
import {
  EDIT_VERIFICATION_BODY_PROVIDER,
  editVerificationBodyFormProvider,
} from '@verification-bodies/verification-body-details/edit/edit.form-provider';

@Component({
  selector: 'mrtm-edit',
  imports: [WizardStepComponent, ReactiveFormsModule, VerificationBodyFormComponent, LocationStateFormComponent],
  standalone: true,
  templateUrl: './edit.component.html',
  providers: [editVerificationBodyFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditComponent {
  public readonly form: UntypedFormGroup = inject<UntypedFormGroup>(EDIT_VERIFICATION_BODY_PROVIDER);
  private readonly store: VerificationBodiesStoreService = inject(VerificationBodiesStoreService);
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly businessErrorService = inject(BusinessErrorService);
  public readonly wizardStep = viewChild(WizardStepComponent, { read: ElementRef });

  public handleFormSubmit(): void {
    (this.form.dirty
      ? this.store.updateVerificationBodyDetails(this.form.getRawValue()).pipe(
          take(1),
          catchElseRethrow(
            (res) => res.status === HttpStatuses.NotFound,
            () => this.businessErrorService.showError(viewNotFoundVerificationBodyError),
          ),
          catchBadRequest(ErrorCodes.VERBODY1001, () => {
            this.form.controls['accreditationReferenceNumber'].setErrors({
              accreditationReferenceNumberExist: 'Enter a unique Accreditation reference number',
            });
            this.wizardStep().nativeElement.querySelector('button[type="submit"]').click();
            return EMPTY;
          }),
        )
      : of(true)
    ).subscribe(() => {
      this.router.navigate(['../'], {
        relativeTo: this.activatedRoute,
      });
    });
  }
}
