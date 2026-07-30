package uk.gov.mrtm.api.web.orchestrator.account.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.search.domain.dto.MrtmAccountSearchResultInfoDTO;
import uk.gov.netz.api.account.domain.dto.AccountSearchResults;
import uk.gov.netz.api.account.search.criteria.AccountSearchContactFilter;
import uk.gov.netz.api.account.search.criteria.AccountSearchFilterCriteria;
import uk.gov.netz.api.account.search.service.AccountSearchQueryService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.user.core.service.account.ContactAccountIdsService;
import uk.gov.netz.api.common.domain.PagingRequest;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MrtmAccountSearchQueryOrchestratorTest {

    @Mock
    private ContactAccountIdsService contactAccountIdsService;

    @Mock
    private AccountSearchQueryService<MrtmAccount, MrtmAccountSearchResultInfoDTO> mrtmAccountSearchQueryService;

    @InjectMocks
    private MrtmAccountSearchQueryOrchestrator orchestrator;

    @Test
    void search_withoutContactEmail_delegatesWithNoneContactFilter() {
        AppUser user = AppUser.builder().userId("user-1").build();
        AccountSearchFilterCriteria criteria = criteriaWithoutContactEmail();
        AccountSearchResults<MrtmAccountSearchResultInfoDTO> expected =
                AccountSearchResults.<MrtmAccountSearchResultInfoDTO>builder().total(0L).build();

        when(mrtmAccountSearchQueryService.search(eq(user), eq(criteria), eq(AccountSearchContactFilter.none())))
                .thenReturn(expected);

        AccountSearchResults<MrtmAccountSearchResultInfoDTO> results = orchestrator.search(user, criteria);

        assertThat(results).isSameAs(expected);
        verifyNoInteractions(contactAccountIdsService);
    }

    @Test
    void search_withContactEmail_resolvesIdsAndDelegates() {
        AppUser user = AppUser.builder().userId("user-1").build();
        AccountSearchFilterCriteria criteria = criteriaWithContactEmail("contact@example.com");
        Set<Long> contactAccountIds = Set.of(2L, 3L);
        AccountSearchResults<MrtmAccountSearchResultInfoDTO> expected =
                AccountSearchResults.<MrtmAccountSearchResultInfoDTO>builder().total(1L).build();

        when(contactAccountIdsService.resolveAccountIdsByEmail("contact@example.com"))
                .thenReturn(contactAccountIds);
        when(mrtmAccountSearchQueryService.search(eq(user), eq(criteria), eq(AccountSearchContactFilter.of(contactAccountIds))))
                .thenReturn(expected);

        AccountSearchResults<MrtmAccountSearchResultInfoDTO> results = orchestrator.search(user, criteria);

        assertThat(results).isSameAs(expected);
        verify(contactAccountIdsService).resolveAccountIdsByEmail("contact@example.com");
    }

    @Test
    void search_withContactEmailAndUnknownUser_passesEmptyActiveFilter() {
        AppUser user = AppUser.builder().userId("user-1").build();
        AccountSearchFilterCriteria criteria = criteriaWithContactEmail("unknown@example.com");

        when(contactAccountIdsService.resolveAccountIdsByEmail("unknown@example.com")).thenReturn(Set.of());
        when(mrtmAccountSearchQueryService.search(eq(user), eq(criteria), any()))
                .thenReturn(AccountSearchResults.<MrtmAccountSearchResultInfoDTO>builder().total(0L).build());

        orchestrator.search(user, criteria);

        verify(contactAccountIdsService).resolveAccountIdsByEmail("unknown@example.com");

        ArgumentCaptor<AccountSearchContactFilter> filterCaptor =
                ArgumentCaptor.forClass(AccountSearchContactFilter.class);
        verify(mrtmAccountSearchQueryService).search(eq(user), eq(criteria), filterCaptor.capture());
        assertThat(filterCaptor.getValue().isActive()).isTrue();
        assertThat(filterCaptor.getValue().getAccountIds()).isEmpty();
    }

    private static AccountSearchFilterCriteria criteriaWithoutContactEmail() {
        return AccountSearchFilterCriteria.builder()
                .paging(PagingRequest.builder().pageNumber(0).pageSize(20).build())
                .build();
    }

    private static AccountSearchFilterCriteria criteriaWithContactEmail(String contactEmail) {
        return AccountSearchFilterCriteria.builder()
                .contactEmail(contactEmail)
                .paging(PagingRequest.builder().pageNumber(0).pageSize(20).build())
                .build();
    }
}
