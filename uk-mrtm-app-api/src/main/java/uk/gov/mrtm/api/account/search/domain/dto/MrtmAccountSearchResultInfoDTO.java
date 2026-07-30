package uk.gov.mrtm.api.account.search.domain.dto;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.netz.api.account.domain.dto.AccountSearchResultInfoDTO;

/** MRTM account search result row for the maritime accounts list. */
@Getter
@EqualsAndHashCode(callSuper = true)
public class MrtmAccountSearchResultInfoDTO extends AccountSearchResultInfoDTO {

    private final String imoNumber;

    public MrtmAccountSearchResultInfoDTO(
            Long id, String name, String imoNumber, String businessId, String status) {
        super(id, name, businessId, status != null ? MrtmAccountStatus.valueOf(status) : null);
        this.imoNumber = imoNumber;
    }
}
