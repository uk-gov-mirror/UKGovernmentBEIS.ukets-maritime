import {
  EmpAbbreviations,
  EmpControlActivities,
  EmpDataGaps,
  EmpEmissionSources,
  EmpManagementProcedures,
  EmpMandate,
  EmpMonitoringGreenhouseGas,
  EmpOperatorDetails,
  EmpShipEmissions,
} from '@mrtm/api';

import { XmlValidationError } from '@shared/types';

export interface EuXmlProcedure {
  titleOfProcedure?: string;
  referenceExistingProcedure?: string;
  referenceForProcedure?: string;
  versionExistingProcedure?: string;
  procedures?: string;
  briefDescriptionOfProcedure?: string;
  responsiblePerson?: string;
  locationOfRecords?: string;
  itSystem?: string;
  existingManagementSystems?: string;
  formulaeAndDataSources?: string;
  formulaeUsed?: string;
  methodFuelConsumption?: string;
  dataSources?: string;
  backupMonitoringMethodCode?: string;
}

export interface EuXmlEmissionFactor {
  ghgCode?: string;
  ttwEF?: number;
  slipEF?: number;
}

export interface EuXmlEmissionSourceEntry {
  emissionSourceTypeCode?: string;
  name?: string;
  identificationNumber?: string | number;
  ratingPower?: number;
  specFuelOilCons?: number;
  yearOfInstallation?: number;
  fuelTypeCode?: string[];
  measuringEquipmentName?: string | string[];
  monitoringMethodCode?: string[];
  levelOfUncertaintyTypeCode?: string;
  shipSpecificUncertainty?: number;
  emissionSourceClassCode?: string;
  otherFuelType?: string | string[];
}

export interface EuXmlFuelTypeEntry {
  fuelTypeCode?: string;
  fuelOriginCode?: string;
  otherFuelType?: string;
  legalFrameworkCode?: string;
  emissionFactors?: EuXmlEmissionFactor[];
  methodDensityBunkerCode?: string | string[];
}

export interface EuXmlMeasuringEquipmentEntry {
  name?: string;
  appliedToCode?: string | string[];
  technicalDescription?: string;
}

export interface EuXmlFurtherInformationEntry {
  abbreviation?: string;
  explanation?: string;
}

export interface EuXmlShip {
  name?: string;
  shipType?: string;
  grossTonnage?: number;
  deadweight?: number;
  flag?: string;
  portOfRegistry?: string;
  classificationSociety?: string;
  iceClassPolarCode?: string;
  technicalEfficiencyCode?: string;
  technicalEfficiencyValue?: number;
  ownerNumber?: string | number;
  ownerName?: string;
  ownerAddress?: string;
  ownerCity?: string;
  ownerCountry?: string;
  ownerContactPerson?: string;
  ownerEmail?: string;
}

export interface EuXmlCompany {
  number?: string;
  name?: string;
  nature?: string | string[];
  address?: string;
  city?: string;
  countryCode?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
}

export interface EuXmlCcsCcuEntry {
  emissionSourceName?: string;
  technology?: string;
  supportingEvidence?: string;
}

export interface EuXmlMonitoringPlan {
  '@_shipImoNumber'?: string | number;
  ship?: EuXmlShip;
  company?: EuXmlCompany;
  measuringEquipment?: {
    measuringEquipmentEntry?: EuXmlMeasuringEquipmentEntry[];
    procedureAnnexITableC25?: EuXmlProcedure;
    procedureAnnexITableC28?: EuXmlProcedure;
  };
  emissionSources?: {
    emissionSourceEntry?: EuXmlEmissionSourceEntry[];
    procedureAnnexITableB5?: EuXmlProcedure;
  };
  fuelTanks?: unknown;
  fuelTypes?: {
    fuelTypeEntry?: EuXmlFuelTypeEntry[];
    procedureAnnexITableB8?: EuXmlProcedure;
    procedureAnnexIITableB9?: EuXmlProcedure;
  };
  fuelConsumption?: {
    procedureAnnexITableC22?: EuXmlProcedure;
    procedureAnnexITableC23?: EuXmlProcedure;
    procedureAnnexITableD1?: EuXmlProcedure;
  };
  ccsCcuRecords?: {
    ccsCcuEntry?: EuXmlCcsCcuEntry[];
  };
  navigation?: {
    procedureAnnexITableC1?: {
      minimumNumberOfVoyages?: string | number;
      useOfDerogationCode?: string;
    };
    procedureAnnexITableC3?: EuXmlProcedure;
  };
  controlActivities?: {
    procedureAnnexITableE1?: EuXmlProcedure;
    procedureAnnexITableE2?: EuXmlProcedure;
    procedureAnnexITableE3?: EuXmlProcedure;
    procedureAnnexITableE4?: EuXmlProcedure;
    procedureAnnexITableE5?: EuXmlProcedure;
    procedureAnnexITableE6?: EuXmlProcedure;
    procedureAnnexITableE7?: EuXmlProcedure;
    procedureAnnexITableE8?: EuXmlProcedure;
  };
  furtherInformation?: {
    additionalInformation?: string;
    furtherInformationEntry?: EuXmlFurtherInformationEntry[];
  };
}

export interface EuXmlRoot {
  monitoringPlans?: {
    monitoringPlan?: EuXmlMonitoringPlan | EuXmlMonitoringPlan[];
  };
}

export interface EuXmlImportData {
  shipEmissions: EmpShipEmissions[];
  emissionSources: EmpEmissionSources;
  controlActivities: EmpControlActivities;
  abbreviations: EmpAbbreviations;
  operatorDetails: Partial<EmpOperatorDetails>;
  managementProcedures: EmpManagementProcedures;
  dataGaps: EmpDataGaps;
  greenhouseGas: EmpMonitoringGreenhouseGas;
  mandate: EmpMandate;
}

export interface EuXmlImportResult {
  data?: EuXmlImportData;
  errors?: XmlValidationError[];
  warnings?: XmlValidationError[];
}
