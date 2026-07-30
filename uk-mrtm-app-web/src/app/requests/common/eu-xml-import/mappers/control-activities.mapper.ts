import { EmpControlActivities, EmpOutsourcedActivities } from '@mrtm/api';

import { EuXmlMonitoringPlan, EuXmlProcedure } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { mapProcedureForm } from '@requests/common/eu-xml-import/mappers/procedure-form.mapper';
import { XmlValidationError } from '@shared/types';

export function mapControlActivities(plan: EuXmlMonitoringPlan): {
  controlActivities: EmpControlActivities;
  controlWarnings: XmlValidationError[];
} {
  const warnings: XmlValidationError[] = [];
  const ca = plan.controlActivities;

  // E4 uses briefDescriptionOfProcedure instead of procedures
  const e4 = ca?.procedureAnnexITableE4;
  const e4Proc: EuXmlProcedure = e4
    ? { ...e4, procedures: e4.briefDescriptionOfProcedure || e4.procedures }
    : undefined;
  const qualityAssurance = mapProcedureForm(e4Proc, 'Control activities / Quality assurance', warnings);

  const internalReviews = mapProcedureForm(
    ca?.procedureAnnexITableE5,
    'Control activities / Internal reviews',
    warnings,
  );
  const corrections = mapProcedureForm(
    ca?.procedureAnnexITableE6,
    'Control activities / Corrections and corrective actions',
    warnings,
  );
  const documentation = mapProcedureForm(ca?.procedureAnnexITableE8, 'Control activities / Documentation', warnings);

  const e7 = ca?.procedureAnnexITableE7;
  const e7Procedures = (e7?.procedures ?? '').trim();
  const isOutsourced =
    !!e7 &&
    !['n/a', 'na', 'none', 'not applicable', '-'].includes(e7Procedures.toLowerCase()) &&
    (!!e7.responsiblePerson || !!e7.locationOfRecords || e7Procedures.length > 10);

  const outsourcedActivities: EmpOutsourcedActivities = isOutsourced
    ? { exist: true, details: mapProcedureForm(e7, 'Control activities / Outsourced activities', warnings) }
    : { exist: false };

  return {
    controlActivities: { qualityAssurance, internalReviews, corrections, outsourcedActivities, documentation },
    controlWarnings: warnings,
  };
}
