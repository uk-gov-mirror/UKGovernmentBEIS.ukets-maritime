import { EmpManagementProcedures } from '@mrtm/api';

import { EuXmlMonitoringPlan } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { warn } from '@requests/common/eu-xml-import/mappers/mapper.helpers';
import { mapProcedureForm } from '@requests/common/eu-xml-import/mappers/procedure-form.mapper';
import { XmlValidationError } from '@shared/types';

export function mapManagementProcedures(plan: EuXmlMonitoringPlan): {
  managementProcedures: EmpManagementProcedures;
  managementProceduresWarnings: XmlValidationError[];
} {
  const warnings: XmlValidationError[] = [];
  const ca = plan.controlActivities;

  const regularCheckOfAdequacy = mapProcedureForm(
    ca?.procedureAnnexITableE1,
    'Management procedures / Regular check of adequacy',
    warnings,
  );
  const dataFlowActivities = mapProcedureForm(
    ca?.procedureAnnexITableE2,
    'Management procedures / Data flow activities',
    warnings,
  );
  const riskAssessmentProcedures = mapProcedureForm(
    ca?.procedureAnnexITableE3,
    'Management procedures / Risk assessment procedures',
    warnings,
  );

  warnings.push(
    warn(
      'Management procedures / Monitoring and reporting roles: not provided by the EU monitoring plan — please add these manually.',
    ),
  );

  return {
    managementProcedures: {
      monitoringReportingRoles: [],
      regularCheckOfAdequacy,
      dataFlowActivities,
      riskAssessmentProcedures,
    },
    managementProceduresWarnings: warnings,
  };
}
