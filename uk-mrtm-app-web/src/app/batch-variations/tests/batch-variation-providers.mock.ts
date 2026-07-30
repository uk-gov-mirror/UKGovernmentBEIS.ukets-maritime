import { Provider } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { RegulatorAuthoritiesService } from '@mrtm/api';

import { ActivatedRouteStub, mockClass } from '@netz/common/testing';

import { BatchVariationsApiService } from '@batch-variations/services/batch-variations-api.service';

const regulatorAuthoritiesServiceMock = mockClass(RegulatorAuthoritiesService);
const batchVariationsApiServiceMock = mockClass(BatchVariationsApiService);

regulatorAuthoritiesServiceMock.getCaRegulators.mockReturnValue(
  of({
    caUsers: [
      {
        userId: '1reg',
        firstName: 'Alfyn',
        lastName: 'Octo',
        authorityStatus: 'DISABLED',
        authorityCreationDate: '2020-12-14T12:38:12.846716Z',
      },
    ],
    editable: true,
  }) as any,
);

batchVariationsApiServiceMock.loadBatchVariations.mockReturnValue(
  of({
    canInitiateBatchReissue: true,
    requestDetails: [],
    total: 0,
  }),
);

export const MOCK_PROVIDERS: Array<Provider> = [
  { provide: BatchVariationsApiService, useValue: batchVariationsApiServiceMock },
  { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
  { provide: RegulatorAuthoritiesService, useValue: regulatorAuthoritiesServiceMock },
];
