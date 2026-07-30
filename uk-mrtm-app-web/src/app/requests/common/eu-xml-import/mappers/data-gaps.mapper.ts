import { EmpDataGaps } from '@mrtm/api';

import {
  PROC_DESCRIPTION_MAX,
  PROC_IT_MAX,
  PROC_LOCATION_MAX,
  PROC_RESPONSIBLE_MAX,
} from '@requests/common/eu-xml-import/eu-xml-import.constants';
import { EuXmlMonitoringPlan } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { warn } from '@requests/common/eu-xml-import/mappers/mapper.helpers';
import { XmlValidationError } from '@shared/types';

export function mapDataGaps(plan: EuXmlMonitoringPlan): {
  dataGaps: EmpDataGaps;
  dataGapsWarnings: XmlValidationError[];
} {
  const warnings: XmlValidationError[] = [];
  const ctx = 'Data gaps (Annex I, Table D1)';
  const d1 = plan.fuelConsumption?.procedureAnnexITableD1;

  const fuelConsumptionEstimationMethod =
    d1?.methodFuelConsumption?.length > PROC_DESCRIPTION_MAX ? undefined : d1?.methodFuelConsumption;
  if (!fuelConsumptionEstimationMethod) {
    warnings.push(warn(`${ctx}: method to estimate fuel consumption is missing and will need to be entered manually.`));
  }

  const responsiblePersonOrPosition =
    d1?.responsiblePerson?.length > PROC_RESPONSIBLE_MAX ? undefined : d1?.responsiblePerson;
  if (!responsiblePersonOrPosition) {
    warnings.push(warn(`${ctx}: responsible person or position is missing and will need to be entered manually.`));
  }

  const dataSources = d1?.dataSources?.length > PROC_DESCRIPTION_MAX ? undefined : d1?.dataSources;
  if (!dataSources) {
    warnings.push(warn(`${ctx}: data sources are missing and will need to be entered manually.`));
  }

  const recordsLocation = d1?.locationOfRecords?.length > PROC_LOCATION_MAX ? undefined : d1?.locationOfRecords;
  if (!recordsLocation) {
    warnings.push(warn(`${ctx}: location of records is missing and will need to be entered manually.`));
  }

  return {
    dataGaps: {
      formulaeUsed: d1?.formulaeUsed?.length > PROC_DESCRIPTION_MAX ? undefined : d1?.formulaeUsed,
      fuelConsumptionEstimationMethod,
      responsiblePersonOrPosition,
      dataSources,
      recordsLocation,
      itSystemUsed: d1?.itSystem?.length > PROC_IT_MAX ? undefined : d1?.itSystem || '',
    },
    dataGapsWarnings: warnings,
  };
}
