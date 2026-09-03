import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { map, take, tap } from 'rxjs';

import {
  AgentUserInfoComponent,
  EmitterContactInfoComponent,
  OperatorAdminInfoComponent,
  OperatorUserInfoComponent,
} from '@accounts/components';
import {
  CREATE_USER_AUTHORITY_PROVIDER,
  createUserAuthorityFormProvider,
} from '@accounts/containers/create-user-authority/create-user-authority.form-provider';
import { UserTypePipe } from '@accounts/pipes';
import { UserAuthorityStore } from '@accounts/store';
import { selectSubmissionErrors } from '@accounts/store/user-authority.selectors';
import { UserAccountFormComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-create-account',
  imports: [
    UserTypePipe,
    UserAccountFormComponent,
    WizardStepComponent,
    ReactiveFormsModule,
    OperatorAdminInfoComponent,
    OperatorUserInfoComponent,
    AgentUserInfoComponent,
    EmitterContactInfoComponent,
  ],
  standalone: true,
  templateUrl: './create-user-authority.component.html',
  providers: [createUserAuthorityFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserAuthorityComponent implements AfterViewInit {
  public form = inject<FormGroup>(CREATE_USER_AUTHORITY_PROVIDER);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly store: UserAuthorityStore = inject(UserAuthorityStore);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly wizardStep = viewChild(WizardStepComponent, { read: ElementRef });

  public readonly userType = toSignal(this.activatedRoute.paramMap.pipe(map((params) => params.get('userType'))));
  private submissionErrors$ = this.store.pipe(selectSubmissionErrors);

  ngAfterViewInit(): void {
    this.submissionErrors$
      .pipe(
        take(1),
        tap((submissionErrors) => {
          // Check if the user has essentially been navigated to the current page due to errors caused by the final
          // submission. In that case, set the errors to the corresponding form controls and trigger the initial form
          // submission automatically in order to display the errors.
          if (submissionErrors.length > 0) {
            submissionErrors.forEach((subError) => {
              this.form.get(subError.control).setErrors(subError.validationErrors);
            });
            this.wizardStep().nativeElement.querySelector('button[type="submit"]').click();
            this.cdr.detectChanges();
            // Reset the final submission errors.
            this.store.setSubmissionErrors([]);
          }
        }),
      )
      .subscribe();
  }

  handleSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.store.setNewUserAuthority(this.form.getRawValue());
    this.store.setIsInitiallySubmitted(true);
    this.router.navigate(['summary'], { relativeTo: this.activatedRoute });
  }
}
