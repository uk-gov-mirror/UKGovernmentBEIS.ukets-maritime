package uk.gov.mrtm.api.web.orchestrator.account.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.search.domain.dto.MrtmAccountSearchResultInfoDTO;
import uk.gov.netz.api.account.domain.dto.AccountSearchResults;
import uk.gov.netz.api.account.search.criteria.AccountSearchContactFilter;
import uk.gov.netz.api.account.search.criteria.AccountSearchFilterCriteria;
import uk.gov.netz.api.account.search.service.AccountSearchQueryService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.user.core.service.account.ContactAccountIdsService;

@Service
@RequiredArgsConstructor
public class MrtmAccountSearchQueryOrchestrator {

    private final ContactAccountIdsService contactAccountIdsService;
    private final AccountSearchQueryService<MrtmAccount, MrtmAccountSearchResultInfoDTO> mrtmAccountSearchQueryService;

    public AccountSearchResults<MrtmAccountSearchResultInfoDTO> search(
            AppUser user, AccountSearchFilterCriteria criteria) {
        AccountSearchContactFilter contactFilter = criteria.hasContactEmail()
                ? AccountSearchContactFilter.of(
                        contactAccountIdsService.resolveAccountIdsByEmail(criteria.getContactEmail()))
                : AccountSearchContactFilter.none();
        return mrtmAccountSearchQueryService.search(user, criteria, contactFilter);
    }
}
