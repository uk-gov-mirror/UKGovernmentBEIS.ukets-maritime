import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EMPTY, filter, map, switchMap, take } from 'rxjs';

import { AccountThirdPartyDataProvidersService, ThirdPartyDataProviderNameInfoDTO } from '@mrtm/api';

import { FeedbackBannerStore } from '@netz/common/components';
import { catchBadRequest, ErrorCodes } from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';
import { GovukSelectOption, SelectComponent } from '@netz/govuk-components';

import { APPOINT_DATA_SUPPLIER_FORM } from '@accounts/containers/data-supplier';
import { provideDataSupplierAppointForm } from '@accounts/containers/data-supplier/data-supplier-appoint/data-supplier-appoint.provider';
import { WizardStepComponent } from '@shared/components';
import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-data-supplier-appoint',
  imports: [WizardStepComponent, SelectComponent, ReactiveFormsModule],
  standalone: true,
  templateUrl: './data-supplier-appoint.component.html',
  providers: [provideDataSupplierAppointForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataSupplierAppointComponent {
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly accountThirdPartyDataProvidersService = inject(AccountThirdPartyDataProvidersService);
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly formGroup = inject(APPOINT_DATA_SUPPLIER_FORM);
  public readonly accountId: InputSignal<number> = input<number>(null);

  public readonly dataSupplierId = toSignal(
    this.activatedRoute.queryParams.pipe(map((params) => params?.dataSupplierId)),
  );

  public readonly dataSuppliers = toSignal(
    toObservable(this.accountId).pipe(
      filter(Boolean),
      switchMap((accountId) => this.accountThirdPartyDataProvidersService.getAllThirdPartyDataProviders1(accountId)),
      map((response) =>
        response
          .map<GovukSelectOption>((dataSupplier: ThirdPartyDataProviderNameInfoDTO) => ({
            value: dataSupplier.id,
            text: dataSupplier.name,
          }))
          .sort((a, b) => a.text.localeCompare(b.text, 'en-GB', { sensitivity: 'base' })),
      ),
      map((dataSuppliers) =>
        !isNil(this.dataSupplierId()) ? [{ text: 'No data supplier', value: -1 }].concat(dataSuppliers) : dataSuppliers,
      ),
    ),
    { initialValue: [] },
  );

  onSubmit(): void {
    const selectedValue = this.formGroup.value?.dataSupplierId;

    (selectedValue === -1
      ? this.accountThirdPartyDataProvidersService.unappointThirdPartyDataProviderFromAccount(this.accountId())
      : this.accountThirdPartyDataProvidersService.appointThirdPartyDataProviderToAccount(
          this.accountId(),
          selectedValue,
        )
    )
      .pipe(
        take(1),
        this.pendingRequestService.trackRequest(),
        catchBadRequest(ErrorCodes.THIRDPARTYDATAPROVIDER1002, () => {
          this.formGroup.setErrors({
            dataSupplierAlreadyAppointed:
              'This role has already been updated by another user. You can refresh the page to view the current information.',
          });
          this.feedbackBannerStore.setInvalidForm(this.formGroup);
          this.router.navigate(['../../'], { fragment: 'users', relativeTo: this.activatedRoute });
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.router.navigate([selectedValue === -1 ? '../unappoint-success' : '../appoint-success'], {
          relativeTo: this.activatedRoute,
          skipLocationChange: true,
          queryParams: {
            dataSupplierName: this.dataSuppliers().find((x) => x.value === this.formGroup.value?.dataSupplierId).text,
          },
        });
      });
  }
}
