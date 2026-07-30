package uk.gov.mrtm.api.workflow.request.flow.common.service.docgen.async;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileStatus;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

@ExtendWith(MockitoExtension.class)
class DocumentGenerationConversionFailedServiceTest {

	@InjectMocks
    private DocumentGenerationConversionFailedService cut;

    @Mock
    private RequestTaskService requestTaskService;
    
    @Test
    void failed_preview() {
    	Long requestTaskId = 1l;
    	RequestGeneratedFileType type = RequestGeneratedFileType.EMP;
    	DocumentTemplateStage stage = DocumentTemplateStage.PREVIEW;
    	
    	EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder()
    			.previewFiles(Map.of(
    					RequestGeneratedFileType.EMP, RequestTaskPreviewFileInfoDTO.builder().status(RequestTaskPreviewFileStatus.IN_PROGRESS).build()
    					))
    			.build();
    	RequestTask requestTask = RequestTask.builder()
    			.payload(requestTaskPayload)
    			.build();
		when(requestTaskService.findTaskByIdForUpdate(requestTaskId))
				.thenReturn(requestTask);
    	
		cut.failed(requestTaskId, type, stage);
		
		assertThat(requestTaskPayload.getPreviewFiles().get(RequestGeneratedFileType.EMP).getStatus())
				.isEqualTo(RequestTaskPreviewFileStatus.FAILED);
    	verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
    }
    
    @Test
    void failed_final() {
    	Long requestTaskId = 1l;
    	RequestGeneratedFileType type = RequestGeneratedFileType.EMP;
    	DocumentTemplateStage stage = DocumentTemplateStage.FINAL;
    	
    	EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder().build();
    	RequestTask requestTask = RequestTask.builder()
    			.payload(requestTaskPayload)
    			.build();
		when(requestTaskService.findTaskByIdForUpdate(requestTaskId))
				.thenReturn(requestTask);
    	
		cut.failed(requestTaskId, type, stage);
		
		assertThat(requestTaskPayload.getFinalDocumentsGenerationInProgress()).isFalse();
		assertThat(requestTaskPayload.getFinalDocumentsGenerationSuccessful()).isFalse();
    	verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
    }
}
