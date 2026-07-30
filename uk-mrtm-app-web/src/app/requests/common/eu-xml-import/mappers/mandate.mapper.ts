import { EmpMandate, EmpRegisteredOwner } from '@mrtm/api';

import { EuXmlMonitoringPlan } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { warn } from '@requests/common/eu-xml-import/mappers/mapper.helpers';
import { isIsmNature } from '@requests/common/eu-xml-import/mappers/ships.mapper';
import { XmlValidationError } from '@shared/types';

const REGISTERED_OWNER_NAME_MAX = 255;
const IMO_NUMBER_PATTERN = /^\d{7}$/;
const EMAIL_PATTERN = /^[^\s@]+@([^\s@.]+\.)+[^\s@.]+$/;

export function mapMandate(
  plans: EuXmlMonitoringPlan[],
  accountImoNumber?: string,
): {
  mandate: EmpMandate;
  mandateWarnings: XmlValidationError[];
} {
  const warnings: XmlValidationError[] = [];
  const ownersByKey = new Map<string, EmpRegisteredOwner>();

  for (const plan of plans) {
    if (!isIsmNature(plan.company?.nature)) continue;

    const shipImoNumber = String(plan['@_shipImoNumber'] ?? '');
    const shipName = plan.ship?.name ?? `IMO ${shipImoNumber || '?'}`;
    const ownerNumber = String(plan.ship?.ownerNumber ?? '');
    const ownerName = plan.ship?.ownerName ?? '';
    const key = ownerNumber || ownerName;

    if (!key) {
      warnings.push(
        warn(
          `Ship "${shipName}": nature of reporting responsibility is ISM but no registered owner details were found — please add them manually.`,
        ),
      );
      continue;
    }

    let owner = ownersByKey.get(key);
    if (!owner) {
      const ctx = `Registered owner "${ownerName || ownerNumber}"`;

      const name = ownerName?.length > REGISTERED_OWNER_NAME_MAX ? '' : ownerName;
      if (!ownerName) {
        warnings.push(warn(`${ctx}: name is missing and will need to be entered manually.`));
      } else if (!name) {
        warnings.push(
          warn(`${ctx}: name exceeds ${REGISTERED_OWNER_NAME_MAX} characters and will need to be entered manually.`),
        );
      }

      const imoNumber =
        (ownerNumber && !IMO_NUMBER_PATTERN.test(ownerNumber)) ||
        ownerNumber === shipImoNumber ||
        ownerNumber === accountImoNumber
          ? ''
          : ownerNumber;
      if (!ownerNumber) {
        warnings.push(warn(`${ctx}: IMO number is missing and will need to be entered manually.`));
      } else if (!imoNumber) {
        warnings.push(warn(`${ctx}: IMO number must be 7 digits and will need to be entered manually.`));
      }

      const rawContactName = plan.ship?.ownerContactPerson;
      const contactName = rawContactName?.length > REGISTERED_OWNER_NAME_MAX ? undefined : rawContactName;
      if (!rawContactName) {
        warnings.push(warn(`${ctx}: contact name is missing and will need to be entered manually.`));
      } else if (!contactName) {
        warnings.push(
          warn(
            `${ctx}: contact name exceeds ${REGISTERED_OWNER_NAME_MAX} characters and will need to be entered manually.`,
          ),
        );
      }

      const rawEmail = plan.ship?.ownerEmail;
      const email = rawEmail && !EMAIL_PATTERN.test(rawEmail) ? '' : (rawEmail ?? '');
      if (!rawEmail) {
        warnings.push(warn(`${ctx}: email is missing and will need to be entered manually.`));
      } else if (!email) {
        warnings.push(warn(`${ctx}: email is not in a valid format and will need to be entered manually.`));
      }

      warnings.push(
        warn(
          `${ctx}: effective date of the mandate is not provided by the EU monitoring plan and must be entered manually.`,
        ),
      );

      owner = {
        uniqueIdentifier: crypto.randomUUID(),
        name,
        imoNumber,
        contactName,
        email,
        effectiveDate: null,
        ships: [],
      };
      ownersByKey.set(key, owner);
    }

    if (!owner.ships.some((s) => s.imoNumber === shipImoNumber)) {
      owner.ships.push({ imoNumber: shipImoNumber, name: shipName });
    }
  }

  const registeredOwners = Array.from(ownersByKey.values());

  return {
    mandate: { exist: registeredOwners.length > 0, registeredOwners },
    mandateWarnings: warnings,
  };
}
