import { map, OperatorFunction, pipe } from 'rxjs';

import {
  AccountReportingStatusHistoryCreationDTO,
  AccountReportingStatusHistoryListResponse,
  EmpDetailsDTO,
  MrtmAccountDTO,
  MrtmAccountViewDTO,
} from '@mrtm/api';

import {
  CreateAccountState,
  CurrentAccountState,
  OperatorAccountsState,
  ReportingStatusState,
} from '@accounts/store/operator-accounts.state';
import { ReportingStatusListItem } from '@accounts/types';
import { ActiveEmissionsPlanFiles, AttachedFile, Paging } from '@shared/types';

export const selectCreateAccountState: OperatorFunction<OperatorAccountsState, CreateAccountState> = pipe(
  map((state) => state.createAccount),
);

export const selectNewAccount: OperatorFunction<OperatorAccountsState, MrtmAccountDTO> = pipe(
  selectCreateAccountState,
  map((state) => state.newAccount),
);

export const selectIsInitiallySubmitted: OperatorFunction<OperatorAccountsState, boolean> = pipe(
  selectCreateAccountState,
  map((state) => state.isInitiallySubmitted),
);

export const selectIsSubmitted: OperatorFunction<OperatorAccountsState, boolean> = pipe(
  selectCreateAccountState,
  map((state) => state.isSubmitted),
);

export const selectCurrentAccount: OperatorFunction<OperatorAccountsState, CurrentAccountState> = pipe(
  map((state) => state.currentAccount),
);

export const selectCurrentAccountEmp: OperatorFunction<OperatorAccountsState, EmpDetailsDTO> = pipe(
  selectCurrentAccount,
  map((currentAccount) => currentAccount.emp),
);

export const selectActiveEmissionsPlanFiles: OperatorFunction<OperatorAccountsState, ActiveEmissionsPlanFiles> = pipe(
  selectCurrentAccountEmp,
  map((emp) => {
    if (!emp) {
      return {
        empDocument: null,
        empAttachments: [],
      };
    }
    const empDocument: AttachedFile = {
      fileName: emp.fileDocument?.name,
      downloadUrl: `file-download/document/${emp.id}/${emp.fileDocument?.uuid}`,
    };
    const empAttachments: AttachedFile[] = Object.entries(emp.empAttachments ?? {}).map(([key, value]) => ({
      fileName: value,
      downloadUrl: `file-download/attachment/${emp.id}/${key}`,
    }));
    return {
      empDocument,
      empAttachments,
    };
  }),
);

export const selectAccount: OperatorFunction<OperatorAccountsState, MrtmAccountViewDTO> = pipe(
  map((state) => state.currentAccount?.account),
);

export const selectSearchTerm: OperatorFunction<OperatorAccountsState, string> = pipe(
  map((state) => state.accountsSearch.searchTerm),
);

export const selectSearchErrorSummaryVisible: OperatorFunction<OperatorAccountsState, boolean> = pipe(
  map((state) => state.accountsSearch.searchErrorSummaryVisible),
);

export const selectAccounts: OperatorFunction<
  OperatorAccountsState,
  OperatorAccountsState['accountsSearch']['accounts']
> = pipe(map((state) => state.accountsSearch.accounts));

export const selectTotal: OperatorFunction<OperatorAccountsState, number> = pipe(
  map((state) => state.accountsSearch.total),
);

export const selectPaging: OperatorFunction<OperatorAccountsState, Paging> = pipe(
  map((state) => state.accountsSearch.paging),
);

export const selectSearchState: OperatorFunction<OperatorAccountsState, OperatorAccountsState['accountsSearch']> = pipe(
  map((state) => state.accountsSearch),
);

export const selectPage: OperatorFunction<OperatorAccountsState, number> = pipe(
  selectPaging,
  map((paging) => paging.page),
);

export const selectPageSize: OperatorFunction<OperatorAccountsState, number> = pipe(
  selectPaging,
  map((paging) => paging.pageSize),
);

export const selectReportingStatus: OperatorFunction<OperatorAccountsState, ReportingStatusState> = pipe(
  map((state) => state.currentAccount?.reportingStatus),
);

export const selectUpsertReportingStatus: OperatorFunction<
  OperatorAccountsState,
  AccountReportingStatusHistoryCreationDTO
> = pipe(
  selectReportingStatus,
  map((state) => state.upsertStatus),
);

export const selectReportingStatusHistory: OperatorFunction<
  OperatorAccountsState,
  AccountReportingStatusHistoryListResponse['reportingStatusHistoryList']
> = pipe(
  selectReportingStatus,
  map((state) => state?.history),
);

export const selectReportingStatusHistoryTotal: OperatorFunction<OperatorAccountsState, number> = pipe(
  selectReportingStatus,
  map((state) => state?.total),
);

export const selectReportingStatusHistoryPaging: OperatorFunction<OperatorAccountsState, Paging> = pipe(
  selectReportingStatus,
  map((state) => state?.paging),
);

export const selectReportingStatusHistoryPage: OperatorFunction<OperatorAccountsState, number> = pipe(
  selectReportingStatusHistoryPaging,
  map((paging) => paging?.page),
);
export const selectReportingStatusHistoryPageSize: OperatorFunction<OperatorAccountsState, number> = pipe(
  selectReportingStatusHistoryPaging,
  map((paging) => paging?.pageSize),
);

export const selectReportingStatusesList: OperatorFunction<
  OperatorAccountsState,
  Array<ReportingStatusListItem>
> = pipe(
  selectReportingStatus,
  map((state) => state?.statuses),
);
