package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmDocumentTemplateAccountDataCollectFromAccountService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitReviewDecisionDetails;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.documenttemplate.service.FileDocumentGenerateServiceDelegator;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.userinfoapi.UserInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.service.DecisionNotificationUsersService;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestAccountContactQueryService;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateOfficialNoticeParamsProvider;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateParamsSourceData;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.OfficialNoticeSendService;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitOfficialNoticeServiceTest {

    @InjectMocks
    private SiteVisitOfficialNoticeService service;

    @Mock
    private RequestService requestService;
    @Mock
    private DecisionNotificationUsersService decisionNotificationUsersService;
    @Mock
    private RequestAccountContactQueryService requestAccountContactQueryService;
    @Mock
    private DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;
    @Mock
    private FileDocumentGenerateServiceDelegator documentFileGeneratorService;
    @Mock
    private OfficialNoticeSendService officialNoticeSendService;
    @Mock
    private MrtmDocumentTemplateAccountDataCollectFromAccountService templateAccountDataCollectFromAccountService;

    @Test
    void generateApprovedOfficialNotice() {
        String requestId = "requestId";
        UserInfoDTO accountPrimaryContact = mock(UserInfoDTO.class);
        UserInfoDTO serviceContact = mock(UserInfoDTO.class);
        String signatory = "signatory";
        Long accountId = 5L;
        DecisionNotification decisionNotification = DecisionNotification.builder().signatory(signatory).build();
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().decisionNotification(decisionNotification).build();
        Request request = Request.builder()
            .payload(requestPayload)
            .requestResources(
                    List.of(RequestResource
                        .builder()
                        .resourceId(String.valueOf(accountId))
                        .resourceType(ResourceType.ACCOUNT)
                        .build()))
            .build();
        List<String> ccRecipientsEmails = List.of("email");
        MrtmDocumentTemplateAccountData accountData = MrtmDocumentTemplateAccountData.builder()
        		.imoNumber("123")
        		.build();
        DocumentTemplateParamsSourceData documentTemplateParams = DocumentTemplateParamsSourceData.builder()
            .contextActionType(MrtmDocumentTemplateGenerationContextActionType.SITE_VISIT)
            .request(request)
            .signatory(signatory)
            .accountPrimaryContact(accountPrimaryContact)
            .toRecipientEmail(serviceContact.getEmail())
            .ccRecipientsEmails(ccRecipientsEmails)
            .accountData(accountData)
            .build();
        TemplateParams templateParams = mock(TemplateParams.class);
        FileInfoDTO fileInfoDTO = mock(FileInfoDTO.class);
        
        

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request)).thenReturn(Optional.ofNullable(accountPrimaryContact));
        when(requestAccountContactQueryService.getRequestAccountServiceContact(request)).thenReturn(Optional.of(serviceContact));
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(ccRecipientsEmails);
        when(templateAccountDataCollectFromAccountService.collect(accountId)).thenReturn(accountData);
        when(documentTemplateOfficialNoticeParamsProvider
            .constructTemplateParams(documentTemplateParams)).thenReturn(templateParams);
        when(documentFileGeneratorService
            .generateAndSaveFileDocument(MrtmDocumentTemplateType.SITE_VISIT_APPROVED, templateParams, "Virtual_site_visit_letter.pdf"))
            .thenReturn(fileInfoDTO);
        
        service.generateApprovedOfficialNotice(requestId);

        assertThat(requestPayload.getOfficialNotice()).isEqualTo(fileInfoDTO);

        verify(requestService).findRequestById(requestId);
        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);
        verify(requestAccountContactQueryService).getRequestAccountServiceContact(request);
        verify(decisionNotificationUsersService).findUserEmails(decisionNotification);
        verify(documentTemplateOfficialNoticeParamsProvider).constructTemplateParams(documentTemplateParams);
        verify(documentFileGeneratorService)
            .generateAndSaveFileDocument(MrtmDocumentTemplateType.SITE_VISIT_APPROVED, templateParams, "Virtual_site_visit_letter.pdf");
        verify(templateAccountDataCollectFromAccountService).collect(accountId);
        
        verifyNoMoreInteractions(requestService, requestAccountContactQueryService, decisionNotificationUsersService,
            documentTemplateOfficialNoticeParamsProvider, documentFileGeneratorService);
        verifyNoInteractions(officialNoticeSendService);
    }

    @Test
    void generateApprovedOfficialNotice_account_primary_not_found() {
        String requestId = "requestId";
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
            () -> service.generateApprovedOfficialNotice(requestId));

        assertEquals(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND, exception.getErrorCode());

        assertThat(requestPayload.getOfficialNotice()).isNull();

        verify(requestService).findRequestById(requestId);
        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);

        verifyNoMoreInteractions(requestService, requestAccountContactQueryService);
        verifyNoInteractions(decisionNotificationUsersService, officialNoticeSendService,
            documentTemplateOfficialNoticeParamsProvider, documentFileGeneratorService);
    }

    @Test
    void generateApprovedOfficialNotice_account_service_not_found() {
        String requestId = "requestId";
        UserInfoDTO accountPrimaryContact = mock(UserInfoDTO.class);
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request)).thenReturn(Optional.ofNullable(accountPrimaryContact));
        when(requestAccountContactQueryService.getRequestAccountServiceContact(request)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
            () -> service.generateApprovedOfficialNotice(requestId));

        assertEquals(ErrorCode.ACCOUNT_CONTACT_TYPE_SERVICE_CONTACT_NOT_FOUND, exception.getErrorCode());

        assertThat(requestPayload.getOfficialNotice()).isNull();

        verify(requestService).findRequestById(requestId);
        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);
        verify(requestAccountContactQueryService).getRequestAccountServiceContact(request);

        verifyNoMoreInteractions(requestService, requestAccountContactQueryService);
        verifyNoInteractions(decisionNotificationUsersService, officialNoticeSendService,
            documentTemplateOfficialNoticeParamsProvider, documentFileGeneratorService);
    }


    @Test
    void generateRejectedOfficialNotice() {
        String requestId = "requestId";
        UserInfoDTO accountPrimaryContact = mock(UserInfoDTO.class);
        UserInfoDTO serviceContact = mock(UserInfoDTO.class);
        String signatory = "signatory";
        DecisionNotification decisionNotification = DecisionNotification.builder().signatory(signatory).build();
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().decisionNotification(decisionNotification).build();
        Long accountId = 5L;
        Request request = Request.builder()
            .payload(requestPayload)
            .requestResources(
                    List.of(RequestResource
                        .builder()
                        .resourceId(String.valueOf(accountId))
                        .resourceType(ResourceType.ACCOUNT)
                        .build()))
            .build();
        List<String> ccRecipientsEmails = List.of("email");
        MrtmDocumentTemplateAccountData accountData = MrtmDocumentTemplateAccountData.builder()
        		.imoNumber("123")
        		.build();
        DocumentTemplateParamsSourceData documentTemplateParams = DocumentTemplateParamsSourceData.builder()
            .contextActionType(MrtmDocumentTemplateGenerationContextActionType.SITE_VISIT)
            .request(request)
            .signatory(signatory)
            .accountPrimaryContact(accountPrimaryContact)
            .toRecipientEmail(serviceContact.getEmail())
            .ccRecipientsEmails(ccRecipientsEmails)
            .accountData(accountData)
            .build();
        TemplateParams templateParams = mock(TemplateParams.class);
        FileInfoDTO fileInfoDTO = mock(FileInfoDTO.class);
        
        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request)).thenReturn(Optional.ofNullable(accountPrimaryContact));
        when(requestAccountContactQueryService.getRequestAccountServiceContact(request)).thenReturn(Optional.of(serviceContact));
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(ccRecipientsEmails);
        when(documentTemplateOfficialNoticeParamsProvider
            .constructTemplateParams(documentTemplateParams)).thenReturn(templateParams);
        when(documentFileGeneratorService
            .generateAndSaveFileDocument(MrtmDocumentTemplateType.SITE_VISIT_REJECTED, templateParams, "Virtual_site_visit_letter.pdf"))
            .thenReturn(fileInfoDTO);
        when(templateAccountDataCollectFromAccountService.collect(accountId)).thenReturn(accountData);

        service.generateRejectedOfficialNotice(requestId);

        assertThat(requestPayload.getOfficialNotice()).isEqualTo(fileInfoDTO);

        verify(requestService).findRequestById(requestId);
        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);
        verify(requestAccountContactQueryService).getRequestAccountServiceContact(request);
        verify(decisionNotificationUsersService).findUserEmails(decisionNotification);
        verify(documentTemplateOfficialNoticeParamsProvider).constructTemplateParams(documentTemplateParams);
        verify(documentFileGeneratorService)
            .generateAndSaveFileDocument(MrtmDocumentTemplateType.SITE_VISIT_REJECTED, templateParams, "Virtual_site_visit_letter.pdf");
        verify(templateAccountDataCollectFromAccountService).collect(accountId);
        
        verifyNoMoreInteractions(requestService, requestAccountContactQueryService, decisionNotificationUsersService,
            documentTemplateOfficialNoticeParamsProvider, documentFileGeneratorService);
        verifyNoInteractions(officialNoticeSendService);
    }

    @Test
    void generateRejectedOfficialNotice_account_primary_not_found() {
        String requestId = "requestId";
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
            () -> service.generateRejectedOfficialNotice(requestId));

        assertEquals(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND, exception.getErrorCode());

        assertThat(requestPayload.getOfficialNotice()).isNull();

        verify(requestService).findRequestById(requestId);
        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);

        verifyNoMoreInteractions(requestService, requestAccountContactQueryService);
        verifyNoInteractions(decisionNotificationUsersService, officialNoticeSendService,
            documentTemplateOfficialNoticeParamsProvider, documentFileGeneratorService);
    }

    @Test
    void generateRejectedOfficialNotice_account_service_not_found() {
        String requestId = "requestId";
        UserInfoDTO accountPrimaryContact = mock(UserInfoDTO.class);
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request)).thenReturn(Optional.ofNullable(accountPrimaryContact));
        when(requestAccountContactQueryService.getRequestAccountServiceContact(request)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
            () -> service.generateRejectedOfficialNotice(requestId));

        assertEquals(ErrorCode.ACCOUNT_CONTACT_TYPE_SERVICE_CONTACT_NOT_FOUND, exception.getErrorCode());

        assertThat(requestPayload.getOfficialNotice()).isNull();

        verify(requestService).findRequestById(requestId);
        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);
        verify(requestAccountContactQueryService).getRequestAccountServiceContact(request);

        verifyNoMoreInteractions(requestService, requestAccountContactQueryService);
        verifyNoInteractions(decisionNotificationUsersService, officialNoticeSendService,
            documentTemplateOfficialNoticeParamsProvider, documentFileGeneratorService);
    }

    @Test
    void doGenerateOfficialNoticeWithoutSave() {
        UserInfoDTO accountPrimaryContact = mock(UserInfoDTO.class);
        UserInfoDTO serviceContact = mock(UserInfoDTO.class);
        String signatory = "signatory";
        DecisionNotification decisionNotification = DecisionNotification.builder().signatory(signatory).build();
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().decisionNotification(decisionNotification).build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();
        List<String> ccRecipientsEmails = List.of("email");
        DocumentTemplateParamsSourceData documentTemplateParams = DocumentTemplateParamsSourceData.builder()
            .contextActionType(MrtmDocumentTemplateGenerationContextActionType.SITE_VISIT)
            .request(request)
            .signatory(signatory)
            .accountPrimaryContact(accountPrimaryContact)
            .toRecipientEmail(serviceContact.getEmail())
            .ccRecipientsEmails(ccRecipientsEmails).build();
        TemplateParams templateParams = mock(TemplateParams.class);
        FileDTO fileDTO = mock(FileDTO.class);

        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request)).thenReturn(Optional.ofNullable(accountPrimaryContact));
        when(requestAccountContactQueryService.getRequestAccountServiceContact(request)).thenReturn(Optional.of(serviceContact));
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(ccRecipientsEmails);
        when(documentTemplateOfficialNoticeParamsProvider
            .constructTemplateParams(documentTemplateParams)).thenReturn(templateParams);
        when(documentFileGeneratorService
            .generateFileDocument(MrtmDocumentTemplateType.SITE_VISIT_APPROVED, templateParams, "Virtual_site_visit_letter.pdf"))
            .thenReturn(fileDTO);

        FileDTO result = service.doGenerateOfficialNoticeWithoutSave(
            request,
            MrtmDocumentTemplateType.SITE_VISIT_APPROVED,
            "Virtual_site_visit_letter.pdf");

        assertThat(result).isEqualTo(fileDTO);
        assertThat(requestPayload.getOfficialNotice()).isNull();

        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);
        verify(requestAccountContactQueryService).getRequestAccountServiceContact(request);
        verify(decisionNotificationUsersService).findUserEmails(decisionNotification);
        verify(documentTemplateOfficialNoticeParamsProvider).constructTemplateParams(documentTemplateParams);
        verify(documentFileGeneratorService)
            .generateFileDocument(MrtmDocumentTemplateType.SITE_VISIT_APPROVED, templateParams, "Virtual_site_visit_letter.pdf");

        verifyNoMoreInteractions(requestAccountContactQueryService, decisionNotificationUsersService,
            documentTemplateOfficialNoticeParamsProvider, documentFileGeneratorService);
        verifyNoInteractions(requestService, officialNoticeSendService);
    }

    @Test
    void doGenerateOfficialNoticeWithoutSave_withReviewDecision_usesServiceContactAndOfficialNoticeSummary() {
        UserInfoDTO accountPrimaryContact = mock(UserInfoDTO.class);
        UserInfoDTO serviceContact = mock(UserInfoDTO.class);
        String signatory = "signatory";
        String serviceContactEmail = "service@example.com";
        String officialNoticeSummary = "Accepted summary";
        DecisionNotification decisionNotification = DecisionNotification.builder().signatory(signatory).build();
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.ACCEPTED)
            .details(SiteVisitReviewDecisionDetails.builder().summary(officialNoticeSummary).build())
            .build();
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();
        List<String> ccRecipientsEmails = List.of("email");
        DocumentTemplateParamsSourceData documentTemplateParams = DocumentTemplateParamsSourceData.builder()
            .request(request)
            .signatory(signatory)
            .accountPrimaryContact(accountPrimaryContact)
            .toRecipientEmail(serviceContactEmail)
            .ccRecipientsEmails(ccRecipientsEmails).build();
        TemplateParams templateParams = TemplateParams.builder().params(new HashMap<>()).build();
        FileDTO fileDTO = mock(FileDTO.class);
        ArgumentCaptor<TemplateParams> templateParamsCaptor = ArgumentCaptor.forClass(TemplateParams.class);

        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request))
            .thenReturn(Optional.ofNullable(accountPrimaryContact));
        when(requestAccountContactQueryService.getRequestAccountServiceContact(request))
            .thenReturn(Optional.of(serviceContact));
        when(serviceContact.getEmail()).thenReturn(serviceContactEmail);
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(ccRecipientsEmails);
        when(documentTemplateOfficialNoticeParamsProvider.constructTemplateParams(documentTemplateParams))
            .thenReturn(templateParams);
        when(documentFileGeneratorService.generateFileDocument(
            eq(MrtmDocumentTemplateType.SITE_VISIT_APPROVED), templateParamsCaptor.capture(), eq("Virtual_site_visit_letter.pdf")))
            .thenReturn(fileDTO);

        FileDTO result = service.doGenerateOfficialNoticeWithoutSave(
            request,
            reviewDecision,
            decisionNotification,
            MrtmDocumentTemplateType.SITE_VISIT_APPROVED,
            "Virtual_site_visit_letter.pdf");

        assertThat(result).isEqualTo(fileDTO);
        assertThat(requestPayload.getReviewDecision()).isNull();
        assertThat(requestPayload.getDecisionNotification()).isNull();
        assertThat(templateParamsCaptor.getValue().getParams()).containsEntry("officialNotice", officialNoticeSummary);

        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);
        verify(requestAccountContactQueryService).getRequestAccountServiceContact(request);
        verify(decisionNotificationUsersService).findUserEmails(decisionNotification);
        verify(documentTemplateOfficialNoticeParamsProvider).constructTemplateParams(documentTemplateParams);
        verify(documentFileGeneratorService)
            .generateFileDocument(MrtmDocumentTemplateType.SITE_VISIT_APPROVED, templateParams, "Virtual_site_visit_letter.pdf");

        verifyNoMoreInteractions(requestAccountContactQueryService, decisionNotificationUsersService,
            documentTemplateOfficialNoticeParamsProvider, documentFileGeneratorService);
        verifyNoInteractions(requestService, officialNoticeSendService);
    }

    @Test
    void doGenerateOfficialNoticeWithoutSave_withReviewDecision_serviceContactNotFound() {
        UserInfoDTO accountPrimaryContact = mock(UserInfoDTO.class);
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().build();
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.ACCEPTED)
            .details(SiteVisitReviewDecisionDetails.builder().summary("summary").build())
            .build();
        DecisionNotification decisionNotification = DecisionNotification.builder().build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();

        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request))
            .thenReturn(Optional.ofNullable(accountPrimaryContact));
        when(requestAccountContactQueryService.getRequestAccountServiceContact(request))
            .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> service.doGenerateOfficialNoticeWithoutSave(
            request,
            reviewDecision,
            decisionNotification,
            MrtmDocumentTemplateType.SITE_VISIT_APPROVED,
            "Virtual_site_visit_letter.pdf"));

        assertEquals(ErrorCode.ACCOUNT_CONTACT_TYPE_SERVICE_CONTACT_NOT_FOUND, exception.getErrorCode());
        assertThat(requestPayload.getReviewDecision()).isNull();
        assertThat(requestPayload.getDecisionNotification()).isNull();

        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);
        verify(requestAccountContactQueryService).getRequestAccountServiceContact(request);

        verifyNoMoreInteractions(requestAccountContactQueryService);
        verifyNoInteractions(requestService, decisionNotificationUsersService, officialNoticeSendService,
            documentTemplateOfficialNoticeParamsProvider, documentFileGeneratorService);
    }

    @Test
    void sendOfficialNotice() {
        String requestId = "requestId";
        DecisionNotification decisionNotification = mock(DecisionNotification.class);
        FileInfoDTO fileInfoDTO = mock(FileInfoDTO.class);
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder()
            .decisionNotification(decisionNotification)
            .officialNotice(fileInfoDTO)
            .build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();
        List<String> ccRecipientsEmails = List.of("email");

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(ccRecipientsEmails);

        service.sendOfficialNotice(requestId);

        assertThat(requestPayload.getOfficialNotice()).isEqualTo(fileInfoDTO);

        verify(requestService).findRequestById(requestId);
        verify(decisionNotificationUsersService).findUserEmails(decisionNotification);
        verify(officialNoticeSendService).sendOfficialNotice(List.of(fileInfoDTO), request, ccRecipientsEmails);

        verifyNoMoreInteractions(requestService, officialNoticeSendService, decisionNotificationUsersService);
        verifyNoInteractions(requestAccountContactQueryService, documentTemplateOfficialNoticeParamsProvider,
            documentFileGeneratorService);
    }
}
