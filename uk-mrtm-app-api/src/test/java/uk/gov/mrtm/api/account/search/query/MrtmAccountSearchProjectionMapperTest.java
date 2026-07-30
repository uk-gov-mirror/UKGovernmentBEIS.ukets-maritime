package uk.gov.mrtm.api.account.search.query;

import org.junit.jupiter.api.Test;
import uk.gov.mrtm.api.account.search.paths.MrtmAccountSearchEntityPaths;

import static org.assertj.core.api.Assertions.assertThat;

class MrtmAccountSearchProjectionMapperTest {

    private final MrtmAccountSearchProjectionMapper mapper = new MrtmAccountSearchProjectionMapper();
    private final MrtmAccountSearchEntityPaths paths = new MrtmAccountSearchEntityPaths();

    @Test
    void constructorProjection_includesImoNumber() {
        var expressions = mapper.constructorProjection(paths).getArgs();

        assertThat(expressions).hasSize(5);
        assertThat(expressions.get(0).toString()).isEqualTo("mrtmAccount.id");
        assertThat(expressions.get(1).toString()).isEqualTo("mrtmAccount.name");
        assertThat(expressions.get(2).toString()).isEqualTo("mrtmAccount.businessId");
        assertThat(expressions.get(4).toString()).isEqualTo("mrtmAccount.imoNumber");
    }

    @Test
    void constructorProjection_targetsMrtmAccountSearchResultRow() {
        assertThat(mapper.constructorProjection(paths).getType())
                .isEqualTo(MrtmAccountSearchResultRow.class);
    }
}
