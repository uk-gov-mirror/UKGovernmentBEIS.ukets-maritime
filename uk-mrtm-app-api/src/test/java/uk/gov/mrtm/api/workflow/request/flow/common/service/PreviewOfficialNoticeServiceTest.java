package uk.gov.mrtm.api.workflow.request.flow.common.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.userinfoapi.UserInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.service.DecisionNotificationUsersService;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestAccountContactQueryService;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateOfficialNoticeParamsProvider;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateParamsSourceData;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PreviewOfficialNoticeServiceTest {

    @InjectMocks
    private PreviewOfficialNoticeService service;

    @Mock
    private RequestAccountContactQueryService requestAccountContactQueryService;

    @Mock
    private DecisionNotificationUsersService decisionNotificationUsersService;
    
    @Mock
    private MrtmDocumentTemplateAccountDataCollectFromAccountService templateAccountDataCollectFromAccountService;

    @Mock
    private DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;

    @Test
    void generateCommonParams() {
        Long accountId = 1L;
        List<String> ccEmails = List.of("cc1@email", "cc2@email");
        UserInfoDTO accountPrimaryContact = UserInfoDTO.builder().email("account@Primary").build();
        DecisionNotification decisionNotification = DecisionNotification.builder().signatory("signatory").build();
        TemplateParams expectedTemplateParams = mock(TemplateParams.class);
        Request request = Request.builder().
            requestResources(
                List.of(RequestResource
                    .builder()
                    .resourceId(String.valueOf(accountId))
                    .resourceType(ResourceType.ACCOUNT)
                    .build()))
            .build();
        
        MrtmDocumentTemplateAccountData accountData = MrtmDocumentTemplateAccountData.builder()
        		.imoNumber("123")
        		.build();

        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request))
            .thenReturn(Optional.of(accountPrimaryContact));
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(ccEmails);
        when(templateAccountDataCollectFromAccountService.collect(accountId)).thenReturn(accountData);
        when(documentTemplateOfficialNoticeParamsProvider.constructTemplateParams(DocumentTemplateParamsSourceData.builder()
            .request(request)
            .signatory(decisionNotification.getSignatory())
            .accountPrimaryContact(accountPrimaryContact)
            .toRecipientEmail(accountPrimaryContact.getEmail())
            .ccRecipientsEmails(ccEmails)
            .accountData(accountData)
            .build())).thenReturn(expectedTemplateParams);

        TemplateParams actualTemplateParams = service.generateCommonParams(request, decisionNotification);
        assertEquals(expectedTemplateParams, actualTemplateParams);

        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);
        verify(decisionNotificationUsersService).findUserEmails(decisionNotification);
        verify(templateAccountDataCollectFromAccountService).collect(accountId);
        verify(documentTemplateOfficialNoticeParamsProvider).constructTemplateParams(DocumentTemplateParamsSourceData.builder()
            .request(request)
            .signatory(decisionNotification.getSignatory())
            .accountPrimaryContact(accountPrimaryContact)
            .toRecipientEmail(accountPrimaryContact.getEmail())
            .ccRecipientsEmails(ccEmails)
            .accountData(accountData)
            .build());
        verifyNoMoreInteractions(expectedTemplateParams, requestAccountContactQueryService,
            decisionNotificationUsersService, documentTemplateOfficialNoticeParamsProvider);
    }

    @Test
    void generateCommonParams_throws_exception_when_primary_contact_not_found() {
        Request request = mock(Request.class);
        BusinessException exception = assertThrows(BusinessException.class,
            () -> service.generateCommonParams(request, null));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND);

        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);
        verifyNoMoreInteractions(requestAccountContactQueryService);
        verifyNoInteractions(decisionNotificationUsersService, documentTemplateOfficialNoticeParamsProvider);
    }

}