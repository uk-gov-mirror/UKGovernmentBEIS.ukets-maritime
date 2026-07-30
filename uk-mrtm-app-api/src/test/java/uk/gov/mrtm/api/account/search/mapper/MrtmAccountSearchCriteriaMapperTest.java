package uk.gov.mrtm.api.account.search.mapper;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.account.search.criteria.MrtmAccountSearchSortField;
import uk.gov.mrtm.api.account.search.domain.dto.MrtmAccountSearchCriteria;
import uk.gov.netz.api.account.search.criteria.AccountSearchCommonSortField;
import uk.gov.netz.api.account.search.criteria.AccountSearchFilterCriteria;
import uk.gov.netz.api.common.domain.PagingRequest;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MrtmAccountSearchCriteriaMapperTest {

    private final MrtmAccountSearchCriteriaMapper mapper = new MrtmAccountSearchCriteriaMapper();

    @Test
    void defaultsToOperatorNameAsc() {
        AccountSearchFilterCriteria result = mapper.toFilterCriteria(baseCriteria().build());

        assertThat(result.getTerm()).isNull();
        assertThat(result.getStatuses()).isNull();
        assertThat(result.getContactEmail()).isNull();
        assertThat(result.getSortField()).isEqualTo(AccountSearchCommonSortField.OPERATOR_NAME);
        assertThat(result.getSortDirection()).isEqualTo(Sort.Direction.ASC);
    }

    @Test
    void missingPageAndSize_defaultsToZeroAndTwenty() {
        AccountSearchFilterCriteria result = mapper.toFilterCriteria(MrtmAccountSearchCriteria.builder().build());

        assertThat(result.getPaging()).isEqualTo(
                PagingRequest.builder().pageNumber(0).pageSize(20).build());
    }

    @Test
    void buildsPagingFromPageAndSize() {
        AccountSearchFilterCriteria result = mapper.toFilterCriteria(
                baseCriteria().page(2).size(25).build());

        assertThat(result.getPaging()).isEqualTo(
                PagingRequest.builder().pageNumber(2).pageSize(25).build());
    }

    @Test
    void blankSortBy_defaultsToOperatorName() {
        AccountSearchFilterCriteria result = mapper.toFilterCriteria(
                baseCriteria().sortBy("  ").build());

        assertThat(result.getSortField()).isEqualTo(AccountSearchCommonSortField.OPERATOR_NAME);
    }

    @Test
    void mapsStatuses() {
        Set<MrtmAccountStatus> statuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.CLOSED);

        AccountSearchFilterCriteria result = mapper.toFilterCriteria(
                baseCriteria().statuses(statuses).build());

        assertThat(result.getStatuses()).isSameAs(statuses);
    }

    @Test
    void mapsContactEmail() {
        AccountSearchFilterCriteria result = mapper.toFilterCriteria(
                baseCriteria().contactEmail("contact@example.com").build());

        assertThat(result.getContactEmail()).isEqualTo("contact@example.com");
    }

    @Test
    void mapsOperatorNameSort() {
        AccountSearchFilterCriteria result = mapper.toFilterCriteria(
                baseCriteria().sortBy("OPERATOR_NAME").direction(Sort.Direction.DESC).build());

        assertThat(result.getSortField()).isEqualTo(AccountSearchCommonSortField.OPERATOR_NAME);
        assertThat(result.getSortDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void mapsAccountIdSort() {
        AccountSearchFilterCriteria result = mapper.toFilterCriteria(
                baseCriteria().sortBy("ACCOUNT_ID").direction(Sort.Direction.ASC).build());

        assertThat(result.getSortField()).isEqualTo(AccountSearchCommonSortField.ACCOUNT_ID);
    }

    @Test
    void mapsStatusSort() {
        AccountSearchFilterCriteria result = mapper.toFilterCriteria(
                baseCriteria().sortBy("STATUS").direction(Sort.Direction.ASC).build());

        assertThat(result.getSortField()).isEqualTo(AccountSearchCommonSortField.STATUS);
    }

    @Test
    void mapsImoNumberSort() {
        AccountSearchFilterCriteria result = mapper.toFilterCriteria(
                baseCriteria().sortBy("IMO_NUMBER").direction(Sort.Direction.DESC).build());

        assertThat(result.getSortField()).isEqualTo(MrtmAccountSearchSortField.IMO_NUMBER);
        assertThat(result.getSortDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void invalidSortBy_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> mapper.toFilterCriteria(baseCriteria().sortBy("UNKNOWN").build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Sort field not supported: UNKNOWN");
    }

    @Test
    void directionDefaultsToAsc() {
        AccountSearchFilterCriteria result = mapper.toFilterCriteria(
                baseCriteria().sortBy("ACCOUNT_ID").build());

        assertThat(result.getSortDirection()).isEqualTo(Sort.Direction.ASC);
    }

    private static MrtmAccountSearchCriteria.MrtmAccountSearchCriteriaBuilder baseCriteria() {
        return MrtmAccountSearchCriteria.builder().page(0).size(10);
    }
}
