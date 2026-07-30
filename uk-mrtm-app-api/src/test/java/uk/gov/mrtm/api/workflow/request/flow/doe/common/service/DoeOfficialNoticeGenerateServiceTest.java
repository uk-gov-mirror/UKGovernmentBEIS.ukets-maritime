package uk.gov.mrtm.api.workflow.request.flow.doe.common.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmDocumentTemplateAccountDataCollectFromAccountService;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.Doe;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeDeterminationReason;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeDeterminationReasonDetails;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeDeterminationReasonType;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeFeeDetails;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeMaritimeEmissions;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeTotalMaritimeEmissions;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.documenttemplate.service.FileDocumentGenerateServiceDelegator;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


@ExtendWith(MockitoExtension.class)
class DoeOfficialNoticeGenerateServiceTest {

    @InjectMocks
    private DoeOfficialNoticeGenerateService officialNoticeGenerateService;

    @Mock
    private RequestService requestService;

    @Mock
    private RequestAccountContactQueryService requestAccountContactQueryService;

    @Mock
    private DecisionNotificationUsersService decisionNotificationUsersService;

    @Mock
    private DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;

    @Mock
    private FileDocumentGenerateServiceDelegator fileDocumentGenerateServiceDelegator;

    @Mock
    private DoeSubmittedDocumentTemplateWorkflowParamsProvider doeSubmittedDocumentTemplateWorkflowParamsProvider;
    
    @Mock
    private MrtmDocumentTemplateAccountDataCollectFromAccountService accountTemplateDataFromAccountService;

    @Test
    void generateOfficialNotice() {
        String requestId = "REQ-ID";
        String decisionNotificationSignatory = "signatory_user";

        final Doe doe = Doe.builder()
                .maritimeEmissions(DoeMaritimeEmissions.builder()
                        .chargeOperator(true)
                        .feeDetails(DoeFeeDetails.builder()
                                .hourlyRate(BigDecimal.ONE)
                                .totalBillableHours(BigDecimal.TEN)
                                .dueDate(LocalDate.of(2023, 12,5))
                                .comments("comments")
                                .build())
                        .determinationReason(DoeDeterminationReason.builder()
                                .details(DoeDeterminationReasonDetails.builder()
                                    .type(DoeDeterminationReasonType.CORRECTING_NON_MATERIAL_MISSTATEMENT)
                                    .noticeText("noticeText")
                                    .build())
                                .furtherDetails("Further details")
                                .build())
                        .totalMaritimeEmissions(DoeTotalMaritimeEmissions.builder()
                                .totalReportableEmissions(BigDecimal.TEN)
                                .calculationApproach("someCalculationApproach")
                                .determinationType(DoeDeterminationType.MARITIME_EMISSIONS)
                                .lessVoyagesInNorthernIrelandDeduction(BigDecimal.ONE)
                                .surrenderEmissions(BigDecimal.TWO)
                                .build())
                        .build())
                .build();

        DecisionNotification decisionNotification = DecisionNotification.builder()
            .signatory(decisionNotificationSignatory)
            .build();
        DoeRequestPayload requestPayload = DoeRequestPayload.builder()
            .decisionNotification(decisionNotification)
                .doe(doe)
            .build();
		Request request = Request.builder().id(requestId)
				.requestResources(
						List.of(RequestResource.builder().resourceType(ResourceType.ACCOUNT).resourceId("23").build()))
				.payload(requestPayload).build();
        UserInfoDTO accountPrimaryContact = UserInfoDTO.builder().firstName("fn").lastName("ln").email("email").build();
        List<String> ccRecipientsEmails = List.of("emailRecipient1", "emailRecipient2");
        
        MrtmDocumentTemplateAccountData accountData = MrtmDocumentTemplateAccountData.builder().name("accName").build();
        DocumentTemplateParamsSourceData documentTemplateSourceParams =
            DocumentTemplateParamsSourceData.builder()
                .contextActionType(MrtmDocumentTemplateGenerationContextActionType.DOE_SUBMIT)
                .request(request)
                .signatory(decisionNotification.getSignatory())
                .accountPrimaryContact(accountPrimaryContact)
                .toRecipientEmail(accountPrimaryContact.getEmail())
                .ccRecipientsEmails(ccRecipientsEmails)
                .accountData(accountData)
                .build();
        TemplateParams templateParams = TemplateParams.builder().build();
        String filename = "DoE_and_EFSN_Notice.pdf";
        FileInfoDTO officialNoticeFileInfoDTO = FileInfoDTO.builder()
            .name(filename)
            .uuid(UUID.randomUUID().toString())
            .build();
        
        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request)).thenReturn(Optional.of(accountPrimaryContact));
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(ccRecipientsEmails);
        when(documentTemplateOfficialNoticeParamsProvider.constructTemplateParams(documentTemplateSourceParams)).thenReturn(templateParams);
        when(fileDocumentGenerateServiceDelegator
            .generateAndSaveFileDocument(MrtmDocumentTemplateType.DOE_SUBMITTED, templateParams, "DoE_and_EFSN_Notice.pdf"))
            .thenReturn(officialNoticeFileInfoDTO);
        when(accountTemplateDataFromAccountService.collect(request.getAccountId())).thenReturn(accountData);

        //invoke
        officialNoticeGenerateService.generateOfficialNotice(requestId);

        assertThat(requestPayload.getOfficialNotice()).isEqualTo(officialNoticeFileInfoDTO);

        // Verify
        verify(requestService, times(1)).findRequestById(requestId);
        verify(requestAccountContactQueryService, times(1)).getRequestAccountPrimaryContact(request);
        verify(decisionNotificationUsersService, times(1)).findUserEmails(decisionNotification);
        verify(documentTemplateOfficialNoticeParamsProvider, times(1)).constructTemplateParams(documentTemplateSourceParams);
        verify(fileDocumentGenerateServiceDelegator, times(1)).generateAndSaveFileDocument(
            MrtmDocumentTemplateType.DOE_SUBMITTED, templateParams, filename);
        verify(accountTemplateDataFromAccountService, times(1)).collect(request.getAccountId());

    }
}