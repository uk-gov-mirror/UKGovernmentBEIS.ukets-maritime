package uk.gov.mrtm.api.workflow.request.flow.common.service.docgen.async;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.files.attachments.service.FileAttachmentService;
import uk.gov.netz.api.files.common.FileConstants;
import uk.gov.netz.api.files.common.domain.FileStatus;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.files.common.utils.MimeTypeUtils;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileStatus;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.docgenerator.client.DocumentGeneratorClient;

@ExtendWith(MockitoExtension.class)
class DocumentGenerationPreviewCompletedServiceTest {

	@InjectMocks
    private DocumentGenerationPreviewCompletedService cut;

    @Mock
    private RequestTaskService requestTaskService;
    
    @Mock
    private FileAttachmentService fileAttachmentService;
    
    @Mock
    private DocumentGeneratorClient documentGeneratorClient;
    
    @Test
    void completed() {
    	Long requestTaskId = 1l;
    	RequestGeneratedFileType fileType = RequestGeneratedFileType.EMP;
    	FileInfoDTO fileInfoDTO = FileInfoDTO.builder()
    			.name("name")
    			.uuid("uuid")
    			.build();
    	
    	byte[] bytes = "bytes".getBytes();
    	
    	FileDTO fileAttachmentDTO = FileDTO.builder()
    	        .fileContent(bytes)
    	        .fileName(fileInfoDTO.getName())
    	        .fileType(MimeTypeUtils.detect(bytes, fileInfoDTO.getName()))
    	        .fileSize(bytes.length)
    	        .createdBy(FileConstants.SYSTEM_USER)
    	        .build();
    	
    	String jobId = "12";
    	EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder()
    			.previewFiles(Map.of(
    					fileType, RequestTaskPreviewFileInfoDTO.builder()
    									.asyncJobId(jobId)
    									.status(RequestTaskPreviewFileStatus.IN_PROGRESS).build()
    					))
    			.build();
    	RequestTask requestTask = RequestTask.builder()
    			.payload(requestTaskPayload)
    			.build();
		when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);
		when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);
		
		when(documentGeneratorClient.downloadBytes(fileInfoDTO.getUuid()))
			.thenReturn(bytes);
    	
		cut.completed(requestTaskId, fileType, fileInfoDTO, jobId);
		
		assertThat(requestTaskPayload.getPreviewFiles().get(RequestGeneratedFileType.EMP).getFile()).isEqualTo(fileInfoDTO);
		assertThat(requestTaskPayload.getPreviewFiles().get(RequestGeneratedFileType.EMP).getStatus())
				.isEqualTo(RequestTaskPreviewFileStatus.COMPLETED);
		assertThat(requestTaskPayload.getPreviewFiles().get(RequestGeneratedFileType.EMP).getCreatedDate()).isNotNull();
		
    	verify(requestTaskService, times(1)).findTaskById(requestTaskId);
    	verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
    	verify(documentGeneratorClient, times(1)).downloadBytes(fileInfoDTO.getUuid());
		verify(fileAttachmentService, times(1)).createFileAttachment(fileAttachmentDTO, FileStatus.PENDING,
				fileInfoDTO.getUuid());
    }
    
    @Test
    void completed_different_jobId() {
    	Long requestTaskId = 1l;
    	RequestGeneratedFileType fileType = RequestGeneratedFileType.EMP;
    	FileInfoDTO fileInfoDTO = FileInfoDTO.builder()
    			.name("name")
    			.uuid("uuid")
    			.build();
    	
    	String jobId = "123";
    	EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder()
    			.previewFiles(Map.of(
    					fileType, RequestTaskPreviewFileInfoDTO.builder()
    									.asyncJobId(jobId)
    									.status(RequestTaskPreviewFileStatus.IN_PROGRESS).build()
    					))
    			.build();
    	RequestTask requestTask = RequestTask.builder()
    			.payload(requestTaskPayload)
    			.build();
		when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);
		
		cut.completed(requestTaskId, fileType, fileInfoDTO, "anotherJobId");
		
    	verify(requestTaskService, times(1)).findTaskById(requestTaskId);
    	verifyNoInteractions(documentGeneratorClient, fileAttachmentService);
    }
    
}
