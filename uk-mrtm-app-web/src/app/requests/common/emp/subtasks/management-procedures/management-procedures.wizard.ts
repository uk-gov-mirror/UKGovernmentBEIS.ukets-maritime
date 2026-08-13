import { EmpManagementProcedures } from '@mrtm/api';

export const isManagementProceduresCompleted = (managementProcedures: EmpManagementProcedures) => {
  return (
    !!managementProcedures?.monitoringReportingRoles?.length &&
    managementProcedures?.monitoringReportingRoles?.every((mrr) => mrr.jobTitle && mrr.mainDuties) &&
    !!managementProcedures.regularCheckOfAdequacy?.reference &&
    !!managementProcedures.regularCheckOfAdequacy?.description &&
    !!managementProcedures.regularCheckOfAdequacy.recordsLocation &&
    !!managementProcedures.regularCheckOfAdequacy.responsiblePersonOrPosition &&
    !!managementProcedures.dataFlowActivities?.reference &&
    !!managementProcedures.dataFlowActivities?.description &&
    !!managementProcedures.dataFlowActivities.recordsLocation &&
    !!managementProcedures.dataFlowActivities.responsiblePersonOrPosition &&
    !!managementProcedures.riskAssessmentProcedures?.reference &&
    !!managementProcedures.riskAssessmentProcedures?.description &&
    !!managementProcedures.riskAssessmentProcedures.recordsLocation &&
    !!managementProcedures.riskAssessmentProcedures.responsiblePersonOrPosition
  );
};
