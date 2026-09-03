import { AddressStateDTO } from '@mrtm/api';

export interface OperatorDetailsHistoryValue {
  operatorName?: string;
  sopId?: number;
  contactAddress?: AddressStateDTO;
  registeredAddress?: AddressStateDTO;
  firstYearOfReportingObligation?: string;
}

export interface OperatorDetailsHistoryChangesRow {
  label: string;
  type: 'text' | 'address' | 'date';
  previous: OperatorDetailsHistoryValue[keyof OperatorDetailsHistoryValue];
  new: OperatorDetailsHistoryValue[keyof OperatorDetailsHistoryValue];
}
