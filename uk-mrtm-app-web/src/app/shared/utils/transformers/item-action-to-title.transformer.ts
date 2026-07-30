import { RequestActionDTO } from '@mrtm/api';

import { ItemActionTransformer } from '@netz/common/pipes';

import { itemActionsMap } from '@requests/common/item-actions.map';
import { isAer, isDoe, isSiteVisit, isVir } from '@shared/utils';

export const itemActionToTitleTransformer: ItemActionTransformer = (
  actionType: RequestActionDTO['type'],
  year?: string | number,
  submitter?: string,
): string => {
  let text = itemActionsMap[actionType]?.text ?? null;
  const suffix = itemActionsMap[actionType]?.suffix ?? null;

  if ((isAer(actionType) || isDoe(actionType) || isVir(actionType) || isSiteVisit(actionType)) && year) {
    text = text?.replace(/annual/i, `${year}`);
  }

  return !text
    ? null
    : `${itemActionsMap[actionType]?.transformed && submitter ? `${text} by ${submitter}` : text} ${!suffix ? '' : suffix}`.trim();
};
