import { Service } from '@angular/core';

import { EmpShipEmissions } from '@mrtm/api';

import { ShipsXmlService } from '@requests/common/components/emissions/upload-ships';
import { EmpShipsXML } from '@requests/common/emp/subtasks/emissions/interfaces';
import {
  CcsCcuDtoValidator,
  ConditionsOfExemptionDtoValidator,
  EmissionSourceEditDtoValidator,
  FuelTypeEmissionFactorEditDtoValidator,
  MeasuringEquipmentEditDtoValidator,
  MonitoringMethodEntryDtoValidator,
  ShipParticularsDtoValidator,
} from '@requests/common/emp/subtasks/emissions/validators';
import { XmlResult, XmlValidationError } from '@shared/types';
import { X2jOptions, XMLParser } from 'fast-xml-parser';

@Service()
export class EmpShipsXmlService implements ShipsXmlService {
  /**
   * Since there is no XSD schema validation, FastXMLParser declares objects to be always treated as an array.
   */
  private readonly arrayDefinitions = [
    'shipParticularsList.shipParticulars',
    'shipParticularsList.shipParticulars.ccsCcu.emissionSourceName',
    'shipParticularsList.shipParticulars.monitoringPlan.fuelTypes.fuelTypeEntry',
    'shipParticularsList.shipParticulars.monitoringPlan.fuelTypes.fuelTypeEntry.emissionFactors',
    'shipParticularsList.shipParticulars.monitoringPlan.emissionSources.emissionSourceEntry',
    'shipParticularsList.shipParticulars.monitoringPlan.emissionSources.emissionSourceEntry.monitoringMethodCode',
    'shipParticularsList.shipParticulars.monitoringPlan.emissionSources.emissionSourceEntry.fuelTypeCodes',
    'shipParticularsList.shipParticulars.monitoringPlan.monitoringMethods.monitoringMethodEntry',
    'shipParticularsList.shipParticulars.measuringEquipment.measuringEquipmentEntry',
    'shipParticularsList.shipParticulars.measuringEquipment.measuringEquipmentEntry.appliedToCode',
  ];

  private readonly options: X2jOptions = {
    ignoreAttributes: false,
    numberParseOptions: { hex: true, leadingZeros: false, eNotation: true },
    isArray: (_name, jPath) => this.arrayDefinitions.indexOf(<string>jPath) !== -1,
  };

  /**
   * Parses an XML as text and returns EmpShipsXMLResultDto, which includes any validation errors and the actual data
   */
  parse(xmlText: string): XmlResult<EmpShipEmissions[]> {
    const shipsXML: EmpShipsXML = new XMLParser(this.options).parse(xmlText) as EmpShipsXML;
    return this.transformShipsXMLToShipEmissions(shipsXML);
  }

  /**
   * Validates ShipsXML and returns EmpShipsXMLResultDto, containing both EmpShipEmission[] and XmlValidationError[]
   */
  private transformShipsXMLToShipEmissions(empShipsXML: EmpShipsXML): XmlResult<EmpShipEmissions[]> {
    const empShipEmissions: EmpShipEmissions[] = [];
    let errors: XmlValidationError[] = [];

    if (empShipsXML?.shipParticularsList?.shipParticulars?.length > 0) {
      const shipParticulars = empShipsXML.shipParticularsList.shipParticulars;
      const maxAllowedShipsErrors = ShipParticularsDtoValidator.validateMaxAllowedShips(shipParticulars);
      const shipParticularCoreErrors = ShipParticularsDtoValidator.validateCoreShipParticularsDTO(shipParticulars);

      if (maxAllowedShipsErrors?.length) {
        errors = maxAllowedShipsErrors;
      } else if (shipParticularCoreErrors?.length) {
        errors = shipParticularCoreErrors;
      } else {
        shipParticulars?.forEach((shipParticular) => {
          const shipDetailsResult = ShipParticularsDtoValidator.validateShipParticularsDTO(shipParticular);
          const fuelsAndEmissionsFactorsResult =
            FuelTypeEmissionFactorEditDtoValidator.validateFuelTypeEmissionFactorEditDTOs(shipParticular);
          const emissionsSourcesResult = EmissionSourceEditDtoValidator.validateEmissionSourceEditDTOs(
            shipParticular,
            fuelsAndEmissionsFactorsResult?.data,
          );
          const uncertaintyLevelResult = MonitoringMethodEntryDtoValidator.validateMonitoringMethodEntryDTOs(
            shipParticular,
            emissionsSourcesResult?.data,
          );
          const measurementsResult = MeasuringEquipmentEditDtoValidator.validateMeasuringEquipmentEditDTOs(
            shipParticular,
            emissionsSourcesResult?.data,
          );
          const exemptionConditionsResult =
            ConditionsOfExemptionDtoValidator.validateConditionsOfExemptionDTO(shipParticular);
          const carbonCaptureResult = CcsCcuDtoValidator.validateCcsCcuDTO(
            shipParticular,
            emissionsSourcesResult?.data,
          );

          if (
            shipDetailsResult?.errors ||
            fuelsAndEmissionsFactorsResult?.errors ||
            emissionsSourcesResult?.errors ||
            uncertaintyLevelResult?.errors ||
            measurementsResult?.errors ||
            exemptionConditionsResult?.errors ||
            carbonCaptureResult?.errors
          ) {
            errors.push(
              ...(shipDetailsResult?.errors ?? []),
              ...(fuelsAndEmissionsFactorsResult?.errors ?? []),
              ...(emissionsSourcesResult?.errors ?? []),
              ...(uncertaintyLevelResult?.errors ?? []),
              ...(measurementsResult?.errors ?? []),
              ...(exemptionConditionsResult?.errors ?? []),
              ...(carbonCaptureResult?.errors ?? []),
            );
          } else {
            empShipEmissions.push({
              uniqueIdentifier: crypto.randomUUID(),
              details: shipDetailsResult.data,
              fuelsAndEmissionsFactors: fuelsAndEmissionsFactorsResult.data,
              emissionsSources: emissionsSourcesResult.data,
              uncertaintyLevel: uncertaintyLevelResult.data,
              measurements: measurementsResult.data,
              exemptionConditions: exemptionConditionsResult.data,
              carbonCapture: carbonCaptureResult.data,
            });
          }
        });
      }
    }

    if (!empShipEmissions?.length && !errors?.length) {
      errors = [
        { row: null, column: null, message: 'The header names must be the same as the ones included in the template' },
      ];
    }

    return {
      data: !errors?.length ? empShipEmissions : [],
      errors: errors,
    };
  }
}
