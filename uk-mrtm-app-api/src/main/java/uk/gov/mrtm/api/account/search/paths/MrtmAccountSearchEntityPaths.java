package uk.gov.mrtm.api.account.search.paths;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.EntityPathBase;
import com.querydsl.core.types.dsl.EnumPath;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.core.types.dsl.StringPath;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.account.domain.QMrtmAccount;
import uk.gov.netz.api.account.domain.enumeration.AccountStatus;
import uk.gov.netz.api.account.search.paths.AccountSearchEntityPaths;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;

import java.util.Set;
import java.util.stream.Collectors;

/** QueryDSL paths for MRTM account search via {@link QMrtmAccount}. */
public final class MrtmAccountSearchEntityPaths implements AccountSearchEntityPaths<MrtmAccount> {

    private static final QMrtmAccount ACCOUNT = QMrtmAccount.mrtmAccount;

    @Override
    public EntityPathBase<MrtmAccount> root() {
        return ACCOUNT;
    }

    @Override
    public NumberPath<Long> idPath() {
        return ACCOUNT.id;
    }

    @Override
    public StringPath namePath() {
        return ACCOUNT.name;
    }

    @Override
    public StringPath businessIdPath() {
        return ACCOUNT.businessId;
    }

    @Override
    public EnumPath<CompetentAuthorityEnum> competentAuthorityPath() {
        return ACCOUNT.competentAuthority;
    }

    @Override
    public StringExpression statusPath() {
        return ACCOUNT.status.stringValue();
    }

    @Override
    public BooleanExpression statusIn(Set<? extends AccountStatus> statuses) {
        if (statuses == null || statuses.isEmpty()) {
            return null;
        }
        Set<MrtmAccountStatus> mappedStatuses = statuses.stream()
                .map(status -> MrtmAccountStatus.valueOf(status.getName()))
                .collect(Collectors.toSet());
        return ACCOUNT.status.in(mappedStatuses);
    }
}
