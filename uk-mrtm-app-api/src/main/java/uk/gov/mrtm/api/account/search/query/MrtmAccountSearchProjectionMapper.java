package uk.gov.mrtm.api.account.search.query;

import com.querydsl.core.types.ConstructorExpression;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.StringExpression;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.QMrtmAccount;
import uk.gov.netz.api.account.search.paths.AccountSearchEntityPaths;
import uk.gov.netz.api.account.search.query.AccountSearchProjectionMapper;

/** Builds MRTM account search projections including IMO number. */
public class MrtmAccountSearchProjectionMapper
        implements AccountSearchProjectionMapper<MrtmAccount, MrtmAccountSearchResultRow> {

    private static final QMrtmAccount ACCOUNT = QMrtmAccount.mrtmAccount;

    @Override
    public ConstructorExpression<MrtmAccountSearchResultRow> constructorProjection(
            AccountSearchEntityPaths<MrtmAccount> paths) {
        return Projections.constructor(
                MrtmAccountSearchResultRow.class,
                paths.idPath(),
                paths.namePath(),
                paths.businessIdPath(),
                requirePath(paths.statusPath()),
                ACCOUNT.imoNumber);
    }

    private static StringExpression requirePath(StringExpression path) {
        if (path == null) {
            throw new IllegalArgumentException("Status path is required for account search projection");
        }
        return path;
    }
}
