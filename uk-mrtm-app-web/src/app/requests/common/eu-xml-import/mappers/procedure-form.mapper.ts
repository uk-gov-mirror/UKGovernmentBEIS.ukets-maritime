import { EmpProcedureForm } from '@mrtm/api';

import {
  PROC_DESCRIPTION_MAX,
  PROC_IT_MAX,
  PROC_LOCATION_MAX,
  PROC_REFERENCE_MAX,
  PROC_RESPONSIBLE_MAX,
  PROC_VERSION_MAX,
} from '@requests/common/eu-xml-import/eu-xml-import.constants';
import { EuXmlProcedure } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { warn } from '@requests/common/eu-xml-import/mappers/mapper.helpers';
import { XmlValidationError } from '@shared/types';

export function mapProcedureForm(
  node: EuXmlProcedure | undefined,
  context: string,
  warnings: XmlValidationError[],
): EmpProcedureForm {
  const reference =
    (node?.referenceExistingProcedure || node?.referenceForProcedure)?.length > PROC_REFERENCE_MAX
      ? undefined
      : node?.referenceExistingProcedure || node?.referenceForProcedure;
  if (!reference) {
    warnings.push(warn(`${context}: procedure reference is missing and will need to be entered manually.`));
  }

  const description = node?.procedures?.length > PROC_DESCRIPTION_MAX ? undefined : node?.procedures;
  if (!description) {
    warnings.push(warn(`${context}: procedure description is missing and will need to be entered manually.`));
  }

  const responsiblePersonOrPosition =
    node?.responsiblePerson?.length > PROC_RESPONSIBLE_MAX ? undefined : node?.responsiblePerson;
  if (!responsiblePersonOrPosition) {
    warnings.push(warn(`${context}: responsible person or position is missing and will need to be entered manually.`));
  }

  const recordsLocation = node?.locationOfRecords?.length > PROC_LOCATION_MAX ? undefined : node?.locationOfRecords;
  if (!recordsLocation) {
    warnings.push(warn(`${context}: location of records is missing and will need to be entered manually.`));
  }

  return {
    reference,
    version: node?.versionExistingProcedure?.length > PROC_VERSION_MAX ? undefined : node?.versionExistingProcedure,
    description,
    responsiblePersonOrPosition,
    recordsLocation,
    itSystemUsed: node?.itSystem?.length > PROC_IT_MAX ? undefined : node?.itSystem,
  };
}
