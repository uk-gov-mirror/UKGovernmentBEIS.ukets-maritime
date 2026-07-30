package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import uk.gov.mrtm.api.account.domain.AccountUpdatedRegistryEvent;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.common.config.RegistryConfig;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.event.EmpApprovedEvent;
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
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.documenttemplate.service.FileDocumentGenerateServiceDelegator;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.files.documents.repository.FileDocumentRepository;
import uk.gov.netz.api.userinfoapi.UserInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
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

import java.util.List;
import java.util.Map;

import static uk.gov.mrtm.api.integration.registry.common.NotifyRegistryUtils.REQUEST_LOG_FORMAT;
import static uk.gov.mrtm.api.integration.registry.common.NotifyRegistryUtils.SERVICE_KEY;
import static uk.gov.netz.api.common.exception.ErrorCode.RESOURCE_NOT_FOUND;

@Service
@Log4j2
@RequiredArgsConstructor
public class EmpIssuanceOfficialNoticeService {

    private final RequestService requestService;
    private final OfficialNoticeSendService officialNoticeSendService;
    private final DecisionNotificationUsersService decisionNotificationUsersService;
    private final RegistryConfig registryConfig;
    private final RequestAccountContactQueryService requestAccountContactQueryService;
    private final DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;
    private final FileDocumentGenerateServiceDelegator documentFileGeneratorService;
    private final MaritimeAccountCreatedEventListenerResolver accountCreatedEventListenerResolver;
    private final EmissionsMonitoringPlanQueryService empQueryService;
    private final EmpIssuanceSendRegistryAccountOpeningAddRequestActionService addRequestActionService;
    private final MrtmAccountQueryService accountQueryService;
    private final AccountUpdatedEventAddRequestActionService accountUpdatedEventRequestActionService;
    private final MaritimeAccountUpdatedEventListenerResolver accountUpdatedRegistryListener;
    private final MaritimeRegulatorNoticeEventListenerResolver registryNoticeEventListenerResolver;
    private final FileDocumentRepository fileDocumentRepository;
    private final RegulatorNoticeEventAddRequestActionService regulatorNoticeEventAddRequestActionService;
    private final RequestTaskService requestTaskService;
    private final MrtmDocumentTemplateAccountDataCollectFromEmpIssuanceService templateAccountDataCollectFromEmpIssuanceService;
    private final MrtmDocumentTemplateAccountDataCollectFromAccountService templateAccountDataCollectFromAccountService;

    private static final String INTEGRATION_POINT_KEY = "Account Created";

    public void sendOfficialNotice(final String requestId, EmpIssuanceDeterminationType determinationType) {
        final Request request = requestService.findRequestById(requestId);
        final EmpIssuanceRequestPayload requestPayload = (EmpIssuanceRequestPayload) request.getPayload();
        final List<FileInfoDTO> attachments = requestPayload.getEmpDocument() != null ?
                List.of(requestPayload.getOfficialNotice(), requestPayload.getEmpDocument()) :
                List.of(requestPayload.getOfficialNotice());

        officialNoticeSendService.sendOfficialNotice(attachments, request,
                decisionNotificationUsersService.findUserEmails(requestPayload.getDecisionNotification()),
                List.of(registryConfig.getEmail()));

        if (EmpIssuanceDeterminationType.APPROVED.equals(determinationType)) {
            final MrtmAccount account = accountQueryService.getAccountById(request.getAccountId());
            final EmissionsMonitoringPlanDTO emp = empQueryService
                .getEmissionsMonitoringPlanDTOByAccountId(request.getAccountId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

            if (!requestPayload.isAccountOpeningEventSentToRegistry() && ObjectUtils.isEmpty(account.getRegistryId())) {
                sendAccountCreatedEventToRegistry(request, emp.getEmpContainer().getEmissionsMonitoringPlan(), requestPayload.getRegulatorReviewer());
            } else if (!ObjectUtils.isEmpty(account.getRegistryId())) {
                sendAccountUpdatedEventToRegistry(request, emp.getEmpContainer().getEmissionsMonitoringPlan());
            } else {
                log.info(REQUEST_LOG_FORMAT, SERVICE_KEY, request.getAccountId(),
                        INTEGRATION_POINT_KEY,
                        "Cannot send emissions to ETS Registry because manual push has already performed");
            }
        } else if (EmpIssuanceDeterminationType.DEEMED_WITHDRAWN.equals(determinationType)) {
            sendRegulatorNoticeEventToRegistry(request.getAccountId(), request, requestPayload.getOfficialNotice());
        }
    }

    @Transactional
    public String generateOfficialNoticeAsyncConvert(Long requestTaskId, DocumentTemplateStage stage,
                                                     DecisionNotification decisionNotification) {
        final RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);
        final String response;

        final EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload = (EmpIssuanceApplicationReviewRequestTaskPayload) requestTask
            .getPayload();
        final EmpIssuanceDetermination determination = requestTaskPayload.getDetermination();

        response = switch (determination.getType()) {
            case APPROVED -> generateGrantedOfficialNotice(requestTask, stage, decisionNotification);
            case DEEMED_WITHDRAWN -> generateDeemedWithdrawnOfficialNotice(requestTask, stage, decisionNotification);
        };

        return response;
    }

