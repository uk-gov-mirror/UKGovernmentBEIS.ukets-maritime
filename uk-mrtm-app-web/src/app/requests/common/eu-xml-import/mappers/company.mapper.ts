import { EmpOperatorDetails } from '@mrtm/api';

import {
  ADDRESS_CITY_MAX,
  ADDRESS_COUNTRY_MAX,
  ADDRESS_LINE_MAX,
  OPERATOR_NAME_MAX,
} from '@requests/common/eu-xml-import/eu-xml-import.constants';
import { EuXmlMonitoringPlan } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { warn } from '@requests/common/eu-xml-import/mappers/mapper.helpers';
import { XmlValidationError } from '@shared/types';

export function mapOperatorDetails(
  plan: EuXmlMonitoringPlan,
  imoNumber?: string,
): {
  operatorDetails: Partial<EmpOperatorDetails>;
  operatorWarnings: XmlValidationError[];
} {
  const warnings: XmlValidationError[] = [];
  const ship = plan.ship ?? {};
  const company = plan.company ?? {};
  const ctx = 'Company details';

  // The EU XSD carries the operator's identity on the ship record (ownerName/ownerAddress/...)
  // rather than the company section, which is often left empty in real EU Thetis exports.
  const operatorName = ship.ownerName?.length > OPERATOR_NAME_MAX ? '' : ship.ownerName;

  if (!operatorName) {
    warnings.push(warn(`${ctx}: operator name is missing and will need to be entered manually.`));
  }

  // The operator's IMO/company number is a fixed attribute of the requester's MRTM account, not
  // something carried by the EU monitoring plan XML, so it's supplied by the caller.
  if (!imoNumber) {
    warnings.push(warn(`${ctx}: company IMO number is missing and will need to be entered manually.`));
  }

  const contactAddress = {
    line1:
      (ship.ownerAddress || company.address)?.length > ADDRESS_LINE_MAX
        ? undefined
        : ship.ownerAddress || company.address,
    city: (ship.ownerCity || company.city)?.length > ADDRESS_CITY_MAX ? undefined : ship.ownerCity || company.city,
    country:
      (ship.ownerCountry || company.countryCode)?.length > ADDRESS_COUNTRY_MAX
        ? undefined
        : ship.ownerCountry || company.countryCode,
  };
  if (!contactAddress.line1 || !contactAddress.city || !contactAddress.country) {
    warnings.push(warn(`${ctx}: contact address is incomplete and will need to be completed manually.`));
  }

  warnings.push(
    warn(
      `${ctx}: legal status of organisation is not provided by the EU monitoring plan — defaulted to "Limited company", please review and complete manually.`,
    ),
  );
  warnings.push(
    warn(`${ctx}: activity description is not provided by the EU monitoring plan and must be entered manually.`),
  );

  return {
    operatorDetails: {
      operatorName,
      imoNumber,
      contactAddress,
      activityDescription: '',
    },
    operatorWarnings: warnings,
  };
}
