package uk.gov.mrtm.api.workflow.request.flow.common.service.docgen.async;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.workflow.request.flow.common.domain.DocumentGenerationEventOutcome;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateGeneratorParamConstants;
import uk.gov.netz.docgenerator.client.model.ConversionEvent;

@ExtendWith(MockitoExtension.class)
class DocumentGenerationConversionResultHandlerTest {

	@Mock
	private DocumentGenerationConversionFailedService failedService;

	@Mock
	private DocumentGenerationPreviewCompletedService previewCompletedService;

	@Mock
	private DocumentGenerationFinalCompletedDelegator finalCompletedService;

	@InjectMocks
	private DocumentGenerationConversionResultHandler cut;

	@Test
	void shouldHandleFailedConversion_failed() {
		// given
		ConversionEvent event = mock(ConversionEvent.class);

		Map<String, String> metadata = new HashMap<>();
		metadata.put(DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID, "1");
		metadata.put(DocumentTemplateGeneratorParamConstants.FILE_TYPE, RequestGeneratedFileType.EMP.name());
		metadata.put(DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE,
				DocumentTemplateStage.PREVIEW.name());
		metadata.put(DocumentTemplateGeneratorParamConstants.FILE_NAME, "preview.pdf");

		when(event.getMetadata()).thenReturn(metadata);
		when(event.getStatus()).thenReturn(DocumentGenerationEventOutcome.FAILED.name());

		// when
		cut.handle(event);

		// then
		verify(failedService).failed(1L, RequestGeneratedFileType.EMP, DocumentTemplateStage.PREVIEW);

		verifyNoInteractions(previewCompletedService, finalCompletedService);
	}
	
	@Test
	void shouldHandleFailedConversion_preview() {
		// given
		ConversionEvent event = mock(ConversionEvent.class);

		Map<String, String> metadata = new HashMap<>();
		metadata.put(DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID, "1");
		metadata.put(DocumentTemplateGeneratorParamConstants.FILE_TYPE, RequestGeneratedFileType.EMP.name());
		metadata.put(DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE,
				DocumentTemplateStage.PREVIEW.name());
		metadata.put(DocumentTemplateGeneratorParamConstants.FILE_NAME, "preview.pdf");

		when(event.getMetadata()).thenReturn(metadata);
		when(event.getStatus()).thenReturn(DocumentGenerationEventOutcome.COMPLETE.name());
		when(event.getJobId()).thenReturn("jobId");

		// when
		cut.handle(event);

		// then
		verify(previewCompletedService, times(1)).completed(1L, RequestGeneratedFileType.EMP, FileInfoDTO.builder()
				.name("preview.pdf")
				.uuid("jobId")
				.build(),
				"jobId");

		verifyNoInteractions(finalCompletedService, failedService);
	}
	
	@Test
	void shouldHandleFailedConversion_final() {
		// given
		ConversionEvent event = mock(ConversionEvent.class);

		Map<String, String> metadata = new HashMap<>();
		metadata.put(DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID, "1");
		metadata.put(DocumentTemplateGeneratorParamConstants.FILE_TYPE, RequestGeneratedFileType.EMP.name());
		metadata.put(DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE,
				DocumentTemplateStage.FINAL.name());
		metadata.put(DocumentTemplateGeneratorParamConstants.FILE_NAME, "final.pdf");

		when(event.getMetadata()).thenReturn(metadata);
		when(event.getStatus()).thenReturn(DocumentGenerationEventOutcome.COMPLETE.name());
		when(event.getJobId()).thenReturn("jobId");

		// when
		cut.handle(event);

		// then
		verify(finalCompletedService, times(1)).completed(1L, RequestGeneratedFileType.EMP, FileInfoDTO.builder()
				.name("final.pdf")
				.uuid("jobId")
				.build());

		verifyNoInteractions(previewCompletedService, failedService);
	}

}
