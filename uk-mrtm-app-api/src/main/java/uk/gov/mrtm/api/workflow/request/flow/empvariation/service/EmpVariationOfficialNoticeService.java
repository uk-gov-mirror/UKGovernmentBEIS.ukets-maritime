package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.account.domain.AccountUpdatedRegistryEvent;
import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.common.config.RegistryConfig;
import uk.gov.mrtm.api.integration.registry.accountupdated.domain.AccountUpdatedSubmittedEventDetails;
import uk.gov.mrtm.api.integration.registry.accountupdated.request.MaritimeAccountUpdatedEventListenerResolver;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmDocumentTemplateAccountDataCollectFromAccountService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.registry.service.AccountUpdatedEventAddRequestActionService;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.documenttemplate.service.FileDocumentGenerateServiceDelegator;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
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

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmpVariationOfficialNoticeService {

    private final RequestService requestService;
    private final RequestTaskService requestTaskService;
    private final AccountUpdatedEventAddRequestActionService accountUpdatedEventRequestActionService;
    private final RequestAccountContactQueryService requestAccountContactQueryService;
    private final DecisionNotificationUsersService decisionNotificationUsersService;
    private final FileDocumentGenerateServiceDelegator fileDocumentGenerateServiceDelegator;
    private final DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;
    private final OfficialNoticeSendService officialNoticeSendService;
    private final MaritimeAccountUpdatedEventListenerResolver accountUpdatedRegistryListener;
    private final RegistryConfig registryConfig;
    private final MrtmDocumentTemplateAccountDataCollectFromEmpVariationService templateAccountDataCollectFromEmpVariationService;
    private final MrtmDocumentTemplateAccountDataCollectFromAccountService templateAccountDataCollectFromAccountService;
    
    @Transactional
    public String generateOfficialNoticeAsyncConvert(Long requestTaskId, DocumentTemplateStage stage, DecisionNotification decisionNotification) {
    	final RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);
    	final EmpVariationRequestMetadata requestMetadata = (EmpVariationRequestMetadata) requestTask.getRequest().getMetadata();
    	final String response;
    	
    	if(RoleTypeConstants.REGULATOR.equals(requestMetadata.getInitiatorRoleType())){
    		response = generateApprovedOfficialNoticeRegulatorLed(requestTask, stage, decisionNotification);
    	} else {
    		final EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = (EmpVariationApplicationReviewRequestTaskPayload) requestTask
    				.getPayload();
            final EmpVariationDetermination determination = requestTaskPayload.getDetermination();
            
            switch (determination.getType()) {
    		case APPROVED:
    			response = generateApprovedOfficialNotice(requestTask, stage, decisionNotification);
    			break;
    		case REJECTED:
    			response = generateRejectedOfficialNotice(requestTask, stage, decisionNotification);
    			break;
    		case DEEMED_WITHDRAWN:
    			response = generateDeemedWithdrawnOfficialNotice(requestTask, stage, decisionNotification);
    			break;
    		default:
    			throw new RuntimeException("unknown type: " + determination.getType());
    		}
    	}
		
        return response;
    }
    
	private String generateApprovedOfficialNotice(RequestTask requestTask, DocumentTemplateStage stage,
			DecisionNotification decisionNotification) {
        final Request request = requestTask.getRequest();
        final UserInfoDTO accountPrimaryContact = requestAccountContactQueryService.getRequestAccountPrimaryContact(request)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND));
        
		final List<String> ccRecipientsEmails = decisionNotificationUsersService
				.findUserEmails(decisionNotification);
		
        final UserInfoDTO serviceContact = requestAccountContactQueryService.getRequestAccountServiceContact(request)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_SERVICE_CONTACT_NOT_FOUND));
        
        final MrtmDocumentTemplateAccountData accountData = templateAccountDataCollectFromEmpVariationService.collect(requestTask);
        
		final TemplateParams templateParams = buildTemplateParams(request, requestTask, accountPrimaryContact, serviceContact,
				ccRecipientsEmails, MrtmDocumentTemplateGenerationContextActionType.EMP_VARIATION_ACCEPTED,
				accountData,
				decisionNotification.getSignatory());
		
		final Map<String, String> documentMetadata = Map.of(
				DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID, String.valueOf(requestTask.getId()),
				DocumentTemplateGeneratorParamConstants.FILE_TYPE, RequestGeneratedFileType.OFFICIAL_NOTICE.name(),
				DocumentTemplateGeneratorParamConstants.FILE_NAME, resolveOfficialNoticeFileName(stage, "emp_variation_approved.pdf"),
				DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE, stage.name()
				); 
		
		return fileDocumentGenerateServiceDelegator.generateDocumentAsyncConvert(MrtmDocumentTemplateType.EMP_VARIATION_ACCEPTED,
				templateParams, documentMetadata);
    }
    
	private String generateRejectedOfficialNotice(RequestTask requestTask,
			DocumentTemplateStage stage, DecisionNotification decisionNotification) {
		return generateOfficialNotice(requestTask,
				MrtmDocumentTemplateGenerationContextActionType.EMP_VARIATION_REJECTED,
				MrtmDocumentTemplateType.EMP_VARIATION_REJECTED, "emp_variation_rejected.pdf", stage, decisionNotification);
	}
	
	private String generateDeemedWithdrawnOfficialNotice(RequestTask requestTask,
			DocumentTemplateStage stage, DecisionNotification decisionNotification) {
		return generateOfficialNotice(requestTask,
				MrtmDocumentTemplateGenerationContextActionType.EMP_VARIATION_DEEMED_WITHDRAWN,
				MrtmDocumentTemplateType.EMP_VARIATION_DEEMED_WITHDRAWN, "emp_variation_withdrawn.pdf", stage, decisionNotification);
	}
    
	private String generateApprovedOfficialNoticeRegulatorLed(RequestTask requestTask, DocumentTemplateStage stage,
			DecisionNotification decisionNotification) {
        final Request request = requestTask.getRequest();
        
        final UserInfoDTO accountPrimaryContact = requestAccountContactQueryService.getRequestAccountPrimaryContact(request)
            .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND));
        final List<String> ccRecipientsEmails = decisionNotificationUsersService.findUserEmails(decisionNotification);
        final UserInfoDTO serviceContact = requestAccountContactQueryService.getRequestAccountServiceContact(request)
            .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_SERVICE_CONTACT_NOT_FOUND));
        
		final MrtmDocumentTemplateAccountData accountData = templateAccountDataCollectFromEmpVariationService.collect(requestTask);

        final TemplateParams templateParams = buildTemplateParams(request, 
        		requestTask, 
        		accountPrimaryContact,
                serviceContact, 
                ccRecipientsEmails, 
                MrtmDocumentTemplateGenerationContextActionType.EMP_VARIATION_REGULATOR_LED_APPROVED, 
                accountData,
                decisionNotification.getSignatory());
        
		final Map<String, String> documentMetadata = Map.of(
				DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID, String.valueOf(requestTask.getId()),
				DocumentTemplateGeneratorParamConstants.FILE_TYPE, RequestGeneratedFileType.OFFICIAL_NOTICE.name(),
				DocumentTemplateGeneratorParamConstants.FILE_NAME, resolveOfficialNoticeFileName(stage, "emp_variation_approved.pdf"),
				DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE, stage.name()
				); 
        
        return fileDocumentGenerateServiceDelegator.generateDocumentAsyncConvert(MrtmDocumentTemplateType.EMP_VARIATION_REGULATOR_LED_APPROVED,
				templateParams, documentMetadata);
    }

    public void sendOfficialNotice(final String requestId) {
        final Request request = requestService.findRequestById(requestId);
        final EmpVariationRequestPayload requestPayload = (EmpVariationRequestPayload) request.getPayload();
        final EmpVariationRequestMetadata requestMetadata = (EmpVariationRequestMetadata) request.getMetadata();

        final List<String> ccRecipientsEmails = decisionNotificationUsersService.findUserEmails(requestPayload.getDecisionNotification());
        final List<FileInfoDTO> attachments = requestPayload.getEmpDocument() != null ?
            List.of(requestPayload.getOfficialNotice(), requestPayload.getEmpDocument()) :
            List.of(requestPayload.getOfficialNotice());

        boolean isApproved = RoleTypeConstants.REGULATOR.equals(requestMetadata.getInitiatorRoleType())
                || requestPayload.getDetermination().getType().equals(EmpVariationDeterminationType.APPROVED);

        if (isApproved) {
            officialNoticeSendService.sendOfficialNotice(attachments, request, ccRecipientsEmails, List.of(registryConfig.getEmail()));

            AccountUpdatedSubmittedEventDetails updatedSubmittedEventDetails = accountUpdatedRegistryListener.onAccountUpdatedEvent(AccountUpdatedRegistryEvent.builder()
                .accountId(request.getAccountId())
                .emissionsMonitoringPlan(requestPayload.getEmissionsMonitoringPlan())
                .build());

            accountUpdatedEventRequestActionService.addRequestAction(
                request,
                updatedSubmittedEventDetails,
                requestPayload.getEmissionsMonitoringPlan().getOperatorDetails().getOrganisationStructure(),
                null);
        } else {
            officialNoticeSendService.sendOfficialNotice(attachments, request, ccRecipientsEmails, Collections.emptyList());
        }
    }

	private String generateOfficialNotice(RequestTask requestTask, 
			final String contextActionType,
			final String documentTemplateType, 
			final String fileNameToGenerate,
			DocumentTemplateStage stage,
			DecisionNotification decisionNotification) {
        final Request request = requestTask.getRequest();

        final UserInfoDTO accountPrimaryContact = requestAccountContactQueryService.getRequestAccountPrimaryContact(request)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND));
        final UserInfoDTO serviceContact = requestAccountContactQueryService.getRequestAccountServiceContact(request)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_SERVICE_CONTACT_NOT_FOUND));
        
        final MrtmDocumentTemplateAccountData accountData = templateAccountDataCollectFromAccountService.collect(request.getAccountId());
        
        final List<String> ccRecipientsEmails = decisionNotificationUsersService.findUserEmails(decisionNotification);
        
        final TemplateParams templateParams = buildTemplateParams(request,
        		requestTask,
                accountPrimaryContact,
                serviceContact,
                ccRecipientsEmails,
                documentTemplateType,
                accountData,
                decisionNotification.getSignatory());
        
		final Map<String, String> documentMetadata = Map.of(
				DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID, String.valueOf(requestTask.getId()),
				DocumentTemplateGeneratorParamConstants.FILE_TYPE, RequestGeneratedFileType.OFFICIAL_NOTICE.name(),
				DocumentTemplateGeneratorParamConstants.FILE_NAME, resolveOfficialNoticeFileName(stage, fileNameToGenerate),
				DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE, stage.name()
				); 
		
		return fileDocumentGenerateServiceDelegator.generateDocumentAsyncConvert(documentTemplateType,
				templateParams, documentMetadata);
    }

	private String resolveOfficialNoticeFileName(DocumentTemplateStage stage, String finalFileName) {
		return stage == DocumentTemplateStage.PREVIEW ? "Letter_preview.pdf" : finalFileName;
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
}
