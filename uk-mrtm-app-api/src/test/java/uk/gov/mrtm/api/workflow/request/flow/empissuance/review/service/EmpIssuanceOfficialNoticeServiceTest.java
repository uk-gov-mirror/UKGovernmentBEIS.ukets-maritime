package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.AccountUpdatedRegistryEvent;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.common.config.RegistryConfig;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.event.EmpApprovedEvent;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.EmpOperatorDetails;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.OrganisationStructure;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.integration.registry.accountcreated.request.MaritimeAccountCreatedEventListenerResolver;
import uk.gov.mrtm.api.integration.registry.accountupdated.domain.AccountUpdatedSubmittedEventDetails;
import uk.gov.mrtm.api.integration.registry.accountupdated.request.MaritimeAccountUpdatedEventListenerResolver;
import uk.gov.mrtm.api.integration.registry.regulatornotice.domain.MrtmRegulatorNoticeEvent;
import uk.gov.mrtm.api.integration.registry.regulatornotice.domain.MrtmRegulatorNoticeNotificationType;
import uk.gov.mrtm.api.integration.registry.regulatornotice.domain.RegulatorNoticeSubmittedEventDetails;
import uk.gov.mrtm.api.integration.registry.regulatornotice.request.MaritimeRegulatorNoticeEventListenerResolver;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmDocumentTemplateAccountDataCollectFromAccountService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.registry.service.AccountUpdatedEventAddRequestActionService;
import uk.gov.mrtm.api.workflow.request.flow.registry.service.RegulatorNoticeEventAddRequestActionService;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.documenttemplate.service.FileDocumentGenerateServiceDelegator;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.files.documents.domain.FileDocument;
import uk.gov.netz.api.files.documents.repository.FileDocumentRepository;
import uk.gov.netz.api.userinfoapi.UserInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.service.DecisionNotificationUsersService;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestAccountContactQueryService;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateGeneratorParamConstants;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateOfficialNoticeParamsProvider;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateParamsSourceData;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.OfficialNoticeSendService;
import uk.gov.netz.integration.model.regulatornotice.RegulatorNoticeEvent;

