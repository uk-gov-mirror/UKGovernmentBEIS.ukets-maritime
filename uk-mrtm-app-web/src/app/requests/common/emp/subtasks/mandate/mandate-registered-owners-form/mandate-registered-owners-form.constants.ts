import { GovukTableColumn } from '@netz/govuk-components';

import { MandateShipSelectItem } from '@requests/common/emp/subtasks/mandate/mandate-registered-owners-form/mandate-registered-owners-form.types';

export const MANDATE_AVAILABLE_SHIPS_COLUMNS: Array<GovukTableColumn<MandateShipSelectItem>> = [
  { field: 'name', header: 'Ship name', widthClass: 'govuk-!-width-one-third' },
  { field: 'imoNumber', header: 'IMO number', widthClass: 'govuk-!-width-two-thirds' },
];
