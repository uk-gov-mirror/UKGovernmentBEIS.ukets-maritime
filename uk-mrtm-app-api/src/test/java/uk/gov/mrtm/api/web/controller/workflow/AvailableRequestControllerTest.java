package uk.gov.mrtm.api.web.controller.workflow;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.aop.framework.AopProxy;
import org.springframework.aop.framework.DefaultAopProxyFactory;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.core.service.MrtmAvailableRequestService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.authorization.rules.services.AppUserAuthorizationService;
import uk.gov.mrtm.api.web.config.AppUserArgumentResolver;
import uk.gov.mrtm.api.web.controller.exception.ExceptionControllerAdvice;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.security.AppSecurityComponent;
import uk.gov.netz.api.security.AuthorizationAspectUserResolver;
import uk.gov.netz.api.security.AuthorizedAspect;
import uk.gov.netz.api.workflow.request.core.service.AvailableRequestService;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestCreateValidationResult;

import java.time.Year;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AvailableRequestControllerTest {

    private static final String BASE_PATH = "/v1.0/requests/available-workflows";

    private MockMvc mockMvc;

    @InjectMocks
    private AvailableRequestController controller;

    @Mock
    private AppSecurityComponent appSecurityComponent;

    @Mock
    private AppUserAuthorizationService appUserAuthorizationService;

    @Mock
    private AvailableRequestService availableRequestService;

    @Mock
    private MrtmAvailableRequestService mrtmAvailableRequestService;

    @BeforeEach
    public void setUp() {

        AuthorizationAspectUserResolver authorizationAspectUserResolver = new AuthorizationAspectUserResolver(appSecurityComponent);
        AuthorizedAspect aspect = new AuthorizedAspect(appUserAuthorizationService, authorizationAspectUserResolver);

        AspectJProxyFactory aspectJProxyFactory = new AspectJProxyFactory(controller);
        aspectJProxyFactory.addAspect(aspect);

        DefaultAopProxyFactory proxyFactory = new DefaultAopProxyFactory();
        AopProxy aopProxy = proxyFactory.createAopProxy(aspectJProxyFactory);

        controller = (AvailableRequestController) aopProxy.getProxy();

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new AppUserArgumentResolver(appSecurityComponent))
                .setControllerAdvice(new ExceptionControllerAdvice())
                .build();
    }

    @Test
    void getAvailableWorkflows() throws Exception {
        final String resourceId = "1";
        final String resourceType = "ACCOUNT";
        final AppUser appUser = AppUser.builder().userId("id").build();
        final Map<String, RequestCreateValidationResult> results =
                Map.of("DUMMY_REQUEST_CREATE_ACTION_TYPE",
                        RequestCreateValidationResult.builder().valid(true).build());

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);
        when(availableRequestService.getAvailableWorkflows(resourceId, resourceType, appUser)).thenReturn(results);

        mockMvc.perform(MockMvcRequestBuilders.get(BASE_PATH + "/" + resourceType + "/" + resourceId))
                .andExpect(status().isOk())
                .andExpect(content().string("{\"DUMMY_REQUEST_CREATE_ACTION_TYPE\":{\"valid\":true}}"));

        verify(availableRequestService, times(1)).getAvailableWorkflows(resourceId, resourceType, appUser);
        verifyNoInteractions(mrtmAvailableRequestService);
        verifyNoMoreInteractions(availableRequestService);
    }

    @Test
    void getAvailableWorkflows_forbidden() throws Exception {
        final String resourceId = "1";
        final String resourceType = "ACCOUNT";
        final AppUser user = AppUser.builder().userId("userId").build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
            .when(appUserAuthorizationService)
            .authorize(user, "getAvailableWorkflows", Long.toString(1L), ResourceType.ACCOUNT, null);

        mockMvc.perform(MockMvcRequestBuilders.get(BASE_PATH + "/" + resourceType + "/" + resourceId))
            .andExpect(status().isForbidden());

        verifyNoInteractions(mrtmAvailableRequestService, availableRequestService);
    }

    @Test
    void getAvailableAerWorkflows() throws Exception {
        final String requestId = "MAR-1";
        final AppUser appUser = AppUser.builder().userId("id").build();
        final Map<String, RequestCreateValidationResult> results =
                Map.of(MrtmRequestType.AER,
                        RequestCreateValidationResult.builder().valid(true).build());

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);
        when(mrtmAvailableRequestService.getAvailableAerWorkflows(requestId, appUser)).thenReturn(results);

        mockMvc.perform(MockMvcRequestBuilders.get(BASE_PATH + "/reporting/aer/" + requestId))
                .andExpect(status().isOk())
                .andExpect(content().string("{\"AER\":{\"valid\":true}}"));

        verify(mrtmAvailableRequestService, times(1)).getAvailableAerWorkflows(requestId, appUser);
        verifyNoInteractions(availableRequestService);
        verifyNoMoreInteractions(mrtmAvailableRequestService);
    }

    @Test
    void getAvailableAerWorkflows_forbidden() throws Exception {
        final String requestId = "MAR-1";
        final AppUser appUser = AppUser.builder().userId("id").build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(appUserAuthorizationService)
                .authorize(appUser, "getAvailableAerWorkflows", requestId, null,  null);

        mockMvc.perform(MockMvcRequestBuilders.get(BASE_PATH + "/" + "/reporting/aer/" +  requestId))
                .andExpect(status().isForbidden());

        verifyNoInteractions(availableRequestService, mrtmAvailableRequestService);
    }

    @Test
    void getAvailableSiteVisitWorkflows() throws Exception {
        final long accountId = 1L;
        final AppUser appUser = AppUser.builder().userId("id").build();
        final Map<Year, RequestCreateValidationResult> results =
            Map.of(Year.of(2026),
                RequestCreateValidationResult.builder().valid(true).build());

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);
        when(mrtmAvailableRequestService.getAvailableSiteVisitWorkflows(accountId)).thenReturn(results);

        mockMvc.perform(MockMvcRequestBuilders.get(BASE_PATH + "/site-visit/" + accountId))
            .andExpect(status().isOk())
            .andExpect(content().string("{\"2026\":{\"valid\":true}}"));

        verify(mrtmAvailableRequestService, times(1)).getAvailableSiteVisitWorkflows(accountId);
        verifyNoInteractions(availableRequestService);
        verifyNoMoreInteractions(mrtmAvailableRequestService);
    }

    @Test
    void getAvailableSiteVisitWorkflows_forbidden() throws Exception {
        final long accountId = 1L;
        final AppUser appUser = AppUser.builder().userId("id").build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
            .when(appUserAuthorizationService)
            .authorize(appUser, "getAvailableSiteVisitWorkflows", String.valueOf(accountId), null,  null);

        mockMvc.perform(MockMvcRequestBuilders.get(BASE_PATH + "/site-visit/" +  accountId))
            .andExpect(status().isForbidden());

        verifyNoInteractions(availableRequestService, mrtmAvailableRequestService);
    }
}
