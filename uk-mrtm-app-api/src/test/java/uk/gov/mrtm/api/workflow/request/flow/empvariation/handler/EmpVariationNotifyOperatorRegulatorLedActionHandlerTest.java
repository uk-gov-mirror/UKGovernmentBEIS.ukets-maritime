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
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationSubmitRegulatorLedService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.validator.EmpVariationNotifyOperatorRegulatorLedValidator;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EmpVariationNotifyOperatorRegulatorLedActionHandlerTest {

    @InjectMocks
    private EmpVariationNotifyOperatorRegulatorLedActionHandler cut;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private EmpVariationSubmitRegulatorLedService empVariationSubmitRegulatorLedService;

    @Mock
    private EmpVariationNotifyOperatorRegulatorLedValidator validator;

    @Mock
    private EmpReviewDocumentGenerateService empReviewDocumentGenerateService;

    @Test
    void process() {
        Long requestTaskId = 1L;
        String requestTaskActionType = MrtmRequestTaskActionType.EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_REGULATOR_LED;
        AppUser appUser = AppUser.builder().userId("userId").build();
        DecisionNotification decision = DecisionNotification.builder()
                .operators(Set.of("op1"))
                .build();
        NotifyOperatorForDecisionRequestTaskActionPayload payload = NotifyOperatorForDecisionRequestTaskActionPayload.builder()
                .decisionNotification(decision)
                .build();

        EmpVariationRequestPayload requestPayload = EmpVariationRequestPayload.builder()
        		.determination(EmpVariationDetermination.builder().type(EmpVariationDeterminationType.APPROVED).build())
        		.build();
        
        Request request = Request.builder().id("requestId").payload(requestPayload).build();
        
        EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload requestTaskPayload = EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload.builder()
        		.build();
        
        RequestTask requestTask = RequestTask.builder()
                .id(requestTaskId)
                .processTaskId("process-task-id")
                .request(request)
                .payload(requestTaskPayload)
                .build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);

        cut.process(requestTaskId, requestTaskActionType, appUser, payload);
        
        assertThat(requestTaskPayload.getFinalDocumentsGenerationInProgress()).isTrue();
        assertThat(requestTaskPayload.getFinalDocumentsGenerationSuccessful()).isNull();

        verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
        verify(validator, times(1)).validate(requestTask, payload, appUser);
        verify(empVariationSubmitRegulatorLedService, times(1)).saveDecisionNotification(requestTask,
                payload.getDecisionNotification(), appUser);
        verify(empReviewDocumentGenerateService, times(1)).generate(EmpReviewDocumentGenerateDto.builder()
        			.requestTaskId(requestTask.getId())
        			.type(RequestGeneratedFileType.EMP)
        			.stage(DocumentTemplateStage.FINAL)
        			.decisionNotification(decision)
        			.build());
        verify(empReviewDocumentGenerateService, times(1)).generate(EmpReviewDocumentGenerateDto.builder()
    			.requestTaskId(requestTask.getId())
    			.type(RequestGeneratedFileType.OFFICIAL_NOTICE)
    			.stage(DocumentTemplateStage.FINAL)
    			.decisionNotification(decision)
    			.build());

        assertThat(request.getSubmissionDate()).isNotNull();
    }

    @Test
    void getTypes() {
        assertThat(cut.getTypes())
                .containsExactly(MrtmRequestTaskActionType.EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_REGULATOR_LED);
    }
}
