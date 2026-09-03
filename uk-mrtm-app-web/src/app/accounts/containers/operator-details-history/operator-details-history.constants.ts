import { GovukTableColumn } from '@netz/govuk-components';

import {
  OperatorDetailsHistoryChangesRow,
  OperatorDetailsHistoryValue,
} from '@accounts/containers/operator-details-history/operator-details-history.types';

export const OPERATOR_DETAILS_HISTORY_FIELDS: Array<{
  key: keyof OperatorDetailsHistoryValue;
  label: string;
  type: OperatorDetailsHistoryChangesRow['type'];
}> = [
  { key: 'operatorName', label: 'Operator name', type: 'text' },
  { key: 'sopId', label: 'SOP ID', type: 'text' },
  { key: 'contactAddress', label: 'Contact address', type: 'address' },
  { key: 'registeredAddress', label: 'Registered address', type: 'address' },
  { key: 'firstYearOfReportingObligation', label: 'First year of reporting obligation', type: 'date' },
];

export const OPERATOR_DETAILS_HISTORY_COLUMNS: Array<GovukTableColumn<OperatorDetailsHistoryChangesRow>> = [
  { header: 'Field', field: 'label', widthClass: 'app-column-width-20-per', isHeader: true },
  { header: 'Previous', field: 'previous', widthClass: 'app-column-width-40-per' },
  { header: 'New', field: 'new', widthClass: 'app-column-width-40-per' },
];
