package uk.gov.mrtm.api.web.controller.account;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.aop.framework.AopProxy;
import org.springframework.aop.framework.DefaultAopProxyFactory;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.account.domain.dto.MrtmAccountDTO;
import uk.gov.mrtm.api.account.domain.dto.MrtmAccountInfoDTO;
import uk.gov.mrtm.api.account.search.criteria.MrtmAccountSearchSortField;
import uk.gov.mrtm.api.account.search.mapper.MrtmAccountSearchCriteriaMapper;
import uk.gov.mrtm.api.account.service.MrtmAccountCreateService;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;
import uk.gov.mrtm.api.web.config.AppUserArgumentResolver;
import uk.gov.mrtm.api.web.controller.exception.ExceptionControllerAdvice;
import uk.gov.netz.api.security.AppSecurityComponent;
import uk.gov.netz.api.security.AuthorizationAspectUserResolver;
import uk.gov.netz.api.security.AuthorizedAspect;
import uk.gov.netz.api.security.AuthorizedRoleAspect;
import uk.gov.mrtm.api.account.search.domain.dto.MrtmAccountSearchCriteria;
import uk.gov.mrtm.api.account.search.domain.dto.MrtmAccountSearchResultInfoDTO;
import uk.gov.netz.api.account.domain.dto.AccountSearchResults;
import uk.gov.netz.api.account.search.criteria.AccountSearchFilterCriteria;
import uk.gov.mrtm.api.web.orchestrator.account.service.MrtmAccountSearchQueryOrchestrator;
import uk.gov.netz.api.account.service.AccountQueryService;
import uk.gov.netz.api.authorization.core.domain.AppAuthority;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.authorization.rules.services.AppUserAuthorizationService;
import uk.gov.netz.api.authorization.rules.services.RoleAuthorizationService;
import uk.gov.netz.api.common.domain.PagingRequest;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static uk.gov.netz.api.common.constants.RoleTypeConstants.OPERATOR;
import static uk.gov.netz.api.common.constants.RoleTypeConstants.REGULATOR;
import static uk.gov.netz.api.common.constants.RoleTypeConstants.VERIFIER;

@ExtendWith(MockitoExtension.class)
class MrtmAccountControllerTest {

    private static final String CONTROLLER_PATH = "/v1.0/mrtm/accounts";
    private static final String IMO_NUMBER_CONTROLLER_PATH = "/imo-number/";
    private static final String INFO_CONTROLLER_PATH = "/info";

    private static final String ACCOUNT_NAME = "accountName";
    private static final String IMO_NUMBER = "0000000";

    @InjectMocks
    private MrtmAccountController controller;

    @Mock
    private MrtmAccountCreateService mrtmAccountCreateService;

    @Mock
    private MrtmAccountQueryService mrtmAccountQueryService;

    @Mock
    private MrtmAccountSearchQueryOrchestrator mrtmAccountSearchQueryOrchestrator;

    @Mock
    private MrtmAccountSearchCriteriaMapper mrtmAccountSearchCriteriaMapper;

    @Mock
    private AppSecurityComponent appSecurityComponent;

    @Mock
    private AppUserAuthorizationService appUserAuthorizationService;

