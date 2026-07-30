package uk.gov.mrtm.api.workflow.request.flow.doe.common.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeRequestPayload;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.competentauthority.CompetentAuthorityDTO;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;
import uk.gov.netz.api.competentauthority.CompetentAuthorityService;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.files.documents.service.storage.FileDocumentStorageService;
import uk.gov.netz.api.notificationapi.mail.domain.EmailData;
import uk.gov.netz.api.notificationapi.mail.domain.EmailNotificationTemplateData;
import uk.gov.netz.api.notificationapi.mail.service.NotificationEmailService;
import uk.gov.netz.api.userinfoapi.UserInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.domain.RequestType;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.service.DecisionNotificationUsersService;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestAccountContactQueryService;
import uk.gov.netz.api.workflow.utils.NotificationTemplateConstants;
import uk.gov.netz.api.workflow.utils.NotificationTemplateName;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DoeOfficialNoticeSendServiceTest {

    @InjectMocks
    private DoeOfficialNoticeSendService officialNoticeSendService;

    @Mock
    private RequestService requestService;

    @Mock
    private RequestAccountContactQueryService requestAccountContactQueryService;

    @Mock
    private DecisionNotificationUsersService decisionNotificationUsersService;

    @Mock
    private NotificationEmailService notificationEmailService;

    @Mock
    private FileDocumentStorageService fileDocumentStorageService;

    @Mock
    private CompetentAuthorityService competentAuthorityService;

    @Test
    void sendOfficialNotice() {
        String requestId = "REQ-ID";
        String decisionNotificationSignatory = "signatory_user";
        DecisionNotification decisionNotification = DecisionNotification.builder()
            .signatory(decisionNotificationSignatory)
            .build();
        FileInfoDTO officialNoticeFileInfoDTO = FileInfoDTO.builder()
            .name("DoE_and_EFSN_Notice.pdf")
            .uuid(UUID.randomUUID().toString())
            .build();
        DoeRequestPayload requestPayload = DoeRequestPayload.builder()
            .decisionNotification(decisionNotification)
            .officialNotice(officialNoticeFileInfoDTO)
            .build();
        Request request = Request.builder()
            .id(requestId)
            .payload(requestPayload)
                .requestResources(List.of(
                        RequestResource.builder()
                                .resourceType(ResourceType.CA)
                                .resourceId(CompetentAuthorityEnum.ENGLAND.name())
                                .build())
                )
            .type(RequestType.builder().code(MrtmRequestType.DOE).build())
            .build();
        UserInfoDTO accountPrimaryContact = UserInfoDTO.builder().firstName("fn").lastName("ln").email("email").build();
        UserInfoDTO accountServiceContact = UserInfoDTO.builder().firstName("fn2").lastName("ln2").email("email2").build();
        List<String> toRecipientEmails = List.of(accountPrimaryContact.getEmail(), accountServiceContact.getEmail());
        List<String> ccRecipientsEmails = List.of("emailRecipient1", "emailRecipient2");
        FileDTO officialNoticeFileDTO = FileDTO.builder().fileContent("content".getBytes()).build();
        CompetentAuthorityDTO competentAuthority = CompetentAuthorityDTO.builder()
            .id(CompetentAuthorityEnum.ENGLAND)
            .name("competentAuthority")
            .email("competent@authority.com")
            .build();

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request)).thenReturn(Optional.of(accountPrimaryContact));
        when(requestAccountContactQueryService.getRequestAccountServiceContact(request)).thenReturn(Optional.of(accountServiceContact));
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(ccRecipientsEmails);
        when(fileDocumentStorageService.getFileDTO(officialNoticeFileInfoDTO.getUuid())).thenReturn(officialNoticeFileDTO);
        when(competentAuthorityService.getCompetentAuthorityDTO(CompetentAuthorityEnum.ENGLAND)).thenReturn(competentAuthority);

        //invoke
        officialNoticeSendService.sendOfficialNotice(requestId);

        verify(requestService, times(1)).findRequestById(requestId);
        verify(requestAccountContactQueryService, times(1)).getRequestAccountPrimaryContact(request);
        verify(requestAccountContactQueryService, times(1)).getRequestAccountServiceContact(request);
        verify(decisionNotificationUsersService, times(1)).findUserEmails(decisionNotification);
        verify(fileDocumentStorageService, times(1)).getFileDTO(officialNoticeFileInfoDTO.getUuid());
        verify(competentAuthorityService, times(1)).getCompetentAuthorityDTO(CompetentAuthorityEnum.ENGLAND);

        ArgumentCaptor<EmailData> emailDataCaptor = ArgumentCaptor.forClass(EmailData.class);
        verify(notificationEmailService, times(1)).notifyRecipients(emailDataCaptor.capture(),
            Mockito.eq(toRecipientEmails), Mockito.eq((ccRecipientsEmails)));
        EmailData emailDataCaptured = emailDataCaptor.getValue();
        assertThat(emailDataCaptured).isEqualTo(EmailData.builder()
            .notificationTemplateData(EmailNotificationTemplateData.builder()
                .templateName(NotificationTemplateName.GENERIC_EMAIL)
                .competentAuthority(CompetentAuthorityEnum.ENGLAND)
                .templateParams(Map.of(
                    NotificationTemplateConstants.ACCOUNT_PRIMARY_CONTACT, accountPrimaryContact.getFullName(),
                    NotificationTemplateConstants.ACCOUNT_PRIMARY_CONTACT_FIRST_NAME, accountPrimaryContact.getFirstName(),
                    NotificationTemplateConstants.ACCOUNT_SERVICE_CONTACT, accountServiceContact.getFullName(),
                    NotificationTemplateConstants.ACCOUNT_SERVICE_CONTACT_FIRST_NAME, accountServiceContact.getFirstName(),
                    NotificationTemplateConstants.COMPETENT_AUTHORITY_EMAIL, competentAuthority.getEmail(),
                    NotificationTemplateConstants.COMPETENT_AUTHORITY_NAME, competentAuthority.getName()
                ))
                .build())
            .attachments(Map.of(officialNoticeFileInfoDTO.getName(), officialNoticeFileDTO.getFileContent())).build());
    }

    @Test
    void sendOfficialNotice_nor_primary_contact_neither_other_users_selected_to_be_notified() {
        String requestId = "REQ-ID";
        String decisionNotificationSignatory = "signatory_user";
        DecisionNotification decisionNotification = DecisionNotification.builder()
            .signatory(decisionNotificationSignatory)
            .build();
        FileInfoDTO officialNoticeFileInfoDTO = FileInfoDTO.builder()
            .name("DoE_and_EFSN_Notice.pdf")
            .uuid(UUID.randomUUID().toString())
            .build();
        DoeRequestPayload requestPayload = DoeRequestPayload.builder()
            .decisionNotification(decisionNotification)
            .officialNotice(officialNoticeFileInfoDTO)
            .build();
        Request request = Request.builder()
            .id(requestId)
            .payload(requestPayload)
            .type(RequestType.builder().code(MrtmRequestType.DOE).build())
            .build();

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request)).thenReturn(Optional.empty());
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(Collections.emptyList());

        //invoke
        officialNoticeSendService.sendOfficialNotice(requestId);

        verify(requestService, times(1)).findRequestById(requestId);
        verify(requestAccountContactQueryService, times(1)).getRequestAccountPrimaryContact(request);
        verify(decisionNotificationUsersService, times(1)).findUserEmails(decisionNotification);

        verifyNoMoreInteractions(requestAccountContactQueryService);
        verifyNoInteractions(fileDocumentStorageService);
        verifyNoInteractions(notificationEmailService);
        verifyNoInteractions(competentAuthorityService);
    }

    @Test
    void sendOfficialNotice_no_primary_contact_exists_but_other_users_selected_to_be_notified() {
        String requestId = "REQ-ID";
        String decisionNotificationSignatory = "signatory_user";
        Long externalContact = 1L;
        DecisionNotification decisionNotification = DecisionNotification.builder()
            .signatory(decisionNotificationSignatory)
            .externalContacts(Set.of(externalContact))
            .build();
        FileInfoDTO officialNoticeFileInfoDTO = FileInfoDTO.builder()
            .name("DoE_and_EFSN_Notice.pdf")
            .uuid(UUID.randomUUID().toString())
            .build();
        DoeRequestPayload requestPayload = DoeRequestPayload.builder()
            .decisionNotification(decisionNotification)
            .officialNotice(officialNoticeFileInfoDTO)
            .build();
        Request request = Request.builder()
                .id(requestId)
                .payload(requestPayload)
                .requestResources(List.of(
                        RequestResource.builder()
                                .resourceType(ResourceType.CA)
                                .resourceId(CompetentAuthorityEnum.WALES.name())
                                .build())
                )
                .type(RequestType.builder().code(MrtmRequestType.DOE).build())
                .build();
        List<String> ccRecipientsEmails = List.of("emailRecipient1");
        FileDTO officialNoticeFileDTO = FileDTO.builder().fileContent("content".getBytes()).build();
        CompetentAuthorityDTO competentAuthority = CompetentAuthorityDTO.builder()
            .id(CompetentAuthorityEnum.WALES)
            .name("competentAuthority")
            .email("competent@authority.com")
            .build();

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request)).thenReturn(Optional.empty());
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(ccRecipientsEmails);
        when(fileDocumentStorageService.getFileDTO(officialNoticeFileInfoDTO.getUuid())).thenReturn(officialNoticeFileDTO);
        when(competentAuthorityService.getCompetentAuthorityDTO(CompetentAuthorityEnum.WALES)).thenReturn(competentAuthority);

        //invoke
        officialNoticeSendService.sendOfficialNotice(requestId);

        verify(requestService, times(1)).findRequestById(requestId);
        verify(requestAccountContactQueryService, times(1)).getRequestAccountPrimaryContact(request);
        verify(decisionNotificationUsersService, times(1)).findUserEmails(decisionNotification);
        verify(fileDocumentStorageService, times(1)).getFileDTO(officialNoticeFileInfoDTO.getUuid());
        verify(competentAuthorityService, times(1)).getCompetentAuthorityDTO(CompetentAuthorityEnum.WALES);

        ArgumentCaptor<EmailData> emailDataCaptor = ArgumentCaptor.forClass(EmailData.class);
        verify(notificationEmailService, times(1))
            .notifyRecipients(emailDataCaptor.capture(), Mockito.eq(Collections.emptyList()), Mockito.eq((ccRecipientsEmails)));
        EmailData emailDataCaptured = emailDataCaptor.getValue();
        assertThat(emailDataCaptured).isEqualTo(EmailData.builder()
            .notificationTemplateData(EmailNotificationTemplateData.builder()
                .templateName(NotificationTemplateName.GENERIC_EMAIL)
                .competentAuthority(CompetentAuthorityEnum.WALES)
                .templateParams(Map.of(
                    NotificationTemplateConstants.COMPETENT_AUTHORITY_EMAIL, competentAuthority.getEmail(),
                    NotificationTemplateConstants.COMPETENT_AUTHORITY_NAME, competentAuthority.getName()
                ))
                .build())
            .attachments(Map.of(officialNoticeFileInfoDTO.getName(), officialNoticeFileDTO.getFileContent())).build());

        verifyNoMoreInteractions(requestAccountContactQueryService);
    }
}