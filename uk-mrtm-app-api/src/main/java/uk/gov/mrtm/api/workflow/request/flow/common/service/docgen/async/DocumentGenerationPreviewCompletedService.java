package uk.gov.mrtm.api.workflow.request.flow.common.service.docgen.async;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestTaskDocumentAsyncGeneratedDataPayload;
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

@Log4j2
@Service
@RequiredArgsConstructor
public class DocumentGenerationPreviewCompletedService {
	
	private final RequestTaskService requestTaskService;
	private final FileAttachmentService fileAttachmentService;
	private final DocumentGeneratorClient documentGeneratorClient;

	@Transactional
	public void completed(Long requestTaskId, RequestGeneratedFileType fileType, FileInfoDTO fileInfoDTO, String jobId) {
		// Cheap pre-check without lock — skip stale/duplicate jobs before downloading
		if (!isCurrentPreviewJob(requestTaskService.findTaskById(requestTaskId), fileType, jobId, requestTaskId)) {
			return;
		}

		final byte[] bytes = documentGeneratorClient.downloadBytes(fileInfoDTO.getUuid());
		final FileDTO fileAttachmentDTO = FileDTO.builder()
		        .fileContent(bytes)
		        .fileName(fileInfoDTO.getName())
		        .fileType(MimeTypeUtils.detect(bytes, fileInfoDTO.getName()))
		        .fileSize(bytes.length)
		        .createdBy(FileConstants.SYSTEM_USER)
		        .build();

		// Lock after download so concurrent user actions are serialized on a short critical section
		final RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);
		if (!isCurrentPreviewJob(requestTask, fileType, jobId, requestTaskId)) {
			return;
		}

		final RequestTaskPreviewFileInfoDTO previewFileInfoDTO =
				((RequestTaskDocumentAsyncGeneratedDataPayload) requestTask.getPayload()).getPreviewFiles().get(fileType);
		
		/**
		 * set status as PENDING so as to be removed upon the task completion 
		 * by {@link uk.gov.netz.api.workflow.request.flow.common.service.RequestTaskAttachmentsUncoupleService}
		 */
		fileAttachmentService.createFileAttachment(fileAttachmentDTO, FileStatus.PENDING, fileInfoDTO.getUuid());
		
		previewFileInfoDTO.setFile(fileInfoDTO);
		previewFileInfoDTO.setCreatedDate(LocalDateTime.now());
		
		if(isFileInProgressStatus(previewFileInfoDTO)) {
			previewFileInfoDTO.setStatus(RequestTaskPreviewFileStatus.COMPLETED);
		}
	}

	private boolean isCurrentPreviewJob(RequestTask requestTask, RequestGeneratedFileType fileType, String jobId,
			Long requestTaskId) {
		final RequestTaskDocumentAsyncGeneratedDataPayload requestTaskPayload =
				(RequestTaskDocumentAsyncGeneratedDataPayload) requestTask.getPayload();
		final RequestTaskPreviewFileInfoDTO previewFileInfoDTO = requestTaskPayload.getPreviewFiles().get(fileType);

		if (previewFileInfoDTO == null) {
			log.warn("Preview file for request task id {} for type {} not found", requestTaskId, fileType);
			return false;
		}

		if (!previewFileInfoDTO.getAsyncJobId().equals(jobId)) {
			log.warn(
					"Job id {} is not equal to the existing job Id in preview payload map {}. The current file will be ignored",
					jobId, previewFileInfoDTO.getAsyncJobId());
			return false;
		}

		return true;
	}
	
	private boolean isFileInProgressStatus(RequestTaskPreviewFileInfoDTO previewFileInfoDTO) {
		return previewFileInfoDTO.getStatus() == RequestTaskPreviewFileStatus.IN_PROGRESS;
	}
}
