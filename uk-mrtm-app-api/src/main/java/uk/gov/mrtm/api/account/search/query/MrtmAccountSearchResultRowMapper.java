package uk.gov.mrtm.api.account.search.query;

import uk.gov.mrtm.api.account.search.domain.dto.MrtmAccountSearchResultInfoDTO;
import uk.gov.netz.api.account.domain.dto.AccountSearchResults;
import uk.gov.netz.api.account.search.query.AccountSearchQueryResultsMapper;

import java.util.List;

/** Maps MRTM projected rows to maritime account search API DTOs. */
public class MrtmAccountSearchResultRowMapper
        implements AccountSearchQueryResultsMapper<MrtmAccountSearchResultRow, MrtmAccountSearchResultInfoDTO> {

    @Override
    public AccountSearchResults<MrtmAccountSearchResultInfoDTO> toResults(
            List<MrtmAccountSearchResultRow> rows, long total) {
        return AccountSearchResults.<MrtmAccountSearchResultInfoDTO>builder()
                .accounts(rows.stream().map(this::toDto).toList())
                .total(total)
                .build();
    }

    @Override
    public AccountSearchResults<MrtmAccountSearchResultInfoDTO> emptyResults() {
        return AccountSearchResults.empty();
    }

    MrtmAccountSearchResultInfoDTO toDto(MrtmAccountSearchResultRow row) {
        return new MrtmAccountSearchResultInfoDTO(
                row.getId(),
                row.getName(),
                row.getImoNumber(),
                row.getBusinessId(),
                row.getStatus());
    }
}
