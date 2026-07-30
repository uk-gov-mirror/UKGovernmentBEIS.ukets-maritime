import {
  EmpCarbonCapture,
  EmpEmissionsSources,
  EmpFuelsAndEmissionsFactors,
  EmpShipEmissions,
  ExemptionConditions,
  FuelOriginTypeName,
  MeasurementDescription,
  ShipDetails,
  UncertaintyLevel,
} from '@mrtm/api';

import {
  CARBON_CAPTURE_DESC_MAX,
  MEASUREMENT_DESC_MAX,
  MEASUREMENT_NAME_MAX,
  SHIP_NAME_MAX,
  SOURCE_NAME_MAX,
  SOURCE_REF_MAX,
  VALID_BUNKER_METHODS,
  VALID_FLAGS,
  VALID_ICE_CLASSES,
  VALID_MONITORING_METHODS,
  VALID_SHIP_TYPES,
  VALID_SOURCE_CLASSES,
  VALID_SOURCE_TYPES,
} from '@requests/common/eu-xml-import/eu-xml-import.constants';
import {
  EuXmlEmissionSourceEntry,
  EuXmlFuelTypeEntry,
  EuXmlMeasuringEquipmentEntry,
  EuXmlMonitoringPlan,
} from '@requests/common/eu-xml-import/eu-xml-import.types';
import { clampEF, classifyFuel, warn } from '@requests/common/eu-xml-import/mappers/mapper.helpers';
import { XmlValidationError } from '@shared/types';
import { isNil } from '@shared/utils';

export function mapShipEmissions(
  plan: EuXmlMonitoringPlan,
  shipName: string,
): { ship: EmpShipEmissions; shipWarnings: XmlValidationError[] } {
  const warnings: XmlValidationError[] = [];

  const fuelFactorsByCode = buildFuelFactorMap(plan.fuelTypes?.fuelTypeEntry ?? [], shipName, warnings);
  const fuelsAndEmissionsFactors = Array.from(fuelFactorsByCode.values());

  const emissionsSources = mapEmissionSourcesList(
    plan.emissionSources?.emissionSourceEntry ?? [],
    fuelFactorsByCode,
    shipName,
    warnings,
  );

  const measurements = mapMeasurements(
    plan.measuringEquipment?.measuringEquipmentEntry ?? [],
    plan.emissionSources?.emissionSourceEntry ?? [],
    shipName,
    warnings,
  );

  const uncertaintyLevel = mapUncertainty(plan.emissionSources?.emissionSourceEntry ?? []);
  const details = mapShipDetails(plan, shipName, warnings);
  const carbonCapture = mapCarbonCapture(plan, shipName, warnings);
  const exemptionConditions = mapExemptionConditions(plan, shipName, warnings);

  return {
    ship: {
      uniqueIdentifier: crypto.randomUUID(),
      details,
      emissionsSources,
      fuelsAndEmissionsFactors,
      measurements,
      uncertaintyLevel,
      carbonCapture,
      exemptionConditions,
    },
    shipWarnings: warnings,
  };
}

function mapShipDetails(plan: EuXmlMonitoringPlan, shipName: string, warnings: XmlValidationError[]): ShipDetails {
  const ship = plan.ship ?? {};
  const imoNumber = String(plan['@_shipImoNumber'] ?? '');
  const ctx = `Ship "${shipName}"`;

  const name = ship.name?.length > SHIP_NAME_MAX ? undefined : ship.name;

  const rawType = ship.shipType?.toUpperCase() ?? '';
  const type: ShipDetails['type'] = VALID_SHIP_TYPES.has(rawType) ? (rawType as ShipDetails['type']) : undefined;
  if (!type) {
    warnings.push(warn(`${ctx}: ship type is missing or not recognised and will need to be entered manually.`));
  }

  let grossTonnage = ship.grossTonnage ?? 0;
  if (grossTonnage && !Number.isInteger(grossTonnage)) {
    warnings.push(
      warn(`${ctx}: gross tonnage must be an integer (${grossTonnage} → rounded to ${Math.round(grossTonnage)}).`),
    );
    grossTonnage = Math.round(grossTonnage);
  }
  if (grossTonnage < 5000) {
    warnings.push(warn(`${ctx}: gross tonnage ${grossTonnage} is less than the minimum of 5000t.`));
  }
  if (grossTonnage > 999999999) {
    warnings.push(warn(`${ctx}: gross tonnage ${grossTonnage} exceeds the maximum of 999,999,999t.`));
  }

  const rawFlag = ship.flag?.toUpperCase() ?? '';
  const flagState: ShipDetails['flagState'] = VALID_FLAGS.has(rawFlag)
    ? (rawFlag as ShipDetails['flagState'])
    : undefined;
  if (!flagState) {
    warnings.push(warn(`${ctx}: flag state is missing or not recognised and will need to be entered manually.`));
  }

  const rawIce = ship.iceClassPolarCode?.toUpperCase().replace(' ', '_') ?? '';
  const iceClass: ShipDetails['iceClass'] = VALID_ICE_CLASSES.has(rawIce)
    ? (rawIce as ShipDetails['iceClass'])
    : undefined;
  if (!iceClass) {
    warnings.push(warn(`${ctx}: ice class is missing or not recognised and will need to be entered manually.`));
  }

  const natureOfReportingResponsibility = isIsmNature(plan.company?.nature)
    ? 'ISM_COMPANY'
    : plan?.company?.nature === 'SHIPOWNER'
      ? 'SHIPOWNER'
      : undefined;

  return {
    imoNumber,
    name,
    type,
    grossTonnage: grossTonnage < 5000 || grossTonnage > 999999999 ? undefined : grossTonnage,
    flagState,
    iceClass,
    natureOfReportingResponsibility,
  };
}

