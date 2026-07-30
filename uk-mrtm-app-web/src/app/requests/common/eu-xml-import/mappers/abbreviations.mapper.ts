import { EmpAbbreviationDefinition, EmpAbbreviations } from '@mrtm/api';

import { ABBREV_MAX, DEFINITION_MAX } from '@requests/common/eu-xml-import/eu-xml-import.constants';
import { EuXmlMonitoringPlan } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { XmlValidationError } from '@shared/types';

export function mapAbbreviations(plan: EuXmlMonitoringPlan): {
  abbreviations: EmpAbbreviations;
  abbrevWarnings: XmlValidationError[];
} {
  const warnings: XmlValidationError[] = [];
  const entries = plan.furtherInformation?.furtherInformationEntry ?? [];

  const abbreviationDefinitions: EmpAbbreviationDefinition[] = entries
    .filter((e) => e.abbreviation)
    .map((e) => {
      const abbreviation = e.abbreviation?.length > ABBREV_MAX ? undefined : e.abbreviation;
      const definition = e.explanation?.length > DEFINITION_MAX ? undefined : e.explanation;

      return { abbreviation, definition };
    });

  return {
    abbreviations: {
      exist: abbreviationDefinitions.length > 0,
      abbreviationDefinitions: abbreviationDefinitions.length > 0 ? abbreviationDefinitions : undefined,
    },
    abbrevWarnings: warnings,
  };
}
