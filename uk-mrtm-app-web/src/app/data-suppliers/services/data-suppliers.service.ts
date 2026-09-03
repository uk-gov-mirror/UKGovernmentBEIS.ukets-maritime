import { inject, Service } from '@angular/core';

import { map, Observable, switchMap } from 'rxjs';

import { ThirdPartyDataProviderAPIService, ThirdPartyDataProviderCreateDTO } from '@mrtm/api';

import { BusinessErrorService, catchBadRequest, ErrorCodes } from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';

import { DataSuppliersStore } from '@data-suppliers/+state';
import { DataSupplierItem } from '@data-suppliers/data-suppliers.types';
import { thirdPartyDataProviderNameAlreadyExist, thirdPartyDataProviderUrlAlreadyExist } from '@data-suppliers/errors';

@Service()
export class DataSuppliersService {
  private readonly store = inject(DataSuppliersStore);
  private readonly thirdPartyDataProviderService = inject(ThirdPartyDataProviderAPIService);
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly businessErrorService = inject(BusinessErrorService);

  loadItems(): Observable<boolean> {
    return this.thirdPartyDataProviderService.getAllThirdPartyDataProviders().pipe(
      this.pendingRequestService.trackRequest(),
      map((response) => response as any as { editable: boolean; thirdPartyDataProviders: Array<DataSupplierItem> }),
      map((response) => {
        this.store.setIsEditable(response.editable);
        this.store.setItems(response.thirdPartyDataProviders);

        return true;
      }),
    );
  }

  addNewItem(item: ThirdPartyDataProviderCreateDTO): Observable<boolean> {
    return this.thirdPartyDataProviderService.createThirdPartyDataProvider(item).pipe(
      this.pendingRequestService.trackRequest(),
      catchBadRequest(ErrorCodes.THIRDPARTYDATAPROVIDER1000, () =>
        this.businessErrorService.showError(thirdPartyDataProviderNameAlreadyExist()),
      ),
      catchBadRequest(ErrorCodes.THIRDPARTYDATAPROVIDER1001, () =>
        this.businessErrorService.showError(thirdPartyDataProviderUrlAlreadyExist()),
      ),
      switchMap(() => this.loadItems()),
    );
  }
}
