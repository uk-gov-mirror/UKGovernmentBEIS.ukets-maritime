package uk.gov.mrtm.api.workflow.request.flow.common.service.docgen.async;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.files.documents.service.storage.FileDocumentStorageService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestType;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.docgenerator.client.DocumentGeneratorClient;

@ExtendWith(MockitoExtension.class)
class DocumentGenerationFinalCompletedDelegatorTest {

	@Mock
	private RequestTaskService requestTaskService;

	@Mock
	private DocumentGeneratorClient documentGeneratorClient;

	@Mock
	private FileDocumentStorageService fileDocumentStorageService;

	@Mock
	private DocumentGenerationFinalCompletedService completedService;

	private DocumentGenerationFinalCompletedDelegator cut;

	@BeforeEach
	void setUp() {
		cut = new DocumentGenerationFinalCompletedDelegator(requestTaskService, documentGeneratorClient,
				fileDocumentStorageService, List.of(completedService));
	}

	@Test
	void completed() {
		// given
		Long requestTaskId = 1L;

		FileInfoDTO inputFileInfo = FileInfoDTO.builder().uuid("uuid-123").name("document.pdf").build();

		byte[] bytes = "pdf-content".getBytes();

		RequestTask requestTask = mock(RequestTask.class);
		Request request = mock(Request.class);
		RequestType requestType = mock(RequestType.class);

		when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);
		when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);

		when(requestTask.getRequest()).thenReturn(request);

		when(request.getType()).thenReturn(requestType);

		when(requestType.getCode()).thenReturn("EMP_REVIEW");

		when(documentGeneratorClient.downloadBytes("uuid-123")).thenReturn(bytes);

		FileInfoDTO storedFileInfo = FileInfoDTO.builder().uuid("uuid-123").name("document.pdf").build();

		when(fileDocumentStorageService.createFileDocumentWithUuid(bytes, "document.pdf", "uuid-123"))
				.thenReturn(storedFileInfo);

		when(completedService.getRequestType()).thenReturn("EMP_REVIEW");

		// when
		cut.completed(requestTaskId, RequestGeneratedFileType.EMP, inputFileInfo);

		// then
		verify(requestTaskService).findTaskById(requestTaskId);
		verify(requestTaskService).findTaskByIdForUpdate(requestTaskId);

		verify(documentGeneratorClient).downloadBytes("uuid-123");

		verify(fileDocumentStorageService).createFileDocumentWithUuid(bytes, "document.pdf", "uuid-123");

		verify(completedService).completed(requestTask, RequestGeneratedFileType.EMP, storedFileInfo);
	}

}
