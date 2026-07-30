package uk.gov.mrtm.api.account.search.paths;

import com.querydsl.core.types.dsl.BooleanExpression;
import org.junit.jupiter.api.Test;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.account.domain.QMrtmAccount;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class MrtmAccountSearchEntityPathsTest {

    private static final QMrtmAccount ACCOUNT = QMrtmAccount.mrtmAccount;

    private final MrtmAccountSearchEntityPaths paths = new MrtmAccountSearchEntityPaths();

    @Test
    void exposesQmrtmAccountPaths() {
        assertThat(paths.root()).isSameAs(ACCOUNT);
        assertThat(paths.idPath()).isSameAs(ACCOUNT.id);
        assertThat(paths.namePath()).isSameAs(ACCOUNT.name);
        assertThat(paths.businessIdPath()).isSameAs(ACCOUNT.businessId);
        assertThat(paths.competentAuthorityPath()).isSameAs(ACCOUNT.competentAuthority);
        assertThat(paths.statusPath()).isEqualTo(ACCOUNT.status.stringValue());
    }

    @Test
    void statusIn_returnsNullWhenNullOrEmpty() {
        assertThat(paths.statusIn(null)).isNull();
        assertThat(paths.statusIn(Set.of())).isNull();
    }

    @Test
    void statusIn_mapsAccountStatusToMrtmAccountStatus() {
        BooleanExpression expression = paths.statusIn(Set.of(MrtmAccountStatus.LIVE));
        BooleanExpression expected = ACCOUNT.status.in(MrtmAccountStatus.LIVE);

        assertThat(expression).isNotNull();
        assertThat(expression.toString()).isEqualTo(expected.toString());
    }
}
