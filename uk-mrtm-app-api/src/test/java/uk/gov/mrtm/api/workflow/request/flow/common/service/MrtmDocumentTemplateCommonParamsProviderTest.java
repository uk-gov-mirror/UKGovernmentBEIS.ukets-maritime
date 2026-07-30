package uk.gov.mrtm.api.workflow.request.flow.common.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanIdentifierGenerator;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.MrtmAccountTemplateParams;
import uk.gov.netz.api.account.domain.AccountContactType;
import uk.gov.netz.api.account.service.AccountContactQueryService;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;
import uk.gov.netz.api.documenttemplate.domain.templateparams.AccountTemplateParams;
import uk.gov.netz.api.user.core.service.auth.UserAuthService;
import uk.gov.netz.api.userinfoapi.UserInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MrtmDocumentTemplateCommonParamsProviderTest {
    private static final long ACCOUNT_ID = 1L;

    @InjectMocks
    private MrtmDocumentTemplateCommonParamsProvider cut;

    @Mock
    private UserAuthService userAuthService;
    
    @Mock
    private AccountContactQueryService accountContactQueryService;
    
    @Mock
    private EmissionsMonitoringPlanQueryService empQueryService;
    
    @Mock
    private EmissionsMonitoringPlanIdentifierGenerator generator;

    @Test
    void getPermitReferenceId() {
        String id = "id";
        when(empQueryService.getEmpIdByAccountId(ACCOUNT_ID)).thenReturn(Optional.of(id));
        assertEquals("id", cut.getPermitReferenceId(ACCOUNT_ID));

        verify(generator).generate(ACCOUNT_ID);
        verify(empQueryService).getEmpIdByAccountId(ACCOUNT_ID);
        verifyNoMoreInteractions(empQueryService, generator);
        verifyNoInteractions(accountContactQueryService, userAuthService);
    }

    @Test
    void getPermitReferenceId_when_getEmpIdByAccountId_is_null() {
        String id = "id";
        when(generator.generate(ACCOUNT_ID)).thenReturn(id);
        assertEquals("id", cut.getPermitReferenceId(ACCOUNT_ID));

        verify(empQueryService).getEmpIdByAccountId(ACCOUNT_ID);
        verify(generator).generate(ACCOUNT_ID);
        verifyNoMoreInteractions(empQueryService, generator);
        verifyNoInteractions(accountContactQueryService, userAuthService);
    }

    @Test
    void testGetAccountTemplateParams() {
        String serviceContactId = UUID.randomUUID().toString();
        UserInfoDTO serviceContactUserInfoDTO = UserInfoDTO.builder()
            .userId(serviceContactId)
            .firstName("Foo")
            .lastName("Bar")
            .email("Foo@Bar")
            .build();

        String primaryContactId = UUID.randomUUID().toString();
        UserInfoDTO primaryContactUserInfoDTO = UserInfoDTO.builder()
            .userId(serviceContactId)
            .firstName("John")
            .lastName("Doe")
            .email("John@Doe")
            .build();

        Request request = Request.builder().requestResources(List.of(
        		RequestResource.builder().resourceType(ResourceType.ACCOUNT).resourceId(String.valueOf(ACCOUNT_ID)).build()
        		)).build();
        
        MrtmDocumentTemplateAccountData accountData = MrtmDocumentTemplateAccountData.builder()
        		.name("acc")
        		.competentAuthority(CompetentAuthorityEnum.ENGLAND)
        		.imoNumber("imoNumber")
        		.address("address")
        		.build();
        
        MrtmAccountTemplateParams expected = MrtmAccountTemplateParams.builder()
                .imoNumber(accountData.getImoNumber())
                .name(accountData.getName())
                .competentAuthority(accountData.getCompetentAuthority())
                .location(accountData.getAddress())
                .primaryContact(primaryContactUserInfoDTO.getFullName())
                .primaryContactEmail(primaryContactUserInfoDTO.getEmail())
                .serviceContact(serviceContactUserInfoDTO.getFullName())
                .serviceContactFirstName(serviceContactUserInfoDTO.getFirstName())
                .serviceContactEmail(serviceContactUserInfoDTO.getEmail())
                .build();

        when(accountContactQueryService.findContactByAccountAndContactType(
            ACCOUNT_ID, AccountContactType.SERVICE)).thenReturn(Optional.of(serviceContactId));
        when(userAuthService.getUserByUserId(serviceContactId)).thenReturn(serviceContactUserInfoDTO);

        when(accountContactQueryService.findContactByAccountAndContactType(
            ACCOUNT_ID, AccountContactType.PRIMARY)).thenReturn(Optional.of(primaryContactId));
        when(userAuthService.getUserByUserId(primaryContactId)).thenReturn(primaryContactUserInfoDTO);

        AccountTemplateParams actual =
        		cut.getAccountTemplateParams(request, accountData);

        assertEquals(expected, actual);

        verify(accountContactQueryService).findContactByAccountAndContactType(ACCOUNT_ID, AccountContactType.SERVICE);
        verify(userAuthService).getUserByUserId(serviceContactId);
        verify(accountContactQueryService).findContactByAccountAndContactType(ACCOUNT_ID, AccountContactType.PRIMARY);
        verify(userAuthService).getUserByUserId(primaryContactId);

        verifyNoMoreInteractions(accountContactQueryService, userAuthService);
    }

    @Test
    void testGetAccountTemplateParams_when_no_contact_exists() {
        Request request = Request.builder().requestResources(List.of(
        		RequestResource.builder().resourceType(ResourceType.ACCOUNT).resourceId(String.valueOf(ACCOUNT_ID)).build()
        		)).build();
        
        MrtmDocumentTemplateAccountData accountData = MrtmDocumentTemplateAccountData.builder()
        		.name("acc")
        		.competentAuthority(CompetentAuthorityEnum.ENGLAND)
        		.imoNumber("imoNumber")
        		.address("address")
        		.build();

        MrtmAccountTemplateParams expected = MrtmAccountTemplateParams.builder()
    		.imoNumber(accountData.getImoNumber())
            .name(accountData.getName())
            .competentAuthority(accountData.getCompetentAuthority())
            .location(accountData.getAddress())
            .build();

        when(accountContactQueryService.findContactByAccountAndContactType(
            ACCOUNT_ID, AccountContactType.SERVICE)).thenReturn(Optional.empty());

        when(accountContactQueryService.findContactByAccountAndContactType(
            ACCOUNT_ID, AccountContactType.PRIMARY)).thenReturn(Optional.empty());

        AccountTemplateParams actual =
        		cut.getAccountTemplateParams(request, accountData);

        assertEquals(expected, actual);

        verify(accountContactQueryService).findContactByAccountAndContactType(ACCOUNT_ID, AccountContactType.SERVICE);
        verify(accountContactQueryService).findContactByAccountAndContactType(ACCOUNT_ID, AccountContactType.PRIMARY);

        verifyNoMoreInteractions(accountContactQueryService, userAuthService);
        verifyNoMoreInteractions(userAuthService);
    }
}
