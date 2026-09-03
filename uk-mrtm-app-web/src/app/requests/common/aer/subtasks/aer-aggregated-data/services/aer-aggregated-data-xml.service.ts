import { inject, Service } from '@angular/core';

import { AerShipAggregatedDataSave } from '@mrtm/api';

import { RequestTaskStore } from '@netz/common/store';

import {
  AerAggregatedDataXML,
  AerAggregatedDataXmlResultDto,
} from '@requests/common/aer/subtasks/aer-aggregated-data/interfaces';
import { EmissionDetailsDtoValidator } from '@requests/common/aer/subtasks/aer-aggregated-data/validators';
import { XmlValidationError } from '@shared/types';
import { X2jOptions, XMLParser } from 'fast-xml-parser';

@Service()
export class AerAggregatedDataXmlService {
  private readonly store = inject(RequestTaskStore);
  /**
   * Since there is no XSD schema validation, FastXMLParser declares objects to be always treated as an array.
   */
  private readonly arrayDefinitions = ['emissions.shipEmissions', 'emissions.shipEmissions.annualEmission.emissions'];
  private readonly options: X2jOptions = {
    ignoreAttributes: false,
    numberParseOptions: { hex: true, leadingZeros: false, eNotation: true },
    isArray: (_name, jPath) => this.arrayDefinitions.indexOf(<string>jPath) !== -1,
    attributeNamePrefix: '',
  };

  /**
   * Parses an XML as text and returns AerAggregatedDataXmlResultDto, which includes any validation errors and the actual data
   */
  parse(xmlText: string): AerAggregatedDataXmlResultDto {
    const dataXML: AerAggregatedDataXML = new XMLParser(this.options).parse(xmlText) as AerAggregatedDataXML;
    return this.transformAggregatedDataXMLToAerShipAggregatedDataSave(dataXML);
  }

  /**
   * Validates ShipsXML and returns AerAggregatedDataXmlResultDto, containing both AerShipAggregatedDataSave[] and XmlValidationError[]
   */
  private transformAggregatedDataXMLToAerShipAggregatedDataSave(
    dataXML: AerAggregatedDataXML,
  ): AerAggregatedDataXmlResultDto {
    const aerShipAggregatedDataSaves: AerShipAggregatedDataSave[] = [];
    let errors: XmlValidationError[] = [];

    if (dataXML?.emissions?.shipEmissions?.length > 0) {
      const emissionDetailsDTOS = dataXML.emissions.shipEmissions;
      const maxAllowedShipEmissions = EmissionDetailsDtoValidator.maxAllowedShipEmissionError(emissionDetailsDTOS);

      if (maxAllowedShipEmissions?.length) {
        errors = maxAllowedShipEmissions;
      } else {
        for (const [index, emissionDetails] of emissionDetailsDTOS.entries()) {
          const emissionReportDetailsDTOPartiallyErrors = EmissionDetailsDtoValidator.shipImoNumberDTOPartialError(
            index,
            aerShipAggregatedDataSaves,
            emissionDetails,
          );
          if (emissionReportDetailsDTOPartiallyErrors?.length === 0) {
            const aggregateSave = EmissionDetailsDtoValidator.transformEmissionDetailsDTO(this.store, emissionDetails);
            if (aggregateSave) {
              aerShipAggregatedDataSaves.push(aggregateSave);
            } else {
              errors.push({
                row: index + 1,
                column: 'NO_FIELD',
                message: 'The required fields are out of the expected criteria',
              });
            }
          } else {
            errors.push(...emissionReportDetailsDTOPartiallyErrors);
          }
        }
      }
    }

    if (!aerShipAggregatedDataSaves?.length && !errors?.length) {
      errors.push({ row: null, column: null, message: 'The required fields are out of the expected criteria' });
    }

    return {
      data: aerShipAggregatedDataSaves,
      errors: errors,
    };
  }
}
