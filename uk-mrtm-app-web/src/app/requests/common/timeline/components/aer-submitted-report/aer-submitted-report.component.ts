import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';

import {
  AdditionalDocuments,
  AerMonitoringPlanChanges,
  AerMonitoringPlanVersion,
  AerOperatorDetails,
  AerReportingObligationDetails,
  AerSmf,
  AerSmfDetails,
  AerTotalEmissions,
  LimitedCompanyOrganisation,
} from '@mrtm/api';

import { PageHeadingComponent } from '@netz/common/components';
import { GovukDatePipe } from '@netz/common/pipes';
import { RequestActionReportService } from '@netz/common/services';
import { requestActionQuery, RequestActionStore } from '@netz/common/store';
import { getYearFromRequestId } from '@netz/common/utils';

import { timelineCommonQuery } from '@requests/common';
import { aerAdditionalDocumentsMap } from '@requests/common/aer/subtasks/aer-additional-documents';
import { aerAggregatedDataSubtasksListMap } from '@requests/common/aer/subtasks/aer-aggregated-data';
import { aerPortsMap } from '@requests/common/aer/subtasks/aer-ports';
import {
  aerEmissionsMap,
  aerTotalEmissionsMap,
  monitoringPlanChangesMap,
  reportingObligationMap,
} from '@requests/common/aer/subtasks/aer-subtasks-list.map';
import { aerVoyagesMap } from '@requests/common/aer/subtasks/aer-voyages';
import { reductionClaimMap } from '@requests/common/aer/subtasks/reduction-claim';
import { operatorDetailsMap } from '@requests/common/components/operator-details';
import { aerTimelineCommonQuery } from '@requests/common/timeline/aer-common';
import {
  AdditionalDocumentsSummaryTemplateComponent,
  AerTotalEmissionsSummaryTemplateComponent,
  AggregatedDataListSummaryTemplateComponent,
  ListOfShipsSummaryTemplateComponent,
  MonitoringPlanChangesSummaryTemplateComponent,
  OperatorDetailsSummaryTemplateComponent,
  PortCallsListSummaryTemplateComponent,
  ReductionClaimDetailsSummaryTemplateComponent,
  ReductionClaimSummaryTemplateComponent,
  ReportingObligationSummaryTemplateComponent,
  VoyagesListSummaryTemplateComponent,
} from '@shared/components';
import {
  AerAggregatedDataSummaryItemDto,
  AerPortSummaryItemDto,
  AerVoyageSummaryItemDto,
  AttachedFile,
  ReductionClaimDetailsListItemDto,
  ShipEmissionTableListItem,
  SubTaskListMap,
} from '@shared/types';
import { itemActionToTitleTransformer } from '@shared/utils/transformers';

interface ViewModel {
  title: string;
  creationDate: string;
  reportingYear: string;
  reportingRequired: boolean;
  reportingObligationDetails: AerReportingObligationDetails;
  reportingObligationFiles: AttachedFile[];
  reportingObligationSubtaskMap: SubTaskListMap<unknown>;
  monitoringPlanVersion: AerMonitoringPlanVersion;
  monitoringPlanChanges: AerMonitoringPlanChanges;
  monitoringPlanChangesSubtaskMap: SubTaskListMap<unknown>;
  aerEmissions: ShipEmissionTableListItem[];
  aerEmissionsSubtaskMap: SubTaskListMap<unknown>;
  aerVoyages: AerVoyageSummaryItemDto[];
  aerVoyagesSubtaskMap: SubTaskListMap<unknown>;
  aerPorts: AerPortSummaryItemDto[];
  aerPortsSubtaskMap: SubTaskListMap<unknown>;
  aerAggregatedData: AerAggregatedDataSummaryItemDto[];
  aerAggregatedDataSubtaskMap: SubTaskListMap<unknown>;
  aerReductionClaim: AerSmf;
  fuelPurchases: ReductionClaimDetailsListItemDto[];
  aerReductionClaimSubtaskMap: SubTaskListMap<AerSmf & Pick<AerSmfDetails, 'purchases'>>;
  operatorDetails: AerOperatorDetails;
  operatorDetailsFiles: AttachedFile[];
  operatorDetailsSubtaskMap: SubTaskListMap<unknown>;
  additionalDocuments: AdditionalDocuments;
  additionalDocumentsFiles: AttachedFile[];
  additionalDocumentsSubtaskMap: SubTaskListMap<unknown>;
  totalEmissions: AerTotalEmissions;
  totalEmissionsSubtaskMap: SubTaskListMap<unknown>;
}

