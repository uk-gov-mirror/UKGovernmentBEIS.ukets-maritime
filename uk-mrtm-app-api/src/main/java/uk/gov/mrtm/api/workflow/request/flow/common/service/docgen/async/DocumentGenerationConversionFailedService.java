package uk.gov.mrtm.api.workflow.request.flow.common.service.docgen.async;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestTaskDocumentAsyncGeneratedDataPayload;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileStatus;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

@Log4j2
@Service
@RequiredArgsConstructor
public class DocumentGenerationConversionFailedService {
	
	private final RequestTaskService requestTaskService;

	@Transactional
	public void failed(Long requestTaskId,
			RequestGeneratedFileType type, DocumentTemplateStage stage) {
		final RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);
    	
		final RequestTaskDocumentAsyncGeneratedDataPayload requestTaskPayload = (RequestTaskDocumentAsyncGeneratedDataPayload) requestTask
				.getPayload();

		switch (stage) {
		case PREVIEW -> {
			final RequestTaskPreviewFileInfoDTO previewFileInfoDTO = requestTaskPayload.getPreviewFiles().get(type);
			if(previewFileInfoDTO == null) {
				log.warn("Preview file for request task id {} for type {} not found", requestTaskId, type);
				return;
			}
			previewFileInfoDTO.setStatus(RequestTaskPreviewFileStatus.FAILED);
		}
		case FINAL -> {
			requestTaskPayload.setFinalDocumentsGenerationSuccessful(false);
			requestTaskPayload.setFinalDocumentsGenerationInProgress(false);
		}
		default -> throw new UnsupportedOperationException(stage.name());
		}
		
    }
}
