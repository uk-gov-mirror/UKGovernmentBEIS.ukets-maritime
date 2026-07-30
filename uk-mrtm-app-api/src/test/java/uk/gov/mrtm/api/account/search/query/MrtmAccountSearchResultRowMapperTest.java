package uk.gov.mrtm.api.account.search.query;

import org.junit.jupiter.api.Test;
import uk.gov.mrtm.api.account.search.domain.dto.MrtmAccountSearchResultInfoDTO;
import uk.gov.netz.api.account.domain.dto.AccountSearchResults;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MrtmAccountSearchResultRowMapperTest {

    private final MrtmAccountSearchResultRowMapper mapper = new MrtmAccountSearchResultRowMapper();

    @Test
    void toDto_mapsImoNumber() {
        MrtmAccountSearchResultInfoDTO dto = mapper.toDto(
                new MrtmAccountSearchResultRow(1L, "Operator A", "EM00009", "LIVE", "1234567"));

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getName()).isEqualTo("Operator A");
        assertThat(dto.getImoNumber()).isEqualTo("1234567");
        assertThat(dto.getBusinessId()).isEqualTo("EM00009");
        assertThat(dto.getStatus()).isEqualTo("LIVE");
    }

    @Test
    void toResults_buildsAccountSearchResults() {
        AccountSearchResults<MrtmAccountSearchResultInfoDTO> results = mapper.toResults(
                List.of(new MrtmAccountSearchResultRow(1L, "A", "B-1", "LIVE", "0000001")),
                1L);

        assertThat(results.getTotal()).isEqualTo(1L);
        assertThat(results.getAccounts()).hasSize(1);
        assertThat(results.getAccounts().get(0).getImoNumber()).isEqualTo("0000001");
    }

    @Test
    void emptyResults_returnsEmptyAccountSearchResults() {
        assertThat(mapper.emptyResults()).isEqualTo(AccountSearchResults.empty());
    }
}