@Component({
  selector: 'mrtm-aer-submitted-report',
  imports: [
    PageHeadingComponent,
    GovukDatePipe,
    ReportingObligationSummaryTemplateComponent,
    OperatorDetailsSummaryTemplateComponent,
    MonitoringPlanChangesSummaryTemplateComponent,
    ListOfShipsSummaryTemplateComponent,
    VoyagesListSummaryTemplateComponent,
    PortCallsListSummaryTemplateComponent,
    AggregatedDataListSummaryTemplateComponent,
    ReductionClaimSummaryTemplateComponent,
    ReductionClaimDetailsSummaryTemplateComponent,
    AdditionalDocumentsSummaryTemplateComponent,
    AerTotalEmissionsSummaryTemplateComponent,
  ],
  standalone: true,
  templateUrl: './aer-submitted-report.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerSubmittedReportComponent implements AfterViewInit {
  private readonly store = inject(RequestActionStore);

  private readonly requestActionReportService = inject(RequestActionReportService);
  readonly hasVerification = input<boolean>(false);

  readonly vm: Signal<ViewModel> = computed(() => {
    const requestActionDTO = this.store.select(requestActionQuery.selectAction)();
    const aer = this.store.select(aerTimelineCommonQuery.selectAer)();
    const reportingYear = this.store.select(timelineCommonQuery.selectReportingYear)();
    const title = itemActionToTitleTransformer(requestActionDTO?.type, reportingYear, requestActionDTO?.submitter);
    const creationDate = requestActionDTO?.creationDate;

    // ReportingObligation
    const reportingRequired = this.store.select(aerTimelineCommonQuery.selectReportingRequired)();
    const reportingObligationDetails = this.store.select(aerTimelineCommonQuery.selectReportingObligationDetails)();
    const reportingObligationFiles = this.store.select(
      aerTimelineCommonQuery.selectAttachedFiles(reportingObligationDetails?.supportingDocuments),
    )();
    const reportingObligationSubtaskMap = reportingObligationMap;

    // OperatorDetails
    const operatorDetails = this.store.select(aerTimelineCommonQuery.selectOperatorDetails)();
    const operatorDetailsFiles = this.store.select(
      aerTimelineCommonQuery.selectAttachedFiles(
        (operatorDetails?.organisationStructure as LimitedCompanyOrganisation)?.evidenceFiles,
      ),
    )();
    const operatorDetailsSubtaskMap = operatorDetailsMap;

    // Monitoring Plan Changes
    const monitoringPlanVersion = this.store.select(aerTimelineCommonQuery.selectMonitoringPlanVersion)();
    const monitoringPlanChanges = this.store.select(aerTimelineCommonQuery.selectMonitoringPlanChanges)();
    const monitoringPlanChangesSubtaskMap = monitoringPlanChangesMap;

    // Emissions
    const aerEmissions = this.store.select(aerTimelineCommonQuery.selectListOfShips)();
    const aerEmissionsSubtaskMap = aerEmissionsMap;

    // Voyages
    const aerVoyages = this.store.select(aerTimelineCommonQuery.selectVoyagesList)();
    const aerVoyagesSubtaskMap = aerVoyagesMap;

    // Ports
    const aerPorts = this.store.select(aerTimelineCommonQuery.selectPortsList)();
    const aerPortsSubtaskMap = aerPortsMap;

    // AggregatedData
    const aerAggregatedData = this.store.select(aerTimelineCommonQuery.selectAggregatedDataList)();
    const aerAggregatedDataSubtaskMap = aerAggregatedDataSubtasksListMap;

    // Reduction Claim
    const aerReductionClaim = this.store.select(aerTimelineCommonQuery.selectReductionClaim)();
    const fuelPurchases = this.store.select(aerTimelineCommonQuery.selectReductionClaimDetailsListItems)();
    const aerReductionClaimSubtaskMap = reductionClaimMap;

    // Additional Documents
    const additionalDocuments = aer?.additionalDocuments;
    const additionalDocumentsFiles = this.store.select(
      aerTimelineCommonQuery.selectAttachedFiles(additionalDocuments?.documents),
    )();
    const additionalDocumentsSubtaskMap = aerAdditionalDocumentsMap;

    // Total Emissions
    const totalEmissions = this.store.select(aerTimelineCommonQuery.selectTotalEmissions)();
    const totalEmissionsSubtaskMap = aerTotalEmissionsMap;

    return {
      title,
      creationDate,
      reportingYear,
      reportingRequired,
      reportingObligationDetails,
      reportingObligationSubtaskMap,
      reportingObligationFiles,
      operatorDetails,
      operatorDetailsFiles,
      operatorDetailsSubtaskMap,
      monitoringPlanVersion,
      monitoringPlanChanges,
      monitoringPlanChangesSubtaskMap,
      aerEmissions,
      aerEmissionsSubtaskMap,
      aerVoyages,
      aerVoyagesSubtaskMap,
      aerPorts,
      aerPortsSubtaskMap,
      aerAggregatedData,
      aerAggregatedDataSubtaskMap,
      aerReductionClaim,
      fuelPurchases,
      aerReductionClaimSubtaskMap,
      additionalDocuments,
      additionalDocumentsFiles,
      additionalDocumentsSubtaskMap,
      totalEmissions,
      totalEmissionsSubtaskMap,
    };
  });

  ngAfterViewInit(): void {
    if (!this.hasVerification()) {
      const requestActionDTO = this.store.select(requestActionQuery.selectAction)();
      const fileName = itemActionToTitleTransformer(
        requestActionDTO?.type,
        getYearFromRequestId(requestActionDTO?.requestId),
        null,
      );
      setTimeout(() => {
        this.requestActionReportService.print(fileName);
      }, 500);
    }
  }
}
