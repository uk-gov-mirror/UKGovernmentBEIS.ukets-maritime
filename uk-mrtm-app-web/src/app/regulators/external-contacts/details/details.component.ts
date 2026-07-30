import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { filter, first, map, Observable, of, switchMap, tap } from 'rxjs';

import { CaExternalContactDTO, CaExternalContactsService } from '@mrtm/api';

import { FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { BusinessErrorService, catchBadRequest, ErrorCodes, isBadRequest } from '@netz/common/error';
import { ButtonDirective, ErrorSummaryComponent, GovukValidators, TextInputComponent } from '@netz/govuk-components';

import { saveNotFoundExternalContactError } from '@regulators/errors/business-error';
import { SubmitIfEmptyPipe } from '@shared/pipes';
import { requiredFieldsValidator } from '@shared/validators';

@Component({
  selector: 'mrtm-details',
  imports: [
    ErrorSummaryComponent,
    PageHeadingComponent,
    ReactiveFormsModule,
    TextInputComponent,
    PendingButtonDirective,
    ButtonDirective,
    AsyncPipe,
    SubmitIfEmptyPipe,
  ],
  standalone: true,
  templateUrl: './details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsComponent {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly caExternalContactsService = inject(CaExternalContactsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly businessErrorService = inject(BusinessErrorService);
  private readonly feedbackBannerStore: FeedbackBannerStore = inject(FeedbackBannerStore);

  isSummaryDisplayed: boolean;
  form = this.fb.group(
    {
      name: [
        null,
        [
          GovukValidators.required(`Enter the external contact's displayed name`),
          GovukValidators.maxLength(
            100,
            `The external contact's displayed name should not be more than 100 characters`,
          ),
        ],
      ],
      email: [
        null,
        [
          GovukValidators.required(`Enter external contact's email address`),
          GovukValidators.email('Enter an email address in the correct format, like name@example.com'),
          GovukValidators.maxLength(255, 'Email should not be more than 255 characters'),
        ],
      ],
      description: [
        null,
        [
          GovukValidators.required(`Enter external contact's description`),
          GovukValidators.maxLength(100, 'Description should not be more than 100 characters'),
        ],
      ],
    },
    { validators: requiredFieldsValidator() },
  );

  userLoaded$: Observable<CaExternalContactDTO> = this.route.data.pipe(
    map((x) => x?.contact),
    filter((contact) => contact),
    tap((contact) => this.form.patchValue(contact)),
  );

  addExternalContact(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.isSummaryDisplayed = true;
    } else {
      (this.form.dirty
        ? this.route.paramMap.pipe(
            first(),
            map((paramMap) => paramMap.get('userId')),
            switchMap((userId) =>
              userId
                ? this.caExternalContactsService.editCaExternalContact(Number(userId), this.form.value)
                : this.caExternalContactsService.createCaExternalContact(this.form.value),
            ),
            catchBadRequest(ErrorCodes.EXTCONTACT1000, () =>
              this.businessErrorService.showError(saveNotFoundExternalContactError),
            ),
          )
        : of(true)
      ).subscribe({
        next: () => {
          if (this.form.dirty) {
            this.feedbackBannerStore.setSuccessMessages([
              this.route.snapshot.paramMap.get('userId')
                ? 'External contact details updated'
                : 'External contact details created',
            ]);
          }
          this.router.navigate(['../..'], { relativeTo: this.route, fragment: 'external-contacts' });
        },
        error: (res: unknown) => this.handleError(res),
      });
    }
  }

  private handleError(res: unknown): void {
    if (isBadRequest(res)) {
      switch (res.error.code) {
        case ErrorCodes.EXTCONTACT1001:
          this.form.get('name').setErrors({ uniqueName: 'Enter a unique displayed name' });
          break;
        case ErrorCodes.EXTCONTACT1002:
          this.form.get('email').setErrors({ uniqueEmail: 'Email address already exists' });
          break;
        case ErrorCodes.EXTCONTACT1003:
          this.form.get('name').setErrors({ uniqueName: 'Enter a unique displayed name' });
          this.form.get('email').setErrors({ uniqueEmail: 'Email address already exists' });
          break;
        default:
          throw res;
      }
      this.isSummaryDisplayed = true;
    } else {
      throw res;
    }
  }
}
