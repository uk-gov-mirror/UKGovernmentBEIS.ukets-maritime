package uk.gov.mrtm.api.account.search.query;

import com.querydsl.core.types.OrderSpecifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import uk.gov.mrtm.api.account.search.criteria.MrtmAccountSearchSortField;
import uk.gov.mrtm.api.account.search.paths.MrtmAccountSearchEntityPaths;
import uk.gov.netz.api.account.search.criteria.AccountSearchCommonSortField;
import uk.gov.netz.api.account.search.criteria.AccountSearchSortField;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MrtmAccountSearchSortMapperTest {

    private final MrtmAccountSearchSortMapper mapper = new MrtmAccountSearchSortMapper();

    private MrtmAccountSearchEntityPaths paths;

    @BeforeEach
    void setUp() {
        paths = new MrtmAccountSearchEntityPaths();
    }

    @Test
    void imoNumberAsc() {
        OrderSpecifier<?> order = mapper.toOrderSpecifier(
                MrtmAccountSearchSortField.IMO_NUMBER, Sort.Direction.ASC, paths);

        assertThat(order.toString()).isEqualTo("mrtmAccount.imoNumber ASC");
    }

    @Test
    void imoNumberDesc() {
        OrderSpecifier<?> order = mapper.toOrderSpecifier(
                MrtmAccountSearchSortField.IMO_NUMBER, Sort.Direction.DESC, paths);

        assertThat(order.toString()).isEqualTo("mrtmAccount.imoNumber DESC");
    }

    @Test
    void commonSortField_delegatesToNetzMapper() {
        OrderSpecifier<?> order = mapper.toOrderSpecifier(
                AccountSearchCommonSortField.OPERATOR_NAME, Sort.Direction.ASC, paths);

        assertThat(order.toString()).isEqualTo("mrtmAccount.name ASC");
    }

    @Test
    void unsupportedSortField_throwsIllegalArgumentException() {
        AccountSearchSortField unsupportedSortField = new AccountSearchSortField() { };

        assertThatThrownBy(() -> mapper.toOrderSpecifier(
                unsupportedSortField, Sort.Direction.ASC, paths))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Sort field not supported:");
    }
}
