package uk.gov.mrtm.api.web.controller.account;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.aop.framework.AopProxy;
import org.springframework.aop.framework.DefaultAopProxyFactory;
import org.springframework.format.support.FormattingConversionService;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import uk.gov.mrtm.api.web.config.AppUserArgumentResolver;
import uk.gov.mrtm.api.web.controller.exception.ExceptionControllerAdvice;
import uk.gov.netz.api.account.domain.dto.AccountContactDTO;
import uk.gov.netz.api.account.domain.dto.AccountContactInfoDTO;
import uk.gov.netz.api.account.domain.dto.AccountContactInfoResponse;
import uk.gov.netz.api.account.domain.dto.SiteContactSearchCriteriaDTO;
import uk.gov.netz.api.account.service.AccountCaSiteContactService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.authorization.rules.services.AppUserAuthorizationService;
import uk.gov.netz.api.authorization.rules.services.RoleAuthorizationService;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.common.domain.PagingRequest;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.security.AppSecurityComponent;
import uk.gov.netz.api.security.AuthorizationAspectUserResolver;
import uk.gov.netz.api.security.AuthorizedAspect;
import uk.gov.netz.api.security.AuthorizedRoleAspect;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CaSiteContactControllerTest {

    private static final String CA_SITE_CONTACT_CONTROLLER_PATH = "/v1.0/ca-site-contacts";

    private MockMvc mockMvc;

    @InjectMocks
    private CaSiteContactController controller;

    @Mock
    private AppSecurityComponent appSecurityComponent;

    @Mock
    private AccountCaSiteContactService accountCaSiteContactService;

    @Mock
    private RoleAuthorizationService roleAuthorizationService;

    @Mock
    private AppUserAuthorizationService appUserAuthorizationService;

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
        controller = (CaSiteContactController) aopProxy.getProxy();

        FormattingConversionService conversionService = new FormattingConversionService();

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new AppUserArgumentResolver(appSecurityComponent))
                .setControllerAdvice(new ExceptionControllerAdvice())
            .setConversionService(conversionService)
                .build();

        objectMapper = new ObjectMapper();
    }

    @Test
    void getCaSiteContacts() throws Exception {
        final AppUser user = AppUser.builder().roleType(RoleTypeConstants.REGULATOR).build();
        SiteContactSearchCriteriaDTO searchCriteria = SiteContactSearchCriteriaDTO.builder().businessId("businessId").build();
        AccountContactInfoResponse accountCASiteContactInfoResponse = AccountContactInfoResponse.builder()
                .contacts(List.of(
                        AccountContactInfoDTO.builder().accountId(1L).accountName("accountName1").userId("userId1").build(),
                        AccountContactInfoDTO.builder().accountId(2L).accountName("accountName2").userId("userId2").build()))
                .editable(false).build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        when(accountCaSiteContactService.getAccountsAndCaSiteContacts(user, PagingRequest.builder().pageNumber(0).pageSize(2).build(),
            searchCriteria)).thenReturn(accountCASiteContactInfoResponse);

        mockMvc.perform(MockMvcRequestBuilders.get(CA_SITE_CONTACT_CONTROLLER_PATH + "?page=0&size=2&businessId=businessId")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andDo(MockMvcResultHandlers.print())
                .andExpect(jsonPath("contacts[0].accountId").value(1L))
                .andExpect(jsonPath("contacts[0].accountName").value("accountName1"))
                .andExpect(jsonPath("contacts[0].userId").value("userId1"))
                .andExpect(jsonPath("contacts[1].accountId").value(2L))
                .andExpect(jsonPath("contacts[1].accountName").value("accountName2"))
                .andExpect(jsonPath("contacts[1].userId").value("userId2"));

        verify(appSecurityComponent, times(1)).getAuthenticatedUser();
        verify(accountCaSiteContactService, times(1))
            .getAccountsAndCaSiteContacts(user, PagingRequest.builder().pageNumber(0).pageSize(2).build(), searchCriteria);
    }

    @Test
    void getCaSiteContacts_forbidden() throws Exception {
        final AppUser user = AppUser.builder().roleType(RoleTypeConstants.OPERATOR).build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(roleAuthorizationService)
                .evaluate(user,new String[] {RoleTypeConstants.REGULATOR});

        mockMvc.perform(MockMvcRequestBuilders.get(CA_SITE_CONTACT_CONTROLLER_PATH + "?page=0&size=2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        verify(appSecurityComponent, times(1)).getAuthenticatedUser();
        verify(accountCaSiteContactService, never()).getAccountsAndCaSiteContacts(any(), any(), any());
    }

    @Test
    void updateCaSiteContacts() throws Exception {
        final AppUser user = AppUser.builder().roleType(RoleTypeConstants.REGULATOR).build();
        List<AccountContactDTO> accountCASiteContacts = List.of(
                AccountContactDTO.builder().accountId(1L).userId("userId1").build(),
                AccountContactDTO.builder().accountId(2L).userId("userId2").build()
        );

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);

        mockMvc.perform(MockMvcRequestBuilders.post(CA_SITE_CONTACT_CONTROLLER_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountCASiteContacts)))
                .andExpect(status().isNoContent());

        verify(appSecurityComponent, times(1)).getAuthenticatedUser();
        verify(accountCaSiteContactService, times(1)).updateCaSiteContacts(user, accountCASiteContacts);
    }

    @Test
    void updateCaSiteContacts_forbidden() throws Exception {
        final AppUser user = AppUser.builder().roleType(RoleTypeConstants.REGULATOR).build();
        List<AccountContactDTO> accountCASiteContacts = List.of(
                AccountContactDTO.builder().accountId(1L).userId("userId1").build(),
                AccountContactDTO.builder().accountId(2L).userId("userId2").build()
        );

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(appUserAuthorizationService)
                .authorize(user, "updateCaSiteContacts");

        mockMvc.perform(MockMvcRequestBuilders.post(CA_SITE_CONTACT_CONTROLLER_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountCASiteContacts)))
                .andExpect(status().isForbidden());

        verify(appSecurityComponent, times(1)).getAuthenticatedUser();
        verify(accountCaSiteContactService, never()).updateCaSiteContacts(any(), anyList());
    }
}
