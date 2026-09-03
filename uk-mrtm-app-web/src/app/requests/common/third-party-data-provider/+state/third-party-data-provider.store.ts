import { inject, Service } from '@angular/core';

import { map, Observable, take } from 'rxjs';

import { RequestTaskDTO, TasksService } from '@mrtm/api';

import { SignalStore } from '@netz/common/store';

import { ThirdPartyDataProviderState } from '@requests/common/third-party-data-provider/third-party-data-provider.types';

@Service()
export class ThirdPartyDataProviderStore extends SignalStore<ThirdPartyDataProviderState> {
  private readonly taskService = inject(TasksService);

  constructor() {
    super({ loaded: false });
  }

  loadProviderInfo(taskId: RequestTaskDTO['id']): Observable<boolean> {
    return this.taskService.getThirdPartyDataProviderInfoByRequestId(taskId).pipe(
      take(1),
      map((res) => {
        this.setState({
          thirdPartyDataProviderInfo: res,
          loaded: true,
        });
        return true;
      }),
    );
  }
}
