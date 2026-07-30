package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.event.EmpReviewDocumentGenerateDto;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.handler.EmpReviewDocumentGenerateService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewNotifyOperatorValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpVariationReviewNotifyOperatorActionHandlerTest {

    @InjectMocks
    private EmpVariationReviewNotifyOperatorActionHandler cut;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private EmpVariationReviewService empVariationReviewService;

    @Mock
    private EmpVariationReviewNotifyOperatorValidatorService reviewNotifyOperatorValidatorService;

    @Mock
    private EmpReviewDocumentGenerateService empReviewDocumentGenerateService;

    @Test
    void process() {
        Long requestTaskId = 1L;
        String requestId = "REQUEST-1";
        String requestTaskActionType = MrtmRequestTaskActionType.EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION;
        AppUser appUser = AppUser.builder().build();
        
        DecisionNotification decisionNotification = DecisionNotification.builder().build();
        
        NotifyOperatorForDecisionRequestTaskActionPayload requestTaskActionPayload =
                NotifyOperatorForDecisionRequestTaskActionPayload.builder()
                        .decisionNotification(decisionNotification)
                        .build();
        
        EmpVariationRequestPayload requestPayload = EmpVariationRequestPayload.builder()
        		.determination(EmpVariationDetermination.builder().type(EmpVariationDeterminationType.APPROVED).build())
        		.build();
        
        Request request = Request.builder().id(requestId).payload(requestPayload).build();
        
        EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder()
        		.determination(EmpVariationDetermination.builder()
        				.type(EmpVariationDeterminationType.APPROVED)
        				.build())
        		.build();
        
        RequestTask requestTask = RequestTask.builder()
                .id(requestTaskId)
                .processTaskId("process-task-id")
                .request(request)
                .payload(requestTaskPayload)
                .build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);

        //invoke
        cut.process(requestTaskId, requestTaskActionType, appUser, requestTaskActionPayload);
        
        assertThat(requestTaskPayload.getFinalDocumentsGenerationInProgress()).isTrue();
        assertThat(requestTaskPayload.getFinalDocumentsGenerationSuccessful()).isNull();

        verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
        verify(empVariationReviewService,times(1))
                .saveDecisionNotification(requestTask, decisionNotification, appUser);
        verify(reviewNotifyOperatorValidatorService, times(1))
                .validate(requestTask, requestTaskActionPayload, appUser);
        verify(empReviewDocumentGenerateService, times(1)).generate(EmpReviewDocumentGenerateDto.builder()
    			.requestTaskId(requestTask.getId())
    			.type(RequestGeneratedFileType.EMP)
    			.stage(DocumentTemplateStage.FINAL)
    			.decisionNotification(decisionNotification)
    			.build());
	    verify(empReviewDocumentGenerateService, times(1)).generate(EmpReviewDocumentGenerateDto.builder()
				.requestTaskId(requestTask.getId())
				.type(RequestGeneratedFileType.OFFICIAL_NOTICE)
				.stage(DocumentTemplateStage.FINAL)
				.decisionNotification(decisionNotification)
				.build());
    }

    @Test
    void getTypes() {
        assertThat(cut.getTypes())
                .containsExactly(MrtmRequestTaskActionType.EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION);
    }
}
