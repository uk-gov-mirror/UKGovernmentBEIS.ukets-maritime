import { Service } from '@angular/core';

import { AerShipEmissions } from '@mrtm/api';

import { AerShipsXML } from '@requests/common/aer/subtasks/aer-emissions/interfaces';
import {
  AerAdditionalInformationDtoValidator,
  AerEmissionReportDetailsDtoValidator,
  AerEmissionSourceEditDtoValidator,
  AerFuelTypeEmissionFactorEditDtoValidator,
  AerMonitoringMethodEntryDtoValidator,
} from '@requests/common/aer/subtasks/aer-emissions/validators';
import { ShipsXmlService } from '@requests/common/components/emissions/upload-ships';
import { XmlResult, XmlValidationError } from '@shared/types';
import { X2jOptions, XMLParser } from 'fast-xml-parser';

@Service()
export class AerShipsXmlService implements ShipsXmlService {
  /**
   * Since there is no XSD schema validation, FastXMLParser declares objects to be always treated as array.
   */
  private readonly arrayDefinitions = [
    'emissionReportsList.emissionReport',
    'emissionReportsList.emissionReport.fuelTypes.fuelTypeEntry',
    'emissionReportsList.emissionReport.fuelTypes.fuelTypeEntry.emissionFactors',
    'emissionReportsList.emissionReport.emissionSources.emissionSourceEntry',
    'emissionReportsList.emissionReport.emissionSources.emissionSourceEntry.monitoringMethodCode',
    'emissionReportsList.emissionReport.emissionSources.emissionSourceEntry.fuelTypeCodes',
    'emissionReportsList.emissionReport.monitoringMethods.monitoringMethodEntry',
  ];

  private readonly options: X2jOptions = {
    ignoreAttributes: false,
    numberParseOptions: { hex: true, leadingZeros: false, eNotation: true },
    isArray: (_name, jPath) => this.arrayDefinitions.indexOf(<string>jPath) !== -1,
  };

  /**
   * Parses an XML as text and returns AerShipsXMLResultDto which includes any validation errors and the actual data
   */
  parse(xmlText: string, reportingYear: string): XmlResult<AerShipEmissions[]> {
    const shipsXML: AerShipsXML = new XMLParser(this.options).parse(xmlText) as AerShipsXML;
    return this.transformShipsXMLToShipEmissions(shipsXML, reportingYear);
  }

  /**
   * Validates ShipsXML and returns AerShipsXMLResultDto, containing both AerShipEmissions[] and XmlValidationError[]
   */
  private transformShipsXMLToShipEmissions(
    shipsXML: AerShipsXML,
    reportingYear: string,
  ): XmlResult<AerShipEmissions[]> {
    const aerShipEmissions: AerShipEmissions[] = [];
    let errors: XmlValidationError[] = [];

    if (shipsXML?.emissionReportsList?.emissionReport?.length > 0) {
      const emissionReports = shipsXML.emissionReportsList.emissionReport;
      const maxAllowedShipsErrors = AerEmissionReportDetailsDtoValidator.validateMaxAllowedShips(emissionReports);
      const emissionReportDetailsCoreErrors =
        AerEmissionReportDetailsDtoValidator.validateCoreEmissionReportDetailsDTOs(emissionReports);

      if (maxAllowedShipsErrors?.length) {
        errors = maxAllowedShipsErrors;
      } else if (emissionReportDetailsCoreErrors?.length) {
        errors = emissionReportDetailsCoreErrors;
      } else {
        emissionReports?.forEach((emissionReport) => {
          const emissionReportDetailsResult = AerEmissionReportDetailsDtoValidator.validateEmissionReportDetailsDTO(
            reportingYear,
            emissionReport,
          );
          const fuelsAndEmissionsFactorsResult =
            AerFuelTypeEmissionFactorEditDtoValidator.validateFuelTypeEmissionFactorEditDTOs(emissionReport);
          const emissionsSourcesResult = AerEmissionSourceEditDtoValidator.validateEmissionSourceEditDTOs(
            emissionReport,
            fuelsAndEmissionsFactorsResult?.data,
          );
          const uncertaintyLevelResult = AerMonitoringMethodEntryDtoValidator.validateMonitoringMethodEntryDTOs(
            emissionReport,
            emissionsSourcesResult?.data,
          );
          const derogationsResult =
            AerAdditionalInformationDtoValidator.validateAdditionalInformationDTO(emissionReport);

          if (
            emissionReportDetailsResult?.errors ||
            fuelsAndEmissionsFactorsResult?.errors ||
            emissionsSourcesResult?.errors ||
            uncertaintyLevelResult?.errors ||
            derogationsResult?.errors
          ) {
            errors.push(
              ...(emissionReportDetailsResult?.errors ?? []),
              ...(fuelsAndEmissionsFactorsResult?.errors ?? []),
              ...(emissionsSourcesResult?.errors ?? []),
              ...(uncertaintyLevelResult?.errors ?? []),
              ...(derogationsResult?.errors ?? []),
            );
          } else {
            aerShipEmissions.push({
              uniqueIdentifier: crypto.randomUUID(),
              details: emissionReportDetailsResult.data,
              fuelsAndEmissionsFactors: fuelsAndEmissionsFactorsResult.data,
              emissionsSources: emissionsSourcesResult.data,
              uncertaintyLevel: uncertaintyLevelResult.data,
              derogations: derogationsResult.data,
              dataInputType: 'MANUAL',
            });
          }
        });
      }
    }

    if (!aerShipEmissions?.length && !errors?.length) {
      errors.push({
        row: null,
        column: null,
        message: 'The header names must be the same as the ones included in the template',
      });
    }

    return {
      data: !errors?.length ? aerShipEmissions : [],
      errors: errors,
    };
  }
}
