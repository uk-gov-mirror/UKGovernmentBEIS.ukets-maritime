import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MrtmItemDTO } from '@mrtm/api';

import { DebounceDirective } from '@netz/common/directives';
import { DaysRemainingPipe, ItemLinkPipe, ItemNamePipe, UserFullNamePipe } from '@netz/common/pipes';
import { getYearFromRequestId } from '@netz/common/utils';
import { GovukTableColumn, LinkDirective, TableComponent, TagComponent } from '@netz/govuk-components';

import { ItemTypePipe } from '@shared/dashboard/pipes/item-type.pipe';
import { ScrollablePaneDirective } from '@shared/directives';

@Component({
  selector: 'mrtm-dashboard-items-list',
  imports: [
    TableComponent,
    LinkDirective,
    RouterLink,
    TagComponent,
    ItemLinkPipe,
    ItemNamePipe,
    UserFullNamePipe,
    ItemTypePipe,
    DaysRemainingPipe,
    ScrollablePaneDirective,
    DebounceDirective,
  ],
  standalone: true,
  templateUrl: './dashboard-items-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardItemsListComponent {
  readonly items = input<MrtmItemDTO[]>();
  readonly emptyTableText = input<string>('No tasks found');
  readonly tableColumns = input<GovukTableColumn<MrtmItemDTO>[]>();
  readonly unassignedLabel = input<string>();

  readonly getYearFromRequestId = getYearFromRequestId;
}
