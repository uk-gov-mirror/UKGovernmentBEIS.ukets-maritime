import { EmpMonitoringGreenhouseGas } from '@mrtm/api';

import { EuXmlMonitoringPlan } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { mapProcedureForm } from '@requests/common/eu-xml-import/mappers/procedure-form.mapper';
import { XmlValidationError } from '@shared/types';

export function mapGreenhouseGas(plan: EuXmlMonitoringPlan): {
  greenhouseGas: EmpMonitoringGreenhouseGas;
  greenhouseGasWarnings: XmlValidationError[];
} {
  const warnings: XmlValidationError[] = [];

  const fuel = mapProcedureForm(
    plan.fuelConsumption?.procedureAnnexITableC22,
    'Greenhouse gas monitoring / Fuel bunkered and in tanks',
    warnings,
  );
  const crossChecks = mapProcedureForm(
    plan.fuelConsumption?.procedureAnnexITableC23,
    'Greenhouse gas monitoring / Bunkering cross-checks',
    warnings,
  );
  const information = mapProcedureForm(
    plan.measuringEquipment?.procedureAnnexITableC25,
    'Greenhouse gas monitoring / Recording and storing measurement information',
    warnings,
  );
  const qaEquipment = mapProcedureForm(
    plan.measuringEquipment?.procedureAnnexITableC28,
    'Greenhouse gas monitoring / Quality assurance of measuring equipment',
    warnings,
  );
  const voyages = mapProcedureForm(
    plan.navigation?.procedureAnnexITableC3,
    'Greenhouse gas monitoring / List of voyages',
    warnings,
  );

  return {
    greenhouseGas: { fuel, crossChecks, information, qaEquipment, voyages },
    greenhouseGasWarnings: warnings,
  };
}
