package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestTaskDocumentAsyncGeneratedDataPayload;
import uk.gov.mrtm.api.workflow.request.flow.common.service.docgen.async.DocumentGenerationFinalCompletedService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmpIssuanceDocumentGenerationFinalCompletedService implements DocumentGenerationFinalCompletedService {

	private final WorkflowService workflowService;

	@Transactional
	public void completed(RequestTask requestTask,
						  RequestGeneratedFileType fileType, FileInfoDTO fileDocumentDTO) {
		final Request request = requestTask.getRequest();
		final EmpIssuanceRequestPayload requestPayload = (EmpIssuanceRequestPayload) request.getPayload();

		final RequestTaskDocumentAsyncGeneratedDataPayload requestTaskPayload = (RequestTaskDocumentAsyncGeneratedDataPayload) requestTask
				.getPayload();

        switch (fileType) {
            case EMP -> requestPayload.setEmpDocument(fileDocumentDTO);
            case OFFICIAL_NOTICE -> requestPayload.setOfficialNotice(fileDocumentDTO);
            default -> throw new UnsupportedOperationException(fileType.name());
        }
    	
    	if((requestPayload.getEmpDocument() != null || !requestPayload.shouldGenerateEmpDocument())  && 
    			requestPayload.getOfficialNotice() != null) {
    		requestTaskPayload.setFinalDocumentsGenerationSuccessful(true);
	        requestTaskPayload.setFinalDocumentsGenerationInProgress(false);

			EmpIssuanceDeterminationType determinationType = requestPayload.getDetermination().getType();
			workflowService.completeTask(
				requestTask.getProcessTaskId(),
				Map.of(BpmnProcessConstants.REQUEST_ID, requestTask.getRequest().getId(),
					BpmnProcessConstants.REVIEW_DETERMINATION, determinationType,
					BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.NOTIFY_OPERATOR)
			);
    	}
	}

	@Override
	public String getRequestType() {
		return MrtmRequestType.EMP_ISSUANCE;
	}
}
