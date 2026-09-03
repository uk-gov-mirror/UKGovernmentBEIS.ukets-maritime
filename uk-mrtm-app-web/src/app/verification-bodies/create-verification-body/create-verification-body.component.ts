import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { filter, take } from 'rxjs';

import { LocationStateFormComponent, UserAccountFormComponent, WizardStepComponent } from '@shared/components';
import { isNil } from '@shared/utils';
import { selectSubmissionErrors } from '@verification-bodies/+state/verification-bodies.selectors';
import { VerificationBodiesStoreService } from '@verification-bodies/+state/verification-bodies-store.service';
import { VerificationBodyFormComponent } from '@verification-bodies/components/verification-body-form/verification-body-form.component';
import {
  CREATE_VERIFICATION_BODY_PROVIDER,
  createVerificationBodyFormProvider,
} from '@verification-bodies/create-verification-body/create-verification-body.form-provider';

@Component({
  selector: 'mrtm-create-verification-body',
  imports: [
    WizardStepComponent,
    ReactiveFormsModule,
    VerificationBodyFormComponent,
    LocationStateFormComponent,
    UserAccountFormComponent,
  ],
  standalone: true,
  templateUrl: './create-verification-body.component.html',
  providers: [createVerificationBodyFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateVerificationBodyComponent implements AfterViewInit {
  public readonly form: UntypedFormGroup = inject<UntypedFormGroup>(CREATE_VERIFICATION_BODY_PROVIDER);
  private readonly store: VerificationBodiesStoreService = inject(VerificationBodiesStoreService);
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  public readonly wizardStep = viewChild(WizardStepComponent, { read: ElementRef });
  private readonly submissionErrors$ = this.store.pipe(selectSubmissionErrors);

  public handleFormSubmit(): void {
    this.store.setNewVerificationBody(this.form.getRawValue());
    this.router.navigate(['summary'], { relativeTo: this.activatedRoute });
  }

  public ngAfterViewInit(): void {
    this.submissionErrors$
      .pipe(
        take(1),
        filter((errors) => !isNil(errors) && errors.length > 0),
      )
      .subscribe((submissionErrors) => {
        for (const { control, validationErrors } of submissionErrors) {
          this.form.get(control).setErrors(validationErrors);
        }
        this.wizardStep().nativeElement.querySelector('button[type="submit"]').click();

        this.changeDetectorRef.detectChanges();
        this.store.setSubmissionErrors(null);
      });
  }
}
