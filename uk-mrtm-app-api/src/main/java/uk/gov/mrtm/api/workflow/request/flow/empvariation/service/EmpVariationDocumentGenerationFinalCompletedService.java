package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.common.constants.MrtmBpmnProcessConstants;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestTaskDocumentAsyncGeneratedDataPayload;
import uk.gov.mrtm.api.workflow.request.flow.common.service.docgen.async.DocumentGenerationFinalCompletedService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSubmitOutcome;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

@Service
@RequiredArgsConstructor
public class EmpVariationDocumentGenerationFinalCompletedService implements DocumentGenerationFinalCompletedService {
	
	private final WorkflowService workflowService;
	
	@Value("${govuk-pay.empVariationPaymentIsActive}")
    private boolean empVariationPaymentIsActive;

	@Transactional
	public void completed(RequestTask requestTask,
			RequestGeneratedFileType fileType, FileInfoDTO fileDocumentDTO) {
		final Request request = requestTask.getRequest();
		final EmpVariationRequestPayload requestPayload = (EmpVariationRequestPayload) request.getPayload();
		final EmpVariationRequestMetadata requestMetadata = (EmpVariationRequestMetadata) request.getMetadata();
		
		final RequestTaskDocumentAsyncGeneratedDataPayload requestTaskPayload = (RequestTaskDocumentAsyncGeneratedDataPayload) requestTask
				.getPayload();
		
    	switch (fileType) {
		case EMP:
			requestPayload.setEmpDocument(fileDocumentDTO);
			break;
		case OFFICIAL_NOTICE:
			requestPayload.setOfficialNotice(fileDocumentDTO);
			break;
		default:
			throw new UnsupportedOperationException(fileType.name());
		}
    	
    	if((requestPayload.getEmpDocument() != null || !requestPayload.shouldGenerateEmpDocument())  && 
    			requestPayload.getOfficialNotice() != null) {
    		requestTaskPayload.setFinalDocumentsGenerationSuccessful(true);
	        requestTaskPayload.setFinalDocumentsGenerationInProgress(false);
	        
	        if(RoleTypeConstants.REGULATOR.equals(requestMetadata.getInitiatorRoleType())) {
	        	workflowService.completeTask(
	                    requestTask.getProcessTaskId(),
	                    Map.of(BpmnProcessConstants.REQUEST_ID, requestTask.getRequest().getId(),
	                            MrtmBpmnProcessConstants.EMP_VARIATION_SUBMIT_OUTCOME, EmpVariationSubmitOutcome.SUBMITTED,
	                            BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.NOTIFY_OPERATOR,
	                            BpmnProcessConstants.SKIP_PAYMENT, !empVariationPaymentIsActive)
	            );
	        } else {
				EmpVariationDeterminationType determinationType = ((EmpVariationApplicationReviewRequestTaskPayload) requestTaskPayload)
						.getDetermination().getType();
	            workflowService.completeTask(
	                    requestTask.getProcessTaskId(),
	                    Map.of(BpmnProcessConstants.REQUEST_ID, requestTask.getRequest().getId(),
	                            BpmnProcessConstants.REVIEW_DETERMINATION, determinationType,
	                            BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.NOTIFY_OPERATOR)
	            );	
	        }
    	}
	}

	@Override
	public String getRequestType() {
		return MrtmRequestType.EMP_VARIATION;
	}
}
