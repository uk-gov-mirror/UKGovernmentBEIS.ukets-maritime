import { Service } from '@angular/core';

import { EmpShipEmissions } from '@mrtm/api';

import { EuXmlImportResult, EuXmlMonitoringPlan, EuXmlRoot } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { mapAbbreviations } from '@requests/common/eu-xml-import/mappers/abbreviations.mapper';
import { mapControlActivities } from '@requests/common/eu-xml-import/mappers/control-activities.mapper';
import { mapDataGaps } from '@requests/common/eu-xml-import/mappers/data-gaps.mapper';
import { mapEmissionSources } from '@requests/common/eu-xml-import/mappers/emission-sources.mapper';
import { mapGreenhouseGas } from '@requests/common/eu-xml-import/mappers/greenhouse-gas.mapper';
import { mapManagementProcedures } from '@requests/common/eu-xml-import/mappers/management-procedures.mapper';
import { mapMandate } from '@requests/common/eu-xml-import/mappers/mandate.mapper';
import { warn } from '@requests/common/eu-xml-import/mappers/mapper.helpers';
import { mapShipEmissions } from '@requests/common/eu-xml-import/mappers/ships.mapper';
import { XmlValidationError } from '@shared/types';
import { X2jOptions, XMLParser } from 'fast-xml-parser';

@Service()
export class EuXmlImportService {
  private readonly arrayPaths = [
    'monitoringPlans.monitoringPlan',
    'monitoringPlans.monitoringPlan.company.nature',
    'monitoringPlans.monitoringPlan.measuringEquipment.measuringEquipmentEntry',
    'monitoringPlans.monitoringPlan.measuringEquipment.measuringEquipmentEntry.appliedToCode',
    'monitoringPlans.monitoringPlan.emissionSources.emissionSourceEntry',
    'monitoringPlans.monitoringPlan.emissionSources.emissionSourceEntry.fuelTypeCode',
    'monitoringPlans.monitoringPlan.emissionSources.emissionSourceEntry.monitoringMethodCode',
    'monitoringPlans.monitoringPlan.fuelTypes.fuelTypeEntry',
    'monitoringPlans.monitoringPlan.fuelTypes.fuelTypeEntry.emissionFactors',
    'monitoringPlans.monitoringPlan.fuelTypes.fuelTypeEntry.methodDensityBunkerCode',
    'monitoringPlans.monitoringPlan.ccsCcuRecords.ccsCcuEntry',
    'monitoringPlans.monitoringPlan.furtherInformation.furtherInformationEntry',
  ];

  private readonly options: X2jOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    numberParseOptions: { hex: false, leadingZeros: false, eNotation: true },
    isArray: (_name, jPath) => this.arrayPaths.includes(jPath as string),
  };

  parse(xmlText: string, accountImoNumber?: string): EuXmlImportResult {
    let root: EuXmlRoot;
    try {
      root = new XMLParser(this.options).parse(xmlText) as EuXmlRoot;
    } catch {
      return { errors: [warn('The selected file could not be uploaded – check the file and try again')] };
    }

    const rawPlans = root?.monitoringPlans?.monitoringPlan;
    const plans: EuXmlMonitoringPlan[] = Array.isArray(rawPlans) ? rawPlans : rawPlans ? [rawPlans] : [];

    if (!plans.length) {
      return { errors: [warn('No monitoring plan found in the file.')] };
    }

    if (plans.length > 1) {
      return { errors: [warn('The maximum number of ships allowed is 1')] };
    }

    const shipImoNumber = String(plans[0]['@_shipImoNumber'] ?? '');
    if (!/^\d{7}$/.test(shipImoNumber)) {
      return { errors: [warn('The IMO Number must be 7 digits and is required')] };
    }

    const warnings: XmlValidationError[] = [];
    const firstPlan = plans[0];
    const shipName = firstPlan.ship?.name ?? `IMO ${shipImoNumber}`;

    const { ship, shipWarnings } = mapShipEmissions(firstPlan, shipName);
    warnings.push(...shipWarnings);
    const shipEmissions: EmpShipEmissions[] = [ship];

    const { emissionSources, procedureWarnings } = mapEmissionSources(firstPlan);
    warnings.push(...procedureWarnings);

    const { controlActivities, controlWarnings } = mapControlActivities(firstPlan);
    warnings.push(...controlWarnings);

    const { abbreviations, abbrevWarnings } = mapAbbreviations(firstPlan);
    warnings.push(...abbrevWarnings);

    const { managementProcedures, managementProceduresWarnings } = mapManagementProcedures(firstPlan);
    warnings.push(...managementProceduresWarnings);

    const { dataGaps, dataGapsWarnings } = mapDataGaps(firstPlan);
    warnings.push(...dataGapsWarnings);

    const { greenhouseGas, greenhouseGasWarnings } = mapGreenhouseGas(firstPlan);
    warnings.push(...greenhouseGasWarnings);

    const { mandate, mandateWarnings } = mapMandate(plans, accountImoNumber);
    warnings.push(...mandateWarnings);

    return {
      data: {
        shipEmissions,
        emissionSources,
        controlActivities,
        abbreviations,
        managementProcedures,
        dataGaps,
        greenhouseGas,
        mandate,
      },
      warnings: warnings.length ? warnings : undefined,
    };
  }
}
