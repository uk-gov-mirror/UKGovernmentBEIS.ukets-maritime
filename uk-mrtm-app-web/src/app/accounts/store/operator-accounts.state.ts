import {
  AccountDetailsHistoryListResponse,
  AccountReportingStatusHistoryCreationDTO,
  AccountReportingStatusHistoryListResponse,
  AccountSearchResultInfoDTO,
  MrtmAccountDTO,
  MrtmAccountEmpDTO,
  MrtmAccountSearchCriteria,
  MrtmAccountUpdateDTO,
  MrtmAccountViewDTO,
} from '@mrtm/api';

import { ReportingStatusListItem } from '@accounts/types';
import { Paging } from '@shared/types';

export interface CreateAccountState {
  newAccount: MrtmAccountDTO | null;
  isInitiallySubmitted: boolean;
  isSubmitted: boolean;
}

export interface AccountsSearchState extends Omit<MrtmAccountSearchCriteria, 'page' | 'size'> {
  searchTerm: string;
  searchErrorSummaryVisible: boolean;
  accounts: AccountSearchResultInfoDTO[];
  total: number;
  paging: Paging;
}

export interface OperatorAccountsState {
  createAccount: CreateAccountState;
  currentAccount: CurrentAccountState;
  accountsSearch: AccountsSearchState;
}

export interface CurrentAccountState extends MrtmAccountEmpDTO {
  account: (MrtmAccountViewDTO & Partial<Pick<MrtmAccountUpdateDTO, 'reason'>>) | null;
  reportingStatus: ReportingStatusState;
  operatorDetailsHistory: AccountDetailsHistoryListResponse['accountDetailsHistoryList'];
}

export interface ReportingStatusState {
  history: AccountReportingStatusHistoryListResponse['reportingStatusHistoryList'];
  statuses: Array<ReportingStatusListItem>;
  currentStatus?: ReportingStatusListItem;
  upsertStatus?: AccountReportingStatusHistoryCreationDTO;
  total: number;
  paging: Paging;
}

export const initialReportingStatusState: ReportingStatusState = {
  history: {},
  statuses: [],
  total: 0,
  paging: {
    page: 1,
    pageSize: 5,
  },
};

export const initialCreateAccountState: CreateAccountState = {
  newAccount: null,
  isInitiallySubmitted: false,
  isSubmitted: false,
};

export const initialCurrentAccountState: CurrentAccountState = {
  account: null,
  reportingStatus: initialReportingStatusState,
  operatorDetailsHistory: [],
};

export const initialAccountsSearchState: AccountsSearchState = {
  searchTerm: null,
  searchErrorSummaryVisible: false,
  accounts: [],
  total: 0,
  paging: {
    page: 1,
    pageSize: 20,
  },
};

export const initialState: OperatorAccountsState = {
  createAccount: initialCreateAccountState,
  currentAccount: initialCurrentAccountState,
  accountsSearch: initialAccountsSearchState,
};
