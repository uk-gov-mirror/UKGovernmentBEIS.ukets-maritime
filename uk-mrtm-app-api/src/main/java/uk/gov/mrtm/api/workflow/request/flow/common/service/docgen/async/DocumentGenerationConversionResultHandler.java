package uk.gov.mrtm.api.workflow.request.flow.common.service.docgen.async;

import java.util.Map;

import org.springframework.core.annotation.Order;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.DocumentGenerationEventOutcome;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateGeneratorParamConstants;
import uk.gov.netz.docgenerator.client.ConversionResultHandler;
import uk.gov.netz.docgenerator.client.model.ConversionEvent;

@Log4j2
@Service
@Order(100)
@RequiredArgsConstructor
public class DocumentGenerationConversionResultHandler implements ConversionResultHandler {
	
	private final DocumentGenerationConversionFailedService failedService;
	private final DocumentGenerationPreviewCompletedService previewGenerationCompletedService;
	private final DocumentGenerationFinalCompletedDelegator finalGenerationCompletedService;

	@Override
    @Retryable(
        retryFor = ObjectOptimisticLockingFailureException.class,
        maxAttempts = 3
    )
	public void handle(ConversionEvent event) {
		final Map<String, String> documentMetadata = event.getMetadata();
		final Long requestTaskId = Long
				.valueOf(documentMetadata.get(DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID));
		final RequestGeneratedFileType fileType = RequestGeneratedFileType
				.valueOf((String) documentMetadata.get(DocumentTemplateGeneratorParamConstants.FILE_TYPE));
		final String fileName = (String) documentMetadata.get(DocumentTemplateGeneratorParamConstants.FILE_NAME);
		final DocumentTemplateStage stage = DocumentTemplateStage
				.valueOf((String) documentMetadata.get(DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE));
		
		try {
			if(DocumentGenerationEventOutcome.FAILED.name().equals(event.getStatus())) {
				failedService.failed(requestTaskId, fileType, stage);
				return;
			}
			
			final String jobId = event.getJobId();
			
			final FileInfoDTO fileInfoDTO = FileInfoDTO.builder()
					.name(fileName)
					.uuid(jobId)
					.build();
			
			switch (stage) {
			case PREVIEW -> previewGenerationCompletedService.completed(requestTaskId, fileType, fileInfoDTO, jobId);
			case FINAL -> finalGenerationCompletedService.completed(requestTaskId, fileType, fileInfoDTO);
			default -> throw new UnsupportedOperationException(stage.name());
			}
		} catch (ObjectOptimisticLockingFailureException ole) {
			throw ole;
		} catch (Exception e) {
			log.error("Unexpected execution occurred for jobId {}", event.getJobId(), e);
	        failedService.failed(requestTaskId, fileType, stage);
		}
		
	}

}
