import { inject, Service } from '@angular/core';

import { Observable } from 'rxjs';

import {
  EmpBatchReissueRequestCreateActionPayload,
  EmpBatchReissuesResponseDTO,
  RegulatorCurrentUserDTO,
  RequestsService,
} from '@mrtm/api';

import { BusinessErrorService, catchBadRequest, ErrorCodes } from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';

import { anotherInProgressError, noMatchingEmittersError } from '@batch-variations/errors';

@Service()
export class BatchVariationsApiService {
  private readonly apiService = inject(RequestsService);
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly businessErrorService = inject(BusinessErrorService);

  public loadBatchVariations(page: number = 0, size: number = 30): Observable<EmpBatchReissuesResponseDTO> {
    return this.apiService.getBatchReissueRequests(page, size).pipe(this.pendingRequestService.trackRequest());
  }

  public submit(
    payload: EmpBatchReissueRequestCreateActionPayload,
    competentAuthority: RegulatorCurrentUserDTO['competentAuthority'],
  ): Observable<unknown> {
    return this.apiService
      .processRequestCreateAction(
        {
          requestType: 'EMP_BATCH_REISSUE',
          requestCreateActionPayload: {
            payloadType: 'EMP_BATCH_REISSUE_REQUEST_CREATE_ACTION_PAYLOAD',
            ...payload,
          } as EmpBatchReissueRequestCreateActionPayload,
        },
        competentAuthority,
      )
      .pipe(
        this.pendingRequestService.trackRequest(),
        catchBadRequest([ErrorCodes.BATCHREISSUE0001, 'EMPBATCHREISSUE0001'], () =>
          this.businessErrorService.showError(anotherInProgressError()),
        ),
        catchBadRequest([ErrorCodes.BATCHREISSUE0002, 'EMPBATCHREISSUE0002'], () =>
          this.businessErrorService.showError(noMatchingEmittersError()),
        ),
      );
  }
}