    @Mock
    private RoleAuthorizationService roleAuthorizationService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {

        AuthorizationAspectUserResolver authorizationAspectUserResolver = new AuthorizationAspectUserResolver(appSecurityComponent);
        AuthorizedAspect aspect = new AuthorizedAspect(appUserAuthorizationService, authorizationAspectUserResolver);
        AuthorizedRoleAspect authorizedRoleAspect = new AuthorizedRoleAspect(roleAuthorizationService, authorizationAspectUserResolver);

        AspectJProxyFactory aspectJProxyFactory = new AspectJProxyFactory(controller);
        aspectJProxyFactory.addAspect(aspect);
        aspectJProxyFactory.addAspect(authorizedRoleAspect);

        DefaultAopProxyFactory proxyFactory = new DefaultAopProxyFactory();
        AopProxy aopProxy = proxyFactory.createAopProxy(aspectJProxyFactory);
        controller = (MrtmAccountController) aopProxy.getProxy();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new AppUserArgumentResolver(appSecurityComponent))
                .setControllerAdvice(new ExceptionControllerAdvice())
                .build();
    }

    @Test
    void createMmrtmAccount() throws Exception {
        final AddressStateDTO addressStateDTO = AddressStateDTO.builder()
                .line1("line1")
                .line2("line2")
                .city("city")
                .country("country")
                .postcode("postcode")
                .state("state")
                .build();
        AppUser appUser = AppUser.builder()
                .userId("authUserId")
                .authorities(List.of(AppAuthority.builder().competentAuthority(CompetentAuthorityEnum.SCOTLAND).build()))
                .build();
        MrtmAccountDTO accountCreationDTO = MrtmAccountDTO.builder()
                .name(ACCOUNT_NAME)
                .imoNumber(IMO_NUMBER)
                .address(addressStateDTO)
                .firstMaritimeActivityDate(LocalDate.of(2026, 4, 26))
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);

        mockMvc.perform(
                        MockMvcRequestBuilders.post(CONTROLLER_PATH)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(accountCreationDTO)))
                .andExpect(status().isCreated());

        verify(appSecurityComponent).getAuthenticatedUser();
        verify(mrtmAccountCreateService).createMaritimeAccount(accountCreationDTO, appUser);
    }

    @Test
    void createMrtmAccount_forbidden() throws Exception {
        final AddressStateDTO addressStateDTO = AddressStateDTO.builder()
                .line1("line1")
                .line2("line2")
                .city("city")
                .country("country")
                .postcode("postcode")
                .state("state")
                .build();
        AppUser appUser = AppUser.builder()
                .userId("authUserId")
                .roleType(RoleTypeConstants.OPERATOR)
                .build();
        MrtmAccountDTO accountCreationDTO = MrtmAccountDTO.builder()
                .name(ACCOUNT_NAME)
                .imoNumber(IMO_NUMBER)
                .address(addressStateDTO)
                .firstMaritimeActivityDate(LocalDate.of(2026, 4, 26))
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(roleAuthorizationService)
                .evaluate(appUser, new String[]{ RoleTypeConstants.REGULATOR });

        mockMvc.perform(
                        MockMvcRequestBuilders
                                .post(CONTROLLER_PATH)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(accountCreationDTO)))
                .andExpect(status().isForbidden());

        verifyNoInteractions(mrtmAccountCreateService);
    }

    @Test
    void isExistingAccountImoNumber() throws Exception {
        AppUser user = AppUser.builder().userId("userId").build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);

        mockMvc.perform(MockMvcRequestBuilders.get(CONTROLLER_PATH + IMO_NUMBER_CONTROLLER_PATH + IMO_NUMBER)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(appSecurityComponent).getAuthenticatedUser();
        verify(mrtmAccountQueryService).isExistingAccountImoNumber(IMO_NUMBER);
    }

    @Test
    void isExistingAccountImoNumber_forbidden() throws Exception {
        AppUser appUser = AppUser.builder()
                .userId("authUserId")
                .roleType(RoleTypeConstants.OPERATOR)
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(roleAuthorizationService)
                .evaluate(appUser, new String[]{ RoleTypeConstants.REGULATOR });


        mockMvc.perform(MockMvcRequestBuilders.get(CONTROLLER_PATH + IMO_NUMBER_CONTROLLER_PATH + IMO_NUMBER)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        verify(appSecurityComponent).getAuthenticatedUser();
        verifyNoInteractions(mrtmAccountQueryService);
    }

    @Test
    void searchCurrentUserMrtmAccounts() throws Exception {
        final AppUser user = AppUser.builder().userId("userId").build();
        final PagingRequest paging = PagingRequest.builder().pageNumber(0).pageSize(10).build();
        final AccountSearchFilterCriteria filterCriteria = AccountSearchFilterCriteria.builder()
                .term("key")
                .paging(paging)
                .build();

        final List<MrtmAccountSearchResultInfoDTO> accounts =
                List.of(
                        new MrtmAccountSearchResultInfoDTO(
                                1L, "account1", IMO_NUMBER, "EM00009", MrtmAccountStatus.LIVE.getName()),
                        new MrtmAccountSearchResultInfoDTO(
                                2L, "account2", "7654321", "EM00010", MrtmAccountStatus.LIVE.getName())
                );
        final AccountSearchResults<MrtmAccountSearchResultInfoDTO> results =
                AccountSearchResults.<MrtmAccountSearchResultInfoDTO>builder().accounts(accounts).total(2L).build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        when(mrtmAccountSearchCriteriaMapper.toFilterCriteria(any(MrtmAccountSearchCriteria.class)))
                .thenReturn(filterCriteria);
        when(mrtmAccountSearchQueryOrchestrator.search(user, filterCriteria)).thenReturn(results);

        mockMvc.perform(MockMvcRequestBuilders
                        .get(CONTROLLER_PATH)
                        .param("term", "key")
                        .param("page", String.valueOf(paging.getPageNumber()))
                        .param("size", String.valueOf(paging.getPageSize()))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accounts[0].id").value(1L))
                .andExpect(jsonPath("$.accounts[0].name").value("account1"))
                .andExpect(jsonPath("$.accounts[0].businessId").value("EM00009"))
                .andExpect(jsonPath("$.accounts[0].imoNumber").value(IMO_NUMBER))
                .andExpect(jsonPath("$.accounts[1].id").value(2L))
                .andExpect(jsonPath("$.accounts[1].name").value("account2"))
                .andExpect(jsonPath("$.accounts[1].businessId").value("EM00010"))
                .andExpect(jsonPath("$.accounts[1].imoNumber").value("7654321"));

        ArgumentCaptor<MrtmAccountSearchCriteria> searchCriteriaCaptor =
                ArgumentCaptor.forClass(MrtmAccountSearchCriteria.class);
        verify(mrtmAccountSearchCriteriaMapper).toFilterCriteria(searchCriteriaCaptor.capture());
        assertThat(searchCriteriaCaptor.getValue().getTerm()).isEqualTo("key");
        assertThat(searchCriteriaCaptor.getValue().getPage()).isEqualTo(0);
        assertThat(searchCriteriaCaptor.getValue().getSize()).isEqualTo(10);
        verify(mrtmAccountSearchQueryOrchestrator).search(user, filterCriteria);
    }

    @Test
    void searchCurrentUserMrtmAccounts_withEnhancedFilters() throws Exception {
        final AppUser user = AppUser.builder().userId("userId").build();
        final PagingRequest paging = PagingRequest.builder().pageNumber(1).pageSize(20).build();
        final Set<MrtmAccountStatus> statuses = Set.of(MrtmAccountStatus.LIVE);
        final AccountSearchFilterCriteria filterCriteria = AccountSearchFilterCriteria.builder()
                .term("vessel")
                .paging(paging)
                .statuses(statuses)
                .contactEmail("contact@example.com")
                .sortField(MrtmAccountSearchSortField.IMO_NUMBER)
                .sortDirection(Sort.Direction.DESC)
                .build();
        final AccountSearchResults<MrtmAccountSearchResultInfoDTO> results =
                AccountSearchResults.<MrtmAccountSearchResultInfoDTO>builder()
                .accounts(List.of())
                .total(0L)
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        when(mrtmAccountSearchCriteriaMapper.toFilterCriteria(any(MrtmAccountSearchCriteria.class)))
                .thenReturn(filterCriteria);
        when(mrtmAccountSearchQueryOrchestrator.search(user, filterCriteria)).thenReturn(results);

        mockMvc.perform(MockMvcRequestBuilders
                        .get(CONTROLLER_PATH)
                        .param("term", "vessel")
                        .param("statuses", "LIVE")
                        .param("contactEmail", "contact@example.com")
                        .param("sortBy", "IMO_NUMBER")
                        .param("direction", "DESC")
                        .param("page", "1")
                        .param("size", "20")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        ArgumentCaptor<MrtmAccountSearchCriteria> searchCriteriaCaptor =
                ArgumentCaptor.forClass(MrtmAccountSearchCriteria.class);
        verify(mrtmAccountSearchCriteriaMapper).toFilterCriteria(searchCriteriaCaptor.capture());
        MrtmAccountSearchCriteria capturedCriteria = searchCriteriaCaptor.getValue();
        assertThat(capturedCriteria.getTerm()).isEqualTo("vessel");
        assertThat(capturedCriteria.getStatuses()).isEqualTo(statuses);
        assertThat(capturedCriteria.getContactEmail()).isEqualTo("contact@example.com");
        assertThat(capturedCriteria.getSortBy()).isEqualTo("IMO_NUMBER");
        assertThat(capturedCriteria.getDirection()).isEqualTo(Sort.Direction.DESC);
        assertThat(capturedCriteria.getPage()).isEqualTo(1);
        assertThat(capturedCriteria.getSize()).isEqualTo(20);
        verify(mrtmAccountSearchQueryOrchestrator).search(user, filterCriteria);
    }

    @Test
    void searchCurrentUserMrtmAccounts_withoutPageAndSize() throws Exception {
        final AppUser user = AppUser.builder().userId("userId").build();
        final AccountSearchFilterCriteria filterCriteria = AccountSearchFilterCriteria.builder()
                .term("key")
                .paging(PagingRequest.builder().pageNumber(0).pageSize(20).build())
                .build();
        final AccountSearchResults<MrtmAccountSearchResultInfoDTO> results =
                AccountSearchResults.<MrtmAccountSearchResultInfoDTO>builder().accounts(List.of()).total(0L).build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        when(mrtmAccountSearchCriteriaMapper.toFilterCriteria(any(MrtmAccountSearchCriteria.class)))
                .thenReturn(filterCriteria);
        when(mrtmAccountSearchQueryOrchestrator.search(user, filterCriteria)).thenReturn(results);

        mockMvc.perform(MockMvcRequestBuilders
                        .get(CONTROLLER_PATH)
                        .param("term", "key")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        ArgumentCaptor<MrtmAccountSearchCriteria> searchCriteriaCaptor =
                ArgumentCaptor.forClass(MrtmAccountSearchCriteria.class);
        verify(mrtmAccountSearchCriteriaMapper).toFilterCriteria(searchCriteriaCaptor.capture());
        assertThat(searchCriteriaCaptor.getValue().getTerm()).isEqualTo("key");
        assertThat(searchCriteriaCaptor.getValue().getPage()).isNull();
        assertThat(searchCriteriaCaptor.getValue().getSize()).isNull();
        verify(mrtmAccountSearchQueryOrchestrator).search(user, filterCriteria);
    }

    @Test
    void searchCurrentUserMrtmAccounts_invalidSortBy_returnsBadRequest() throws Exception {
        final AppUser user = AppUser.builder().userId("userId").build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);

        mockMvc.perform(MockMvcRequestBuilders
                        .get(CONTROLLER_PATH)
                        .param("term", "key")
                        .param("sortBy", "UNKNOWN")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(mrtmAccountSearchQueryOrchestrator, mrtmAccountSearchCriteriaMapper);
    }

    @Test
    void searchCurrentUserMrtmAccounts_blankSortBy_usesDefaultSort() throws Exception {
        final AppUser user = AppUser.builder().userId("userId").build();
        final AccountSearchFilterCriteria filterCriteria = AccountSearchFilterCriteria.builder()
                .term("key")
                .paging(PagingRequest.builder().pageNumber(0).pageSize(20).build())
                .build();
        final AccountSearchResults<MrtmAccountSearchResultInfoDTO> results =
                AccountSearchResults.<MrtmAccountSearchResultInfoDTO>builder().accounts(List.of()).total(0L).build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        when(mrtmAccountSearchCriteriaMapper.toFilterCriteria(any(MrtmAccountSearchCriteria.class)))
                .thenReturn(filterCriteria);
        when(mrtmAccountSearchQueryOrchestrator.search(user, filterCriteria)).thenReturn(results);

        mockMvc.perform(MockMvcRequestBuilders
                        .get(CONTROLLER_PATH)
                        .param("term", "key")
                        .param("sortBy", "")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        ArgumentCaptor<MrtmAccountSearchCriteria> searchCriteriaCaptor =
                ArgumentCaptor.forClass(MrtmAccountSearchCriteria.class);
        verify(mrtmAccountSearchCriteriaMapper).toFilterCriteria(searchCriteriaCaptor.capture());
        assertThat(searchCriteriaCaptor.getValue().getSortBy()).isEqualTo("");
        verify(mrtmAccountSearchQueryOrchestrator).search(user, filterCriteria);
    }

    @Test
    void searchCurrentUserMrtmAccounts_trimmedSortBy_isAccepted() throws Exception {
        final AppUser user = AppUser.builder().userId("userId").build();
        final AccountSearchFilterCriteria filterCriteria = AccountSearchFilterCriteria.builder()
                .term("key")
                .paging(PagingRequest.builder().pageNumber(0).pageSize(20).build())
                .build();
        final AccountSearchResults<MrtmAccountSearchResultInfoDTO> results =
                AccountSearchResults.<MrtmAccountSearchResultInfoDTO>builder().accounts(List.of()).total(0L).build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        when(mrtmAccountSearchCriteriaMapper.toFilterCriteria(any(MrtmAccountSearchCriteria.class)))
                .thenReturn(filterCriteria);
        when(mrtmAccountSearchQueryOrchestrator.search(user, filterCriteria)).thenReturn(results);

        mockMvc.perform(MockMvcRequestBuilders
                        .get(CONTROLLER_PATH)
                        .param("term", "key")
                        .param("sortBy", "OPERATOR_NAME")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        ArgumentCaptor<MrtmAccountSearchCriteria> searchCriteriaCaptor =
                ArgumentCaptor.forClass(MrtmAccountSearchCriteria.class);
        verify(mrtmAccountSearchCriteriaMapper).toFilterCriteria(searchCriteriaCaptor.capture());
        assertThat(searchCriteriaCaptor.getValue().getSortBy()).isEqualTo("OPERATOR_NAME");
    }

    @Test
    void searchCurrentUserMrtmAccounts_forbidden() throws Exception {
        final AppUser user = AppUser.builder().userId("userId").build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(roleAuthorizationService)
                .evaluate(user, new String[]{OPERATOR, REGULATOR, VERIFIER});

        mockMvc.perform(MockMvcRequestBuilders
                        .get(CONTROLLER_PATH)
                        .param("term", "key")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        verifyNoInteractions(mrtmAccountSearchQueryOrchestrator, mrtmAccountSearchCriteriaMapper);
    }

    @Test
    void getMrtmAccountsInfoByUser() throws Exception {
        final AppUser user = AppUser.builder().userId("userId").build();

        final List<MrtmAccountInfoDTO> results = List.of(
            new MrtmAccountInfoDTO(1L, "account1", "EM00009")
        );

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        when(mrtmAccountQueryService.getMrtmAccountsInfoByUser(user)).thenReturn(results);

        mockMvc.perform(MockMvcRequestBuilders
                .get(CONTROLLER_PATH + INFO_CONTROLLER_PATH)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.[0].id").value(1L))
            .andExpect(jsonPath("$.[0].name").value("account1"))
            .andExpect(jsonPath("$.[0].businessId").value("EM00009"));

        verify(mrtmAccountQueryService).getMrtmAccountsInfoByUser(user);
    }

    @Test
    void getMrtmAccountsInfoByUser_forbidden() throws Exception {
        final AppUser user = AppUser.builder().userId("userId").build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
            .when(roleAuthorizationService)
            .evaluate(user, new String[]{OPERATOR, REGULATOR, VERIFIER});

        mockMvc.perform(MockMvcRequestBuilders
                .get(CONTROLLER_PATH + INFO_CONTROLLER_PATH)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden());

        verifyNoInteractions(mrtmAccountQueryService);
    }
}