export function isIsmNature(nature: string | string[] | undefined): boolean {
  const values = Array.isArray(nature) ? nature : [nature];
  return values.some((v) => ['ISM', 'ISM_COMPANY'].includes(v?.toUpperCase()));
}

const CARBON_DIOXIDE_PATTERN = /^\d{1,12}(\.\d+)?$/;

function isValidCarbonDioxide(value: number | undefined): boolean {
  return Number.isFinite(value) && value >= 0 && CARBON_DIOXIDE_PATTERN.test(String(value));
}

function buildFuelFactorMap(
  entries: EuXmlFuelTypeEntry[],
  shipName: string,
  warnings: XmlValidationError[],
): Map<string, EmpFuelsAndEmissionsFactors & { type: string }> {
  const map = new Map<string, EmpFuelsAndEmissionsFactors & { type: string }>();

  for (const entry of entries) {
    const code = entry.fuelTypeCode ?? '';
    const existingOtherFuelNames = Array.from(map.values()).map((f) => ({ origin: f.origin, name: f.name }));
    const fuelOrigin = classifyFuel(code, entry.fuelOriginCode, entry.otherFuelType, existingOtherFuelNames);
    if (!code || map.has(code) || !fuelOrigin) continue;

    const ctx = `Ship "${shipName}" / Fuel "${code}"`;
    const factors = Array.isArray(entry.emissionFactors) ? entry.emissionFactors : [];
    const co2 = factors.find((f) => f.ghgCode === 'CO2');
    const ch4 = factors.find((f) => f.ghgCode === 'CH4');
    const n2o = factors.find((f) => f.ghgCode === 'N2O');

    const rawCo2 = co2?.ttwEF;
    const co2Val = isValidCarbonDioxide(rawCo2) ? rawCo2 : undefined;
    if (!isValidCarbonDioxide(rawCo2)) {
      warnings.push(
        warn(
          `${ctx}: CO₂ emission factor must be a number 0 or more, with up to 12 integer digits, and will need to be entered manually.`,
        ),
      );
      continue;
    }
    const ch4Val = clampEF(ch4?.ttwEF ?? 0, `${ctx}: CH₄`, warnings);
    const n2oVal = clampEF(n2o?.ttwEF ?? 0, `${ctx}: N₂O`, warnings);

    const bunkerCode = Array.isArray(entry.methodDensityBunkerCode)
      ? entry.methodDensityBunkerCode.find(Boolean)
      : entry.methodDensityBunkerCode;
    const rawBunker = bunkerCode?.toUpperCase() ?? '';
    const densityMethodBunker: EmpFuelsAndEmissionsFactors['densityMethodBunker'] = VALID_BUNKER_METHODS.has(rawBunker)
      ? (rawBunker as EmpFuelsAndEmissionsFactors['densityMethodBunker'])
      : undefined;

    const { origin, type, name } = fuelOrigin;

    map.set(code, {
      uniqueIdentifier: crypto.randomUUID(),
      origin,
      type,
      ...(name ? { name } : {}),
      carbonDioxide: co2Val !== undefined ? String(co2Val) : undefined,
      methane: ch4Val !== undefined ? String(ch4Val) : undefined,
      nitrousOxide: n2oVal !== undefined ? String(n2oVal) : undefined,
      densityMethodBunker,
      densityMethodTank: undefined,
    } as EmpFuelsAndEmissionsFactors & { type: string });
  }

  return map;
}

