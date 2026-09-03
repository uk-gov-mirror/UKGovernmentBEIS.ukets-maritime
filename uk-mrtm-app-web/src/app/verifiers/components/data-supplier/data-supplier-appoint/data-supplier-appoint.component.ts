import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EMPTY, map, take } from 'rxjs';

import { ThirdPartyDataProviderNameInfoDTO, VerificationBodyThirdPartyDataProvidersService } from '@mrtm/api';

import { catchBadRequest, ErrorCodes } from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';
import { GovukSelectOption, SelectComponent } from '@netz/govuk-components';

import { WizardStepComponent } from '@shared/components';
import { isNil } from '@shared/utils';
import { APPOINT_DATA_SUPPLIER_FORM } from '@verifiers/components/data-supplier/data-supplier.constants';
import { provideDataSupplierAppointForm } from '@verifiers/components/data-supplier/data-supplier-appoint/data-supplier-appoint.provider';

@Component({
  selector: 'mrtm-data-supplier-appoint',
  imports: [WizardStepComponent, SelectComponent, ReactiveFormsModule],
  standalone: true,
  templateUrl: './data-supplier-appoint.component.html',
  providers: [provideDataSupplierAppointForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataSupplierAppointComponent {
  private readonly verificationBodyThirdPartyDataProvidersService = inject(
    VerificationBodyThirdPartyDataProvidersService,
  );
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly formGroup = inject(APPOINT_DATA_SUPPLIER_FORM);
  public readonly accountId: InputSignal<number> = input<number>(null);

  public readonly dataSupplierId = toSignal(
    this.activatedRoute.queryParams.pipe(map((params) => params?.dataSupplierId)),
  );

  public readonly dataSuppliers = toSignal(
    this.verificationBodyThirdPartyDataProvidersService.getAllThirdPartyDataProvidersForVerificationBody().pipe(
      map((response) =>
        response
          .map<GovukSelectOption>((dataSupplier: ThirdPartyDataProviderNameInfoDTO) => ({
            value: dataSupplier.id,
            text: dataSupplier.name,
          }))
          .sort((a, b) => a.text.localeCompare(b.text, 'en-GB', { sensitivity: 'base' })),
      ),
      map((dataSuppliers) => {
        return !isNil(this.dataSupplierId())
          ? [{ text: 'No data supplier', value: -1 }].concat(dataSuppliers)
          : dataSuppliers;
      }),
    ),
    { initialValue: [] },
  );

  onSubmit(): void {
    const selectedValue = this.formGroup.value?.dataSupplierId;

    (selectedValue === -1
      ? this.verificationBodyThirdPartyDataProvidersService.unappointThirdPartyDataProviderFromVerificationBody()
      : this.verificationBodyThirdPartyDataProvidersService.appointThirdPartyDataProviderToVerificationBody(
          selectedValue,
        )
    )
      .pipe(
        take(1),
        this.pendingRequestService.trackRequest(),
        catchBadRequest(ErrorCodes.THIRDPARTYDATAPROVIDER1003, () => {
          this.formGroup.get('dataSupplierId').setErrors({
            dataSupplierAlreadyAppointed: 'This data supplier is already appointed',
          });

          this.router.navigate(['.'], {
            queryParams: { dataSupplierId: selectedValue },
            relativeTo: this.activatedRoute,
          });
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
