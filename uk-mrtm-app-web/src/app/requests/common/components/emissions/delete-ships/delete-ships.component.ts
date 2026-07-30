import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AerShipEmissions, EmpShipEmissions } from '@mrtm/api';

import { FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { ButtonDirective, LinkDirective } from '@netz/govuk-components';

import { LIST_OF_SHIPS_DELETE_STEP } from '@requests/common/components/emissions/delete-ships/delete-ships.helper';
import { EMISSIONS_SUB_TASK, LIST_OF_SHIPS_STEP } from '@requests/common/components/emissions/emissions.helpers';

@Component({
  selector: 'mrtm-delete-ships-confirmation',
  imports: [PageHeadingComponent, ButtonDirective, LinkDirective, PendingButtonDirective, RouterLink],
  standalone: true,
  templateUrl: './delete-ships.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteShipsComponent {
  private readonly taskService = inject(TaskService);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  public readonly backlink = `../${LIST_OF_SHIPS_STEP}`;

  private readonly ships: Array<(AerShipEmissions | EmpShipEmissions)['uniqueIdentifier']>;

  constructor() {
    this.ships = this.router.currentNavigation()?.extras?.state?.ships;
  }

  onConfirm() {
    this.taskService
      .saveSubtask(EMISSIONS_SUB_TASK, LIST_OF_SHIPS_DELETE_STEP, this.route, this.ships)
      .subscribe(() => {
        this.feedbackBannerStore.setSuccessMessages(['The ships have been deleted']);
      });
  }
}
