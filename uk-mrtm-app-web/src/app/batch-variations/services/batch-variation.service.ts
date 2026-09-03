import { inject, Service } from '@angular/core';

import { map, Observable } from 'rxjs';

import { RegulatorCurrentUserDTO } from '@mrtm/api';

import { AuthStore, selectUser } from '@netz/common/auth';

import { batchVariationsQuery, BatchVariationStore } from '@batch-variations/+state';
import { PAGE_SIZE } from '@batch-variations/batch-variations.consts';
import { BatchVariationState } from '@batch-variations/batch-variations.types';
import { BatchVariationsApiService } from '@batch-variations/services/batch-variations-api.service';

@Service()
export class BatchVariationService {
  private readonly apiService: BatchVariationsApiService = inject(BatchVariationsApiService);
  private readonly store: BatchVariationStore = inject(BatchVariationStore);
  private readonly authStore: AuthStore = inject(AuthStore);

  public loadBatchVariations(page: number = 0, pageSize?: number): Observable<boolean> {
    return this.apiService.loadBatchVariations(page, pageSize ?? PAGE_SIZE).pipe(
      map((response) => {
        this.store.setState({ ...response, page } as any);
        return true;
      }),
    );
  }

  public save(item: Partial<BatchVariationState['currentItem']>): void {
    const currentState = this.store.state;
    this.store.setState({
      ...currentState,
      currentItem: {
        ...currentState?.currentItem,
        ...item,
      },
    });
  }

  public resetCurrentItem(): boolean {
    const currentState = this.store.state;
    this.store.setState({
      ...currentState,
      currentItem: undefined,
    });

    return true;
  }

  public submit(): Observable<unknown> {
    const currentItem = this.store.select(batchVariationsQuery.selectCurrentItem)();
    const currentUser = this.authStore.select(selectUser)() as RegulatorCurrentUserDTO;

    return this.apiService.submit(currentItem, currentUser.competentAuthority);
  }
}