import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceOfficialNoticeServiceTest {

    @InjectMocks
    private EmpIssuanceOfficialNoticeService empIssuanceOfficialNoticeService;

    @Mock
    private RequestService requestService;
    @Mock
    private OfficialNoticeSendService officialNoticeSendService;
    @Mock
    private DecisionNotificationUsersService decisionNotificationUsersService;
    @Mock
    private RegistryConfig registryConfig;
    @Mock
    private RequestAccountContactQueryService requestAccountContactQueryService;
    @Mock
    private DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;
    @Mock
    private FileDocumentGenerateServiceDelegator documentFileGeneratorService;
    @Mock
    private MaritimeAccountCreatedEventListenerResolver accountCreatedEventListenerResolver;
    @Mock
    private EmissionsMonitoringPlanQueryService empQueryService;
    @Mock
    private EmpIssuanceSendRegistryAccountOpeningAddRequestActionService addRequestActionService;
    @Mock
    private MrtmAccountQueryService accountQueryService;
    @Mock
    private AccountUpdatedEventAddRequestActionService accountUpdatedEventRequestActionService;
    @Mock
    private MaritimeAccountUpdatedEventListenerResolver accountUpdatedRegistryListener;
    @Mock
    private MaritimeRegulatorNoticeEventListenerResolver registryNoticeEventListenerResolver;
    @Mock
    private FileDocumentRepository fileDocumentRepository;
    @Mock
    private RegulatorNoticeEventAddRequestActionService regulatorNoticeEventAddRequestActionService;
    @Mock
    private RequestTaskService requestTaskService;
    @Mock
    private MrtmDocumentTemplateAccountDataCollectFromEmpIssuanceService templateAccountDataCollectFromEmpIssuanceService;
    @Mock
    private MrtmDocumentTemplateAccountDataCollectFromAccountService templateAccountDataCollectFromAccountService;
    @Captor
    private ArgumentCaptor<EmpApprovedEvent> empApprovedEventArgumentCaptor;

    @ParameterizedTest
    @EnumSource(DocumentTemplateStage.class)
    void generateGrantedOfficialNotice(DocumentTemplateStage stage) {
        String requestId = "1";
        long requestTaskId = 2L;
        String expectedResponse = "response";
        Map<String, String> documentMetadata = Map.of(
            DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID, String.valueOf(requestTaskId),
            DocumentTemplateGeneratorParamConstants.FILE_TYPE, RequestGeneratedFileType.OFFICIAL_NOTICE.name(),
            DocumentTemplateGeneratorParamConstants.FILE_NAME,
                stage == DocumentTemplateStage.PREVIEW ? "Letter_preview.pdf" : "emp_application_approved.pdf",
            DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE, stage.name()
        );

        MrtmDocumentTemplateAccountData accountData = mock(MrtmDocumentTemplateAccountData.class);
        DecisionNotification decisionNotification = DecisionNotification.builder()
                .operators(Set.of("operator"))
                .signatory("signatory")
                .build();
        EmpIssuanceRequestPayload requestPayload = EmpIssuanceRequestPayload.builder()
                .decisionNotification(decisionNotification)
                .build();
        Request request = Request.builder()
            .id(requestId)
            .payload(requestPayload).build();
        RequestTask requestTask = RequestTask.builder()
            .request(request)
            .id(requestTaskId)
            .payload(EmpIssuanceApplicationReviewRequestTaskPayload.builder()
                .determination(EmpIssuanceDetermination.builder().type(EmpIssuanceDeterminationType.APPROVED).build())
                .build())
            .build();

        TemplateParams templateParams = TemplateParams.builder().build();

        UserInfoDTO accountPrimaryContactInfo = UserInfoDTO.builder().email("user@pmrv.uk").build();
        UserInfoDTO serviceContactInfo = UserInfoDTO.builder().email("service-contact@pmrv.uk").build();
        List<String> decisionNotificationUserEmails = List.of("operator@pmrv.uk");

        DocumentTemplateParamsSourceData documentTemplateSourceParams =
                DocumentTemplateParamsSourceData.builder()
                        .contextActionType(MrtmDocumentTemplateGenerationContextActionType.EMP_ISSUANCE_GRANTED)
                        .request(request)
                        .requestTask(requestTask)
                        .signatory(decisionNotification.getSignatory())
                        .accountPrimaryContact(accountPrimaryContactInfo)
                        .toRecipientEmail(serviceContactInfo.getEmail())
                        .ccRecipientsEmails(decisionNotificationUserEmails)
                        .accountData(accountData)
                        .build();

        when(requestTaskService.findTaskById(requestTaskId))
                .thenReturn(requestTask);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request))
                .thenReturn(Optional.of(accountPrimaryContactInfo));
        when(requestAccountContactQueryService.getRequestAccountServiceContact(request))
                .thenReturn(Optional.of(serviceContactInfo));
        when(decisionNotificationUsersService.findUserEmails(decisionNotification))
                .thenReturn(decisionNotificationUserEmails);
        when(templateAccountDataCollectFromEmpIssuanceService.collect(requestTask))
            .thenReturn(accountData);
        when(documentTemplateOfficialNoticeParamsProvider.constructTemplateParams(documentTemplateSourceParams))
                .thenReturn(templateParams);
        when(documentFileGeneratorService.generateDocumentAsyncConvert(
                MrtmDocumentTemplateType.EMP_ISSUANCE_GRANTED, templateParams, documentMetadata))
                .thenReturn(expectedResponse);

        // Invoke
        String result = empIssuanceOfficialNoticeService
            .generateOfficialNoticeAsyncConvert(requestTaskId, stage, decisionNotification);

        assertThat(result).isEqualTo(expectedResponse);

        // Verify
        verify(requestTaskService).findTaskById(requestTaskId);
        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);
        verify(decisionNotificationUsersService).findUserEmails(decisionNotification);
        verify(documentTemplateOfficialNoticeParamsProvider).constructTemplateParams(documentTemplateSourceParams);
        verify(documentFileGeneratorService).generateDocumentAsyncConvert(
                MrtmDocumentTemplateType.EMP_ISSUANCE_GRANTED, templateParams, documentMetadata);
        verify(templateAccountDataCollectFromEmpIssuanceService).collect(requestTask);

        verifyNoMoreInteractions(requestTaskService, requestAccountContactQueryService, documentFileGeneratorService,
            decisionNotificationUsersService, documentTemplateOfficialNoticeParamsProvider,
            templateAccountDataCollectFromEmpIssuanceService);

        verifyNoInteractions(requestService,
            officialNoticeSendService,
            registryConfig,
            accountCreatedEventListenerResolver,
            empQueryService,
            addRequestActionService,
            accountQueryService,
            accountUpdatedEventRequestActionService,
            accountUpdatedRegistryListener,
            registryNoticeEventListenerResolver,
            fileDocumentRepository,
            regulatorNoticeEventAddRequestActionService,
            templateAccountDataCollectFromAccountService);
    }

    @ParameterizedTest
    @EnumSource(DocumentTemplateStage.class)
    void generateAndSaveDeemedWithdrawnOfficialNotice(DocumentTemplateStage stage) {
        String requestId = "1";
        long requestTaskId = 2L;
        long accountId = 3L;
        String expectedResponse = "response";

        Map<String, String> documentMetadata = Map.of(
            DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID, String.valueOf(requestTaskId),
            DocumentTemplateGeneratorParamConstants.FILE_TYPE, RequestGeneratedFileType.OFFICIAL_NOTICE.name(),
            DocumentTemplateGeneratorParamConstants.FILE_NAME,
                stage == DocumentTemplateStage.PREVIEW ? "Letter_preview.pdf" : "emp_application_withdrawn.pdf",
            DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE, stage.name()
        );
        MrtmDocumentTemplateAccountData accountData = mock(MrtmDocumentTemplateAccountData.class);
        DecisionNotification decisionNotification = DecisionNotification.builder()
                .operators(Set.of("operator"))
                .signatory("signatory")
                .build();
        EmpIssuanceRequestPayload requestPayload = EmpIssuanceRequestPayload.builder()
                .decisionNotification(decisionNotification)
                .build();
        Request request = Request.builder()
            .id(requestId)
            .requestResources(List.of(RequestResource.builder().resourceId(String.valueOf(accountId)).resourceType(ResourceType.ACCOUNT).build()))
            .payload(requestPayload).build();
        RequestTask requestTask = RequestTask.builder()
            .request(request)
            .id(requestTaskId)
            .payload(EmpIssuanceApplicationReviewRequestTaskPayload.builder()
                .determination(EmpIssuanceDetermination.builder().type(EmpIssuanceDeterminationType.DEEMED_WITHDRAWN).build())
                .build())
            .build();

        TemplateParams templateParams = TemplateParams.builder().build();

        UserInfoDTO accountPrimaryContactInfo = UserInfoDTO.builder().email("user@pmrv.uk").build();
        UserInfoDTO serviceContactInfo = UserInfoDTO.builder().email("service-contact@pmrv.uk").build();
        List<String> decisionNotificationUserEmails = List.of("operator@pmrv.uk");
        DocumentTemplateParamsSourceData documentTemplateSourceParams =
                DocumentTemplateParamsSourceData.builder()
                    .contextActionType(MrtmDocumentTemplateGenerationContextActionType.EMP_ISSUANCE_DEEMED_WITHDRAWN)
                    .request(request)
                    .requestTask(requestTask)
                    .signatory(decisionNotification.getSignatory())
                    .accountPrimaryContact(accountPrimaryContactInfo)
                    .toRecipientEmail(serviceContactInfo.getEmail())
                    .ccRecipientsEmails(decisionNotificationUserEmails)
                    .accountData(accountData)
                    .build();

        when(requestTaskService.findTaskById(requestTaskId))
            .thenReturn(requestTask);
        when(requestAccountContactQueryService.getRequestAccountPrimaryContact(request))
            .thenReturn(Optional.of(accountPrimaryContactInfo));
        when(requestAccountContactQueryService.getRequestAccountServiceContact(request))
            .thenReturn(Optional.of(serviceContactInfo));
        when(decisionNotificationUsersService.findUserEmails(decisionNotification))
            .thenReturn(decisionNotificationUserEmails);
        when(templateAccountDataCollectFromAccountService.collect(accountId))
            .thenReturn(accountData);
        when(documentTemplateOfficialNoticeParamsProvider.constructTemplateParams(documentTemplateSourceParams))
            .thenReturn(templateParams);
        when(documentFileGeneratorService.generateDocumentAsyncConvert(
            MrtmDocumentTemplateType.EMP_ISSUANCE_DEEMED_WITHDRAWN, templateParams, documentMetadata))
            .thenReturn(expectedResponse);
        // Invoke

        String result = empIssuanceOfficialNoticeService
            .generateOfficialNoticeAsyncConvert(requestTaskId, stage, decisionNotification);

        assertThat(result).isEqualTo(expectedResponse);

        // Verify
        verify(requestTaskService).findTaskById(requestTaskId);
        verify(requestAccountContactQueryService).getRequestAccountPrimaryContact(request);
        verify(decisionNotificationUsersService).findUserEmails(decisionNotification);
        verify(documentTemplateOfficialNoticeParamsProvider).constructTemplateParams(documentTemplateSourceParams);
        verify(documentFileGeneratorService).generateDocumentAsyncConvert(
            MrtmDocumentTemplateType.EMP_ISSUANCE_DEEMED_WITHDRAWN, templateParams, documentMetadata);
        verify(templateAccountDataCollectFromAccountService).collect(accountId);

        verifyNoMoreInteractions(requestTaskService, requestAccountContactQueryService, documentFileGeneratorService,
            decisionNotificationUsersService, documentTemplateOfficialNoticeParamsProvider,
            templateAccountDataCollectFromAccountService);

        verifyNoInteractions(requestService,
            officialNoticeSendService,
            registryConfig,
            accountCreatedEventListenerResolver,
            empQueryService,
            addRequestActionService,
            accountQueryService,
            accountUpdatedEventRequestActionService,
            accountUpdatedRegistryListener,
            registryNoticeEventListenerResolver,
            fileDocumentRepository,
            regulatorNoticeEventAddRequestActionService,
            templateAccountDataCollectFromEmpIssuanceService);
    }

    @ParameterizedTest
    @MethodSource("provideSendOfficialNoticeTestArgs")
    void sendOfficialNotice(FileInfoDTO officialDocFileInfoDTO, FileInfoDTO empDocFileInfoDTO,
                            List<FileInfoDTO> attachments) {
        String requestId = "1";
        Long accountId = 1L;
        String registryEmail = "registry@pmrv.uk";
        String decisionNotificationUserEmail = "operator1@email";
        EmpIssuanceDeterminationType determinationType = EmpIssuanceDeterminationType.APPROVED;

        DecisionNotification decisionNotification = DecisionNotification.builder()
                .operators(Set.of("operatorUser"))
                .signatory("signatoryUser")
                .build();

        String regulatorReviewer = "regulatorReviewer";
        Request request = Request.builder()
                .id(requestId)
                .requestResources(List.of(RequestResource.builder()
                                .resourceType(ResourceType.ACCOUNT)
                                .resourceId(accountId.toString())
                        .build()))
                .payload(EmpIssuanceRequestPayload.builder()
                        .decisionNotification(decisionNotification)
                        .empDocument(empDocFileInfoDTO)
                        .regulatorReviewer(regulatorReviewer)
                        .accountOpeningEventSentToRegistry(false)
                        .officialNotice(officialDocFileInfoDTO)
                        .build())
                .build();

        List<String> ccRecipientsEmails = List.of(decisionNotificationUserEmail);
        MrtmAccount mrtmAccount = MrtmAccount.builder().registryId(null).build();

        when(accountQueryService.getAccountById(accountId)).thenReturn(mrtmAccount);
        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(registryConfig.getEmail()).thenReturn(registryEmail);
        OrganisationStructure organisationStructure = mock(OrganisationStructure.class);
        EmissionsMonitoringPlan emissionsMonitoringPlan = EmissionsMonitoringPlan.builder()
            .operatorDetails(
                EmpOperatorDetails.builder()
                    .organisationStructure(organisationStructure)
                    .build()
            )
            .build();
        EmissionsMonitoringPlanContainer empContainer = EmissionsMonitoringPlanContainer
            .builder()
            .emissionsMonitoringPlan(emissionsMonitoringPlan)
            .build();
        String id = "UK-1234";
        when(empQueryService.getEmissionsMonitoringPlanDTOByAccountId(accountId)).thenReturn(
            Optional.of(
                EmissionsMonitoringPlanDTO.builder()
                    .empContainer(empContainer)
                    .id(id)
                    .build()
            )
        );
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(List.of(decisionNotificationUserEmail));

        empIssuanceOfficialNoticeService.sendOfficialNotice(requestId, determinationType);

        verify(requestService, times(1)).findRequestById(requestId);
        verify(addRequestActionService, times(1)).addRequestAction(request, organisationStructure, regulatorReviewer);
        verify(decisionNotificationUsersService, times(1)).findUserEmails(decisionNotification);
        verify(officialNoticeSendService, times(1)).sendOfficialNotice(attachments, request, ccRecipientsEmails, List.of(registryEmail));
        verify(empQueryService).getEmissionsMonitoringPlanDTOByAccountId(accountId);
        verify(accountCreatedEventListenerResolver, times(1)).onAccountCreatedEvent(empApprovedEventArgumentCaptor.capture());
        verify(accountQueryService).getAccountById(accountId);

        verifyNoMoreInteractions(requestService, decisionNotificationUsersService,
            officialNoticeSendService, empQueryService, accountCreatedEventListenerResolver, addRequestActionService, accountQueryService);
        verifyNoInteractions(fileDocumentRepository, registryNoticeEventListenerResolver, regulatorNoticeEventAddRequestActionService);
        assertEquals(accountId, empApprovedEventArgumentCaptor.getValue().getAccountId());
        assertEquals(emissionsMonitoringPlan, empApprovedEventArgumentCaptor.getValue().getEmissionsMonitoringPlan());
    }

    @ParameterizedTest
    @MethodSource("sendOfficialNoticeAlreadySentToRegistryScenarios")
    void sendOfficialNotice_already_sent_to_registry(boolean accountOpeningEventSentToRegistry,
                                                     int accountUpdateSentToRegistryInvocations) {
        FileInfoDTO officialDocFileInfoDTO = buildOfficialFileInfo();
        List<FileInfoDTO> attachments = List.of(officialDocFileInfoDTO);
        String requestId = "1";
        Long accountId = 1L;
        String registryEmail = "registry@pmrv.uk";
        String decisionNotificationUserEmail = "operator1@email";
        EmpIssuanceDeterminationType determinationType = EmpIssuanceDeterminationType.APPROVED;

        DecisionNotification decisionNotification = DecisionNotification.builder()
            .operators(Set.of("operatorUser"))
            .signatory("signatoryUser")
            .build();

        Request request = Request.builder()
            .id(requestId)
            .requestResources(List.of(RequestResource.builder()
                .resourceType(ResourceType.ACCOUNT)
                .resourceId(accountId.toString())
                .build()))
            .payload(EmpIssuanceRequestPayload.builder()
                .decisionNotification(decisionNotification)
                .officialNotice(officialDocFileInfoDTO)
                .accountOpeningEventSentToRegistry(accountOpeningEventSentToRegistry)
                .build())
            .build();

        List<String> ccRecipientsEmails = List.of(decisionNotificationUserEmail);
        OrganisationStructure organisationStructure = mock(OrganisationStructure.class);
        EmissionsMonitoringPlan emissionsMonitoringPlan = EmissionsMonitoringPlan.builder()
            .operatorDetails(
                EmpOperatorDetails.builder()
                    .organisationStructure(organisationStructure)
                    .build()
            )
            .build();
        MrtmAccount mrtmAccount = MrtmAccount.builder().registryId(accountOpeningEventSentToRegistry? null : 1234567).build();
        EmissionsMonitoringPlanContainer empContainer = EmissionsMonitoringPlanContainer
            .builder()
            .emissionsMonitoringPlan(emissionsMonitoringPlan)
            .build();
        String id = "UK-1234";
        AccountUpdatedRegistryEvent accountUpdatedRegistryEvent = AccountUpdatedRegistryEvent.builder()
            .accountId(request.getAccountId())
            .emissionsMonitoringPlan(emissionsMonitoringPlan)
            .build();
        AccountUpdatedSubmittedEventDetails accountUpdatedSubmittedEventDetails = mock(AccountUpdatedSubmittedEventDetails.class);

        when(accountQueryService.getAccountById(accountId)).thenReturn(mrtmAccount);
        EmissionsMonitoringPlanDTO emissionsMonitoringPlanDTO = EmissionsMonitoringPlanDTO.builder()
            .empContainer(empContainer)
            .id(id)
            .build();
        when(empQueryService.getEmissionsMonitoringPlanDTOByAccountId(accountId)).thenReturn(Optional.of(emissionsMonitoringPlanDTO));
        when(requestService.findRequestById(requestId)).thenReturn(request);
        lenient().when(accountUpdatedRegistryListener.onAccountUpdatedEvent(accountUpdatedRegistryEvent)).thenReturn(accountUpdatedSubmittedEventDetails);
        when(registryConfig.getEmail()).thenReturn(registryEmail);
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(List.of(decisionNotificationUserEmail));

        empIssuanceOfficialNoticeService.sendOfficialNotice(requestId, determinationType);

        verify(requestService, times(1)).findRequestById(requestId);
        verify(decisionNotificationUsersService, times(1)).findUserEmails(decisionNotification);
        verify(officialNoticeSendService, times(1)).sendOfficialNotice(attachments, request, ccRecipientsEmails, List.of(registryEmail));
        verify(accountQueryService).getAccountById(accountId);
        verify(empQueryService).getEmissionsMonitoringPlanDTOByAccountId(accountId);
        verify(accountUpdatedRegistryListener, times(accountUpdateSentToRegistryInvocations)).onAccountUpdatedEvent(accountUpdatedRegistryEvent);
        verify(accountUpdatedEventRequestActionService, times(accountUpdateSentToRegistryInvocations)).addRequestAction(
            request, accountUpdatedSubmittedEventDetails, organisationStructure, null);


        verifyNoMoreInteractions(accountUpdatedRegistryListener, accountUpdatedEventRequestActionService,
            empQueryService, requestService, decisionNotificationUsersService, officialNoticeSendService,
            accountQueryService);
        verifyNoInteractions(accountCreatedEventListenerResolver, addRequestActionService, fileDocumentRepository, registryNoticeEventListenerResolver,
            regulatorNoticeEventAddRequestActionService);
    }

    public static Stream<Arguments> sendOfficialNoticeAlreadySentToRegistryScenarios() {
        return Stream.of(
            Arguments.of(true, 0),
            Arguments.of(false, 1)
        );
    }

    @ParameterizedTest
    @ValueSource(booleans =  {true, false})
    void sendOfficialNotice_withdrawn(boolean notifiedRegistry) {
        FileInfoDTO officialDocFileInfoDTO = buildOfficialFileInfo();
        List<FileInfoDTO> attachments = List.of(officialDocFileInfoDTO);
        String requestId = "1";
        Long accountId = 1L;
        String registryEmail = "registry@pmrv.uk";
        String decisionNotificationUserEmail = "operator1@email";
        EmpIssuanceDeterminationType determinationType = EmpIssuanceDeterminationType.DEEMED_WITHDRAWN;

        DecisionNotification decisionNotification = DecisionNotification.builder()
            .operators(Set.of("operatorUser"))
            .signatory("signatoryUser")
            .build();

        String regulatorReviewer = "regulatorReviewer";
        Request request = Request.builder()
            .id(requestId)
            .requestResources(List.of(RequestResource.builder()
                .resourceType(ResourceType.ACCOUNT)
                .resourceId(accountId.toString())
                .build()))
            .payload(EmpIssuanceRequestPayload.builder()
                .decisionNotification(decisionNotification)
                .regulatorReviewer(regulatorReviewer)
                .accountOpeningEventSentToRegistry(false)
                .officialNotice(officialDocFileInfoDTO)
                .build())
            .build();
        byte[] file = HexFormat.of().parseHex("e04fd020ea3a6910a2d808002b30309d");
        MrtmRegulatorNoticeEvent mrtmRegulatorNoticeEvent = MrtmRegulatorNoticeEvent.builder()
            .accountId(accountId)
            .fileName(officialDocFileInfoDTO.getName())
            .file(file)
            .notificationType(MrtmRegulatorNoticeNotificationType.EMP_WITHDRAWN)
            .build();
        RegulatorNoticeSubmittedEventDetails submittedEventDetails = RegulatorNoticeSubmittedEventDetails.builder()
            .notifiedRegistry(notifiedRegistry)
            .data(RegulatorNoticeEvent.builder().registryId("321").build())
            .build();

        List<String> ccRecipientsEmails = List.of(decisionNotificationUserEmail);

        when(registryNoticeEventListenerResolver.onRegulatorNoticeEvent(mrtmRegulatorNoticeEvent))
            .thenReturn(submittedEventDetails);
        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(registryConfig.getEmail()).thenReturn(registryEmail);
        when(fileDocumentRepository.findByUuid(officialDocFileInfoDTO.getUuid())).thenReturn(Optional.ofNullable(FileDocument.builder().fileContent(file).build()));
        when(decisionNotificationUsersService.findUserEmails(decisionNotification)).thenReturn(List.of(decisionNotificationUserEmail));

        empIssuanceOfficialNoticeService.sendOfficialNotice(requestId, determinationType);

        verify(requestService, times(1)).findRequestById(requestId);
        verify(registryNoticeEventListenerResolver).onRegulatorNoticeEvent(mrtmRegulatorNoticeEvent);
        verify(decisionNotificationUsersService, times(1)).findUserEmails(decisionNotification);
        verify(fileDocumentRepository, times(1)).findByUuid(officialDocFileInfoDTO.getUuid());
        verify(officialNoticeSendService, times(1)).sendOfficialNotice(attachments, request, ccRecipientsEmails, List.of(registryEmail));
        verify(regulatorNoticeEventAddRequestActionService)
            .addRequestAction(request, submittedEventDetails, officialDocFileInfoDTO, MrtmRegulatorNoticeNotificationType.EMP_WITHDRAWN);

        verifyNoMoreInteractions(requestService, decisionNotificationUsersService, regulatorNoticeEventAddRequestActionService,
            officialNoticeSendService, addRequestActionService, fileDocumentRepository, registryNoticeEventListenerResolver);
        verifyNoInteractions(empQueryService, accountCreatedEventListenerResolver, accountQueryService);
    }

    private static Stream<Arguments> provideSendOfficialNoticeTestArgs() {
        FileInfoDTO officialDocFileInfoDTO = buildOfficialFileInfo();
        FileInfoDTO empDocFileInfoDTO = buildOfficialFileInfo();

        return Stream.of(
                //when operator
                Arguments.of(officialDocFileInfoDTO, empDocFileInfoDTO, List.of(officialDocFileInfoDTO, empDocFileInfoDTO)),
                Arguments.of(officialDocFileInfoDTO, null, List.of(officialDocFileInfoDTO))
        );
    }

    private static FileInfoDTO buildOfficialFileInfo() {
        return FileInfoDTO.builder()
                .name("offDoc.pdf")
                .uuid(UUID.randomUUID().toString())
                .build();
    }
}
