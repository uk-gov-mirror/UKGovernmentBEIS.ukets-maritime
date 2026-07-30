package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.event.EmpReviewDocumentGenerateDto;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.handler.EmpReviewDocumentGenerateService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service.RequestEmpReviewService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.validation.EmpIssuanceReviewNotifyOperatorValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceReviewNotifyOperatorActionHandlerTest {

    @InjectMocks
    private EmpIssuanceReviewNotifyOperatorActionHandler cut;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private RequestEmpReviewService requestEmpReviewService;

    @Mock
    private EmpIssuanceReviewNotifyOperatorValidatorService empIssuanceReviewNotifyOperatorValidatorService;

    @Mock
    private EmpReviewDocumentGenerateService empReviewDocumentGenerateService;

    @ParameterizedTest
    @MethodSource
    void process(EmpIssuanceDeterminationType determinationType, int generateEmpInvocations) {
        Long requestTaskId = 1L;
        String requestId = "REQUEST-1";
        String requestTaskActionType = MrtmRequestTaskActionType.EMP_ISSUANCE_NOTIFY_OPERATOR_FOR_DECISION;
        AppUser appUser = AppUser.builder().build();

        DecisionNotification decisionNotification = DecisionNotification.builder().build();

        NotifyOperatorForDecisionRequestTaskActionPayload requestTaskActionPayload =
            NotifyOperatorForDecisionRequestTaskActionPayload.builder()
                .decisionNotification(decisionNotification)
                .build();

        EmpIssuanceRequestPayload requestPayload = EmpIssuanceRequestPayload.builder()
            .determination(EmpIssuanceDetermination.builder().type(determinationType).build())
            .build();

        Request request = Request.builder().id(requestId).payload(requestPayload).build();

        EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload = EmpIssuanceApplicationReviewRequestTaskPayload.builder()
            .determination(EmpIssuanceDetermination.builder()
                .type(determinationType)
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
        verify(requestEmpReviewService,times(1))
            .saveDecisionNotification(requestTask, decisionNotification, appUser);
        verify(empIssuanceReviewNotifyOperatorValidatorService, times(1))
            .validate(requestTask, requestTaskActionPayload, appUser);
        verify(empReviewDocumentGenerateService, times(generateEmpInvocations)).generate(EmpReviewDocumentGenerateDto.builder()
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

    private static Stream<Arguments> process() {
        return Stream.of(
            Arguments.of(EmpIssuanceDeterminationType.APPROVED, 1),
            Arguments.of(EmpIssuanceDeterminationType.DEEMED_WITHDRAWN, 0)
        );
    }

    @Test
    void getTypes() {
        assertThat(cut.getTypes())
            .containsExactly(MrtmRequestTaskActionType.EMP_ISSUANCE_NOTIFY_OPERATOR_FOR_DECISION);
    }
}