function mapEmissionSourcesList(
  entries: EuXmlEmissionSourceEntry[],
  fuelFactorsByCode: Map<string, EmpFuelsAndEmissionsFactors & { type: string }>,
  shipName: string,
  warnings: XmlValidationError[],
): EmpEmissionsSources[] {
  const seenNames = new Set<string>();

  return entries.map((entry, i) => {
    const rawName = entry.name ?? '';
    const ctx = `Ship "${shipName}" / Source "${rawName || `#${i + 1}`}"`;

    let name = rawName?.length > SOURCE_NAME_MAX ? undefined : rawName;
    if (!name) {
      warnings.push(warn(`${ctx}: emission source name is missing and will need to be entered manually.`));
    } else if (seenNames.has(name.toLowerCase())) {
      name = undefined;
      warnings.push(warn(`${ctx}: duplicate emission source name within the ship.`));
    } else {
      seenNames.add(name.toLowerCase());
    }

    const rawType = entry.emissionSourceTypeCode?.toUpperCase() ?? '';
    const type: EmpEmissionsSources['type'] = VALID_SOURCE_TYPES.has(rawType)
      ? (rawType as EmpEmissionsSources['type'])
      : undefined;
    if (!type) {
      warnings.push(
        warn(`${ctx}: emission source type is missing or not recognised and will need to be set manually.`),
      );
    }

    const rawClass = entry.emissionSourceClassCode?.toUpperCase() ?? '';
    const sourceClass: EmpEmissionsSources['sourceClass'] = VALID_SOURCE_CLASSES.has(rawClass)
      ? (rawClass as EmpEmissionsSources['sourceClass'])
      : 'ICE';
    if (!VALID_SOURCE_CLASSES.has(rawClass)) {
      warnings.push(
        warn(`${ctx}: emission source class is missing or not recognised — defaulted to "ICE", please review.`),
      );
    }

    const rawFuelCodes = Array.isArray(entry.fuelTypeCode) ? entry.fuelTypeCode : [entry.fuelTypeCode].filter(Boolean);

    const fuelDetails: FuelOriginTypeName[] = rawFuelCodes
      .map((code) => {
        // Prefer the already-classified fuel from fuelTypes.fuelTypeEntry — it carries the
        // fuelOriginCode that classifyFuel now requires, which isn't available for a bare code
        // referenced only here.
        const factor = fuelFactorsByCode.get(code);
        if (factor) {
          return {
            uniqueIdentifier: factor.uniqueIdentifier,
            origin: factor.origin,
            ...(factor.name ? { name: factor.name } : {}),
            type: factor.type,
          } as FuelOriginTypeName;
        }

        const fuelOrigin = classifyFuel(code);
        if (!fuelOrigin) {
          return undefined;
        }

        const { origin, type: fuelType, name: fuelName } = fuelOrigin;
        return {
          uniqueIdentifier: crypto.randomUUID(),
          origin,
          type: fuelType,
          ...(fuelName ? { name: fuelName } : {}),
        } as FuelOriginTypeName;
      })
      .filter(Boolean);

    const rawMethods = Array.isArray(entry.monitoringMethodCode)
      ? entry.monitoringMethodCode
      : [entry.monitoringMethodCode].filter(Boolean);
    const monitoringMethod = rawMethods
      .map((m) => m?.toUpperCase())
      .filter((m): m is EmpEmissionsSources['monitoringMethod'][number] => VALID_MONITORING_METHODS.has(m ?? ''));
    if (!monitoringMethod.length) {
      warnings.push(warn(`${ctx}: no valid monitoring method found — please set it manually in the form.`));
    }

    const rawRef = String(entry.identificationNumber ?? '');
    const referenceNumber = rawRef?.length > SOURCE_REF_MAX ? undefined : rawRef;

    return {
      uniqueIdentifier: crypto.randomUUID(),
      name,
      type,
      sourceClass,
      fuelDetails,
      monitoringMethod,
      referenceNumber,
    };
  });
}

