package uk.gov.mrtm.api.workflow.request.flow.common.service.docgen.async;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.files.documents.service.storage.FileDocumentStorageService;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.docgenerator.client.DocumentGeneratorClient;

@Service
@RequiredArgsConstructor
public class DocumentGenerationFinalCompletedDelegator {

	private final RequestTaskService requestTaskService;
	private final DocumentGeneratorClient documentGeneratorClient;
	private final FileDocumentStorageService fileDocumentStorageService;
	private final List<DocumentGenerationFinalCompletedService> services;
	
	@Transactional
	public void completed(Long requestTaskId, RequestGeneratedFileType fileType, FileInfoDTO fileInfoDTO) {
		// Resolve target service before download/persist to avoid orphaned documents
		final RequestTask requestTaskForLookup = requestTaskService.findTaskById(requestTaskId);
		final String requestType = requestTaskForLookup.getRequest().getType().getCode();
		final DocumentGenerationFinalCompletedService service = services.stream()
				.filter(s -> requestType.equals(s.getRequestType()))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException(
						"Document generation final completed service not fould for request type: " + requestType));

		final byte[] bytes = documentGeneratorClient.downloadBytes(fileInfoDTO.getUuid());
		final FileInfoDTO fileDocumentDTO = fileDocumentStorageService.createFileDocumentWithUuid(bytes, fileInfoDTO.getName(),
				fileInfoDTO.getUuid());

		final RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);
		service.completed(requestTask, fileType, fileDocumentDTO);
	}
}
