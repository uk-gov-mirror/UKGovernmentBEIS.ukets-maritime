import { GovukTableColumn } from '@netz/govuk-components';

import { AccountsListItemModel } from '@accounts/containers/accounts-list/accounts-list.types';

export const ACCOUNTS_LIST_COLUMNS: Array<GovukTableColumn<AccountsListItemModel>> = [
  { header: 'Operator name', field: 'name', isSortable: true, widthClass: 'app-column-width-25-per' },
  { header: 'IMO number', field: 'imoNumber', widthClass: 'app-column-width-25-per' },
  { header: 'Account ID', field: 'businessId', widthClass: 'app-column-width-25-per' },
  { header: 'Status', field: 'status', isSortable: true, widthClass: 'app-column-width-25-per' },
];
