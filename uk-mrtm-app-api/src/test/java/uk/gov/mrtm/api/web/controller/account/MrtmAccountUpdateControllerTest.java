package uk.gov.mrtm.api.web.controller.account;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.aop.framework.AopProxy;
import org.springframework.aop.framework.DefaultAopProxyFactory;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import uk.gov.mrtm.api.account.domain.dto.MrtmAccountUpdateDTO;
import uk.gov.mrtm.api.account.service.MrtmAccountUpdateService;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;
import uk.gov.mrtm.api.web.config.AppUserArgumentResolver;
import uk.gov.mrtm.api.web.controller.exception.ExceptionControllerAdvice;
import uk.gov.netz.api.security.AppSecurityComponent;
import uk.gov.netz.api.security.AuthorizationAspectUserResolver;
import uk.gov.netz.api.security.AuthorizedAspect;
import uk.gov.netz.api.security.AuthorizedRoleAspect;
import uk.gov.netz.api.authorization.core.domain.AppAuthority;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.authorization.rules.services.AppUserAuthorizationService;
import uk.gov.netz.api.authorization.rules.services.RoleAuthorizationService;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MrtmAccountUpdateControllerTest {

    private static final String CONTROLLER_PATH = "/v1.0/mrtm/accounts";

    @InjectMocks
    private MrtmAccountUpdateController controller;

    @Mock
    private MrtmAccountUpdateService mrtmAccountUpdateService;

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
        controller = (MrtmAccountUpdateController) aopProxy.getProxy();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new AppUserArgumentResolver(appSecurityComponent))
                .setControllerAdvice(new ExceptionControllerAdvice())
                .build();
    }

    @Test
    void updateMrtmAccount() throws Exception {
        Long accountId = 1L;
        String accountName = "accountName";
        final AddressStateDTO addressStateDTO = createAddressDTO();
        AppUser appUser = createUser();
        MrtmAccountUpdateDTO mrtmAccountUpdateDTO = createMrtmAccountUpdateDTO(accountName, addressStateDTO);

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);

        mockMvc.perform(MockMvcRequestBuilders
                        .put(CONTROLLER_PATH + "/" + accountId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mrtmAccountUpdateDTO)))
                .andExpect(status().isNoContent());

        verify(appSecurityComponent).getAuthenticatedUser();
        verify(mrtmAccountUpdateService).updateMaritimeAccount(accountId, mrtmAccountUpdateDTO, appUser);
    }


    @Test
    void updateMaritimeAccount_forbidden() throws Exception {
        Long accountId = 1L;
        String accountName = "accountName";
        final AddressStateDTO addressStateDTO = createAddressDTO();
        AppUser appUser = createUser();
        MrtmAccountUpdateDTO mrtmAccountUpdateDTO = createMrtmAccountUpdateDTO(accountName, addressStateDTO);

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);

        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(appUserAuthorizationService)
                .authorize(appUser, "updateMaritimeAccount", String.valueOf(accountId), null, null);

        mockMvc.perform(MockMvcRequestBuilders
                        .put(CONTROLLER_PATH + "/" + accountId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mrtmAccountUpdateDTO)))
                .andExpect(status().isForbidden());

        verify(mrtmAccountUpdateService, never()).updateMaritimeAccount(accountId, mrtmAccountUpdateDTO, appUser);
    }

    private AppUser createUser() {
        return AppUser.builder()
                .userId("authUserId")
                .authorities(List.of(AppAuthority.builder().competentAuthority(CompetentAuthorityEnum.SCOTLAND).build()))
                .build();
    }

    private AddressStateDTO createAddressDTO() {
        return AddressStateDTO.builder()
                .line1("line1")
                .line2("line2")
                .city("city")
                .country("country")
                .postcode("postcode")
                .state("state")
                .build();
    }

    private MrtmAccountUpdateDTO createMrtmAccountUpdateDTO(String accountName, AddressStateDTO addressStateDTO) {
        return MrtmAccountUpdateDTO.builder()
                .name(accountName)
                .address(addressStateDTO)
                .sopId(100L)
                .firstMaritimeActivityDate(LocalDate.of(2026,4, 26))
                .reason("Update reason")
                .build();
    }
}