function mapMeasurements(
  equipmentEntries: EuXmlMeasuringEquipmentEntry[],
  sourceEntries: EuXmlEmissionSourceEntry[],
  shipName: string,
  warnings: XmlValidationError[],
): MeasurementDescription[] {
  const equipToSources = new Map<string, string[]>();
  for (const src of sourceEntries) {
    if (!src.name || !src.measuringEquipmentName) continue;
    const equipmentNames = Array.isArray(src.measuringEquipmentName)
      ? src.measuringEquipmentName
      : [src.measuringEquipmentName];

    for (const equipmentName of equipmentNames.filter(Boolean)) {
      const list = equipToSources.get(equipmentName) ?? [];
      if (!list.includes(src.name)) list.push(src.name);
      equipToSources.set(equipmentName, list);
    }
  }

  return equipmentEntries
    .filter((e) => {
      const codes = Array.isArray(e.appliedToCode) ? e.appliedToCode : [e.appliedToCode];
      return codes.includes('EMISSION_SOURCES');
    })
    .map((e) => {
      const ctx = `Ship "${shipName}" / Equipment "${e.name ?? ''}"`;
      const name = e.name?.length > MEASUREMENT_NAME_MAX ? undefined : e.name;
      const technicalDescription =
        e.technicalDescription?.length > MEASUREMENT_DESC_MAX ? undefined : e.technicalDescription;
      const emissionSources = equipToSources.get(e.name ?? '') ?? [];
      if (!emissionSources.length) {
        warnings.push(warn(`${ctx}: no linked emission sources found.`));
      }
      return { name, technicalDescription, emissionSources };
    });
}

const UNCERTAINTY_VALUE_PATTERN = /^\d{1,2}(\.\d{1,2})?$|^100(\.0{1,2})?$/;

function isValidShipSpecificUncertainty(value: number | undefined): boolean {
  return Number.isFinite(value) && value > 0 && value <= 100 && UNCERTAINTY_VALUE_PATTERN.test(String(value));
}

function mapUncertainty(entries: EuXmlEmissionSourceEntry[]): UncertaintyLevel[] {
  const seen = new Map<string, UncertaintyLevel>();
  for (const entry of entries) {
    const methods = Array.isArray(entry.monitoringMethodCode)
      ? entry.monitoringMethodCode
      : [entry.monitoringMethodCode].filter(Boolean);
    for (const rawMethod of methods) {
      const method = rawMethod?.toUpperCase() ?? '';
      if (!VALID_MONITORING_METHODS.has(method) || seen.has(method)) continue;
      const rawApproach = entry.levelOfUncertaintyTypeCode?.toUpperCase() ?? '';
      const value = isValidShipSpecificUncertainty(entry.shipSpecificUncertainty)
        ? String(entry.shipSpecificUncertainty)
        : undefined;
      const methodApproach: UncertaintyLevel['methodApproach'] = isNil(value)
        ? undefined
        : rawApproach === 'SHIP_SPECIFIC'
          ? 'SHIP_SPECIFIC'
          : rawApproach === 'DEFAULT'
            ? 'DEFAULT'
            : undefined;

      seen.set(method, {
        monitoringMethod: method as UncertaintyLevel['monitoringMethod'],
        methodApproach,
        value,
      });
    }
  }
  return Array.from(seen.values());
}

const MIN_VOYAGES_MINIMUM = 301;

function mapExemptionConditions(
  plan: EuXmlMonitoringPlan,
  shipName: string,
  warnings: XmlValidationError[],
): ExemptionConditions {
  const c1 = plan.navigation?.procedureAnnexITableC1;
  if (!c1) {
    return { exist: false };
  }

  const minVoyages = Number(c1.minimumNumberOfVoyages);
  if (!Number.isFinite(minVoyages) || minVoyages < MIN_VOYAGES_MINIMUM) {
    warnings.push(
      warn(
        `Ship "${shipName}": minimum number of expected voyages must be more than 300 and will need to be entered manually.`,
      ),
    );
    return { exist: false };
  }

  return { exist: true, minVoyages };
}

function mapCarbonCapture(
  plan: EuXmlMonitoringPlan,
  shipName: string,
  warnings: XmlValidationError[],
): EmpCarbonCapture {
  const entries = plan.ccsCcuRecords?.ccsCcuEntry ?? [];
  if (!entries.length) return { exist: false };

  const ctx = `Ship "${shipName}" / Carbon capture`;
  const rawDescription = entries.find((e) => e.technology)?.technology ?? '';
  const description = rawDescription.length > CARBON_CAPTURE_DESC_MAX ? '' : rawDescription;
  if (!description) {
    warnings.push(warn(`${ctx}: technology description is missing and will need to be entered manually.`));
  }
  const otherDescriptions = new Set(entries.map((e) => e.technology).filter((t) => t && t !== rawDescription));
  if (otherDescriptions.size) {
    warnings.push(warn(`${ctx}: multiple different technology descriptions found — only the first was imported.`));
  }

  const technologyEmissionSources = entries.map((e) => e.emissionSourceName).filter((n): n is string => !!n);

  return {
    exist: true,
    technologies: { description, technologyEmissionSources },
  };
}
