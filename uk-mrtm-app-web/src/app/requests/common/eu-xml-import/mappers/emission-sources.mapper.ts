import { EmpEmissionCompliance, EmpEmissionFactors, EmpEmissionSources } from '@mrtm/api';

import { EuXmlMonitoringPlan } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { mapProcedureForm } from '@requests/common/eu-xml-import/mappers/procedure-form.mapper';
import { XmlValidationError } from '@shared/types';

export function mapEmissionSources(plan: EuXmlMonitoringPlan): {
  emissionSources: EmpEmissionSources;
  procedureWarnings: XmlValidationError[];
} {
  const warnings: XmlValidationError[] = [];
  const b5 = plan.emissionSources?.procedureAnnexITableB5;
  const b8 = plan.fuelTypes?.procedureAnnexITableB8;

  const listCompletion = mapProcedureForm(b5, 'Emission sources (list completion procedure)', warnings);
  const emissionFactors: EmpEmissionFactors = b8
    ? { exist: false, factors: mapProcedureForm(b8, 'Emission sources (emission factors procedure)', warnings) }
    : { exist: true };
  const emissionCompliance: EmpEmissionCompliance = { exist: false };

  return { emissionSources: { listCompletion, emissionFactors, emissionCompliance }, procedureWarnings: warnings };
}
