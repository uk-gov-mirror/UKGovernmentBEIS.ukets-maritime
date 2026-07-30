package uk.gov.mrtm.api.workflow.request.flow.common.emp.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.event.EmpReviewDocumentGenerateDto;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileStatus;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;

@ExtendWith(MockitoExtension.class)
class EmpReviewPreviewEmpDocumentActionHandlerTest {

	@InjectMocks
    private EmpReviewPreviewEmpDocumentActionHandler cut;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private EmpReviewDocumentGenerateService empReviewDocumentGenerateService;

    @Test
    void process() {
    	Long requestTaskId = 1L;
    	String requestTaskActionType = "actiontype";
    	AppUser appUser = AppUser.builder().userId("user").build();
    	DecisionNotification decision = DecisionNotification.builder().signatory("sign").build();
    	NotifyOperatorForDecisionRequestTaskActionPayload payload = NotifyOperatorForDecisionRequestTaskActionPayload.builder()
    			.decisionNotification(decision)
    			.build();
    	
    	EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder()
    			.build();
    	
    	RequestTask requestTask = RequestTask.builder()
                .id(requestTaskId)
                .payload(requestTaskPayload)
                .build();
    	
    	String asyncJobId = "123";
    	
    	when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);
    	
    	when(empReviewDocumentGenerateService.generate(EmpReviewDocumentGenerateDto.builder()
				.type(RequestGeneratedFileType.EMP)
				.requestTaskId(requestTaskId)
				.stage(DocumentTemplateStage.PREVIEW)
				.decisionNotification(payload.getDecisionNotification())
				.build()))
    	.thenReturn(asyncJobId);
    	
    	cut.process(requestTaskId, requestTaskActionType, appUser, payload);
    	
		assertThat(requestTaskPayload.getPreviewFiles().get(RequestGeneratedFileType.EMP)).isEqualTo(
				RequestTaskPreviewFileInfoDTO.builder()
					.asyncJobId(asyncJobId)	
					.status(RequestTaskPreviewFileStatus.IN_PROGRESS).build());
    	
    	verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
    	verify(empReviewDocumentGenerateService, times(1)).generate(EmpReviewDocumentGenerateDto.builder()
			.type(RequestGeneratedFileType.EMP)
			.requestTaskId(requestTask.getId())
			.stage(DocumentTemplateStage.PREVIEW)
			.decisionNotification(decision)
			.build());
    }

	@Test
	void getTypes() {
		assertThat(cut.getTypes())
			.containsExactly(MrtmRequestTaskActionType.EMP_ISSUANCE_REVIEW_PREVIEW_EMP_DOCUMENT,
				MrtmRequestTaskActionType.EMP_VARIATION_REVIEW_PREVIEW_EMP_DOCUMENT,
				MrtmRequestTaskActionType.EMP_VARIATION_SUBMIT_REGULATOR_LED_PREVIEW_EMP_DOCUMENT);
	}
}
