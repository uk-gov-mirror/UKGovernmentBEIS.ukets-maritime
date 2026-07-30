package uk.gov.mrtm.api.account.search.query;

import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.StringExpression;
import org.springframework.data.domain.Sort;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.search.criteria.MrtmAccountSearchSortField;
import uk.gov.mrtm.api.account.domain.QMrtmAccount;
import uk.gov.netz.api.account.search.criteria.AccountSearchSortField;
import uk.gov.netz.api.account.search.paths.AccountSearchEntityPaths;
import uk.gov.netz.api.account.search.query.AccountSearchSortMapper;

/** Delegates common sort fields to NETZ; adds MRTM-specific fields such as IMO_NUMBER. */
public class MrtmAccountSearchSortMapper extends AccountSearchSortMapper<MrtmAccount> {

    @Override
    public OrderSpecifier<String> toOrderSpecifier(
            AccountSearchSortField sortField,
            Sort.Direction direction,
            AccountSearchEntityPaths<MrtmAccount> paths) {
        if (sortField == MrtmAccountSearchSortField.IMO_NUMBER) {
            return imoNumberOrderSpecifier(direction);
        }
        return super.toOrderSpecifier(sortField, direction, paths);
    }

    private OrderSpecifier<String> imoNumberOrderSpecifier(Sort.Direction direction) {
        StringExpression imoPath = QMrtmAccount.mrtmAccount.imoNumber;
        return direction.isAscending() ? imoPath.asc() : imoPath.desc();
    }
}