    private String generateGrantedOfficialNotice(RequestTask requestTask, DocumentTemplateStage stage,
                                                 DecisionNotification decisionNotification) {
        final Request request = requestTask.getRequest();
        final UserInfoDTO accountPrimaryContact = requestAccountContactQueryService.getRequestAccountPrimaryContact(request)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND));
        final UserInfoDTO serviceContact = requestAccountContactQueryService.getRequestAccountServiceContact(request)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_SERVICE_CONTACT_NOT_FOUND));
        final List<String> ccRecipientsEmails = decisionNotificationUsersService.findUserEmails(decisionNotification);

        final MrtmDocumentTemplateAccountData accountData = templateAccountDataCollectFromEmpIssuanceService.collect(requestTask);

        final TemplateParams templateParams = buildTemplateParams(request, requestTask, accountPrimaryContact, serviceContact,
            ccRecipientsEmails, MrtmDocumentTemplateGenerationContextActionType.EMP_ISSUANCE_GRANTED,
            accountData,
            decisionNotification.getSignatory());

        final Map<String, String> documentMetadata = Map.of(
            DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID, String.valueOf(requestTask.getId()),
            DocumentTemplateGeneratorParamConstants.FILE_TYPE, RequestGeneratedFileType.OFFICIAL_NOTICE.name(),
            DocumentTemplateGeneratorParamConstants.FILE_NAME, resolveOfficialNoticeFileName(stage, "emp_application_approved.pdf"),
            DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE, stage.name()
        );

        return documentFileGeneratorService.generateDocumentAsyncConvert(MrtmDocumentTemplateType.EMP_ISSUANCE_GRANTED,
            templateParams, documentMetadata);
    }

    private String generateDeemedWithdrawnOfficialNotice(RequestTask requestTask, DocumentTemplateStage stage,
                                                         DecisionNotification decisionNotification) {
        final Request request = requestTask.getRequest();
        final UserInfoDTO accountPrimaryContact = requestAccountContactQueryService.getRequestAccountPrimaryContact(request)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND));
        final UserInfoDTO serviceContact = requestAccountContactQueryService.getRequestAccountServiceContact(request)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_SERVICE_CONTACT_NOT_FOUND));
        final List<String> ccRecipientsEmails = decisionNotificationUsersService.findUserEmails(decisionNotification);

        final MrtmDocumentTemplateAccountData accountData = templateAccountDataCollectFromAccountService.collect(request.getAccountId());

        final TemplateParams templateParams = buildTemplateParams(request, requestTask, accountPrimaryContact, serviceContact,
            ccRecipientsEmails, MrtmDocumentTemplateGenerationContextActionType.EMP_ISSUANCE_DEEMED_WITHDRAWN,
            accountData,
            decisionNotification.getSignatory());

        final Map<String, String> documentMetadata = Map.of(
            DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID, String.valueOf(requestTask.getId()),
            DocumentTemplateGeneratorParamConstants.FILE_TYPE, RequestGeneratedFileType.OFFICIAL_NOTICE.name(),
            DocumentTemplateGeneratorParamConstants.FILE_NAME, resolveOfficialNoticeFileName(stage, "emp_application_withdrawn.pdf"),
            DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE, stage.name()
        );

        return documentFileGeneratorService.generateDocumentAsyncConvert(MrtmDocumentTemplateType.EMP_ISSUANCE_DEEMED_WITHDRAWN,
            templateParams, documentMetadata);
    }

    private void sendAccountCreatedEventToRegistry(Request request, EmissionsMonitoringPlan emissionsMonitoringPlan, String regulatorReviewer) {
        accountCreatedEventListenerResolver.onAccountCreatedEvent(EmpApprovedEvent.builder()
            .accountId(request.getAccountId())
            .emissionsMonitoringPlan(emissionsMonitoringPlan)
            .build());

        addRequestActionService.addRequestAction(
            request,
            emissionsMonitoringPlan.getOperatorDetails().getOrganisationStructure(),
            regulatorReviewer);
    }

    private void sendRegulatorNoticeEventToRegistry(Long accountId, Request request, FileInfoDTO officialNotice) {
        byte[] file = fileDocumentRepository.findByUuid(officialNotice.getUuid())
            .orElseThrow(() -> new BusinessException(RESOURCE_NOT_FOUND))
            .getFileContent();

        RegulatorNoticeSubmittedEventDetails regulatorNoticeSubmittedEventDetails =
            registryNoticeEventListenerResolver.onRegulatorNoticeEvent(
                MrtmRegulatorNoticeEvent.builder()
                    .accountId(accountId)
                    .file(file)
                    .fileName(officialNotice.getName())
                    .notificationType(MrtmRegulatorNoticeNotificationType.EMP_WITHDRAWN)
                    .build());

        regulatorNoticeEventAddRequestActionService.addRequestAction(request, regulatorNoticeSubmittedEventDetails,
            officialNotice, MrtmRegulatorNoticeNotificationType.EMP_WITHDRAWN);
    }

    private void sendAccountUpdatedEventToRegistry(Request request, EmissionsMonitoringPlan emissionsMonitoringPlan) {
        AccountUpdatedSubmittedEventDetails updatedSubmittedEventDetails = accountUpdatedRegistryListener
            .onAccountUpdatedEvent(AccountUpdatedRegistryEvent.builder()
                .accountId(request.getAccountId())
                .emissionsMonitoringPlan(emissionsMonitoringPlan)
                .build());

        accountUpdatedEventRequestActionService.addRequestAction(
            request,
            updatedSubmittedEventDetails,
            emissionsMonitoringPlan.getOperatorDetails().getOrganisationStructure(),
            null);
    }

    //TODO reduce number of arguments
    private TemplateParams buildTemplateParams(final Request request,
                                               final RequestTask requestTask,
                                               final UserInfoDTO accountPrimaryContact,
                                               final UserInfoDTO serviceContact,
                                               final List<String> ccRecipientsEmails,
                                               final String type,
                                               final MrtmDocumentTemplateAccountData accountData,
                                               String signatory) {
        return documentTemplateOfficialNoticeParamsProvider
            .constructTemplateParams(DocumentTemplateParamsSourceData.builder()
                .contextActionType(type)
                .request(request)
                .requestTask(requestTask)
                .signatory(signatory)
                .accountPrimaryContact(accountPrimaryContact)
                .toRecipientEmail(serviceContact.getEmail())
                .ccRecipientsEmails(ccRecipientsEmails)
                .accountData(accountData)
                .build());
    }

    private String resolveOfficialNoticeFileName(DocumentTemplateStage stage, String finalFileName) {
        return stage == DocumentTemplateStage.PREVIEW ? "Letter_preview.pdf" : finalFileName;
    }

}
