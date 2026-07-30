package uk.gov.mrtm.api.workflow.request.flow.common.emp.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.event.EmpReviewDocumentGenerateDto;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.service.EmpDocumentGenerateService;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestType;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

@ExtendWith(MockitoExtension.class)
class EmpReviewDocumentGenerateServiceTest {

	@Mock
	private RequestTaskService requestTaskService;

	@Mock
	private EmpDocumentGenerateService empDocumentGenerateService;

	@InjectMocks
	private EmpReviewDocumentGenerateService cut;

	@BeforeEach
	void setUp() {
		cut = new EmpReviewDocumentGenerateService(requestTaskService,
				List.of(empDocumentGenerateService));
	}

	@Test
	void generate() {
		Long requestTaskId = 1L;
		DecisionNotification decision = DecisionNotification.builder().signatory("sign").build();
		EmpReviewDocumentGenerateDto dto = EmpReviewDocumentGenerateDto.builder()
				.requestTaskId(requestTaskId)
				.type(RequestGeneratedFileType.EMP)
				.stage(DocumentTemplateStage.PREVIEW)
				.decisionNotification(decision)
				.build();

		Request request = mock(Request.class);
		RequestType requestType = mock(RequestType.class);
		RequestTask requestTask = mock(RequestTask.class);
		
		String asyncJobId = "ASYNC_JOB_123";

		when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);
		when(requestTask.getRequest()).thenReturn(request);
		when(request.getType()).thenReturn(requestType);
		when(requestType.getCode()).thenReturn("EMP_REVIEW");

		when(empDocumentGenerateService.getRequestType()).thenReturn("EMP_REVIEW");

		when(empDocumentGenerateService.generateDocument(dto.getType(), dto.getRequestTaskId(), dto.getStage(), dto.getDecisionNotification()))
				.thenReturn(asyncJobId);

		String actualResult = cut.generate(dto);

		assertThat(actualResult).isEqualTo(asyncJobId);
		
		// then
		verify(requestTaskService).findTaskById(requestTaskId);

		verify(empDocumentGenerateService).generateDocument(dto.getType(), requestTaskId, dto.getStage(), dto.getDecisionNotification());
	}

}
