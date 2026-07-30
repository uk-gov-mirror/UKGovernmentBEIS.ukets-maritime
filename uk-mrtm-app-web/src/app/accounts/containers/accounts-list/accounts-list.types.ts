import { AccountSearchResultInfoDTO, MrtmAccountDTO } from '@mrtm/api';

export interface AccountsListItemModel extends AccountSearchResultInfoDTO {
  imoNumber?: MrtmAccountDTO['imoNumber'];
}
