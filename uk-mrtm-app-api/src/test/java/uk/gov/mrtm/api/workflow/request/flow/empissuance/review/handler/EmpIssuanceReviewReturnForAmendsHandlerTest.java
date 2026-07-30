package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service.RequestEmpReviewService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.validation.EmpIssuanceReviewReturnForAmendsValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.constants.RequestTaskActionPayloadTypes;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionRequiredChange;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceReviewReturnForAmendsHandlerTest {

    @InjectMocks
    private EmpIssuanceReviewReturnForAmendsHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private RequestService requestService;

    @Mock
    private RequestEmpReviewService service;

    @Mock
    private EmpIssuanceReviewReturnForAmendsValidatorService validatorService;

    @Mock
    private WorkflowService workflowService;

    @Test
    void doProcess() {
        long taskId = 1L;
        RequestTaskActionEmptyPayload emptyPayload = RequestTaskActionEmptyPayload.builder().payloadType(RequestTaskActionPayloadTypes.EMPTY_PAYLOAD).build();
        String userId = "userId";
        AppUser appUser = AppUser.builder().userId(userId).build();

        String processTaskId = "processTaskId";

        EmpIssuanceReviewDecision reviewAmendDecision = EmpIssuanceReviewDecision.builder()
            .type(EmpReviewDecisionType.OPERATOR_AMENDS_NEEDED)
            .details(ChangesRequiredDecisionDetails.builder()
                .requiredChanges(Collections.singletonList(new ReviewDecisionRequiredChange("changesRequired", Collections.emptySet()))).build())
            .build();
        EmpIssuanceReviewDecision reviewNoAmendDecision = EmpIssuanceReviewDecision.builder()
            .type(EmpReviewDecisionType.ACCEPTED).build();
        EmpIssuanceApplicationReviewRequestTaskPayload payload =
            EmpIssuanceApplicationReviewRequestTaskPayload.builder()
                .reviewGroupDecisions(Map.of(
                    EmpReviewGroup.ABBREVIATIONS_AND_DEFINITIONS, reviewAmendDecision,
                    EmpReviewGroup.ADDITIONAL_DOCUMENTS, reviewNoAmendDecision
                )).build();

        Request request = Request.builder()
            .id("2")
            .payload(EmpIssuanceRequestPayload.builder().build())
            .build();
        RequestTask requestTask = RequestTask.builder()
            .id(taskId)
            .processTaskId(processTaskId)
            .payload(payload)
            .request(request)
            .build();

        EmpIssuanceApplicationReturnedForAmendsRequestActionPayload actionPayload =
            EmpIssuanceApplicationReturnedForAmendsRequestActionPayload.builder()
                .payloadType(MrtmRequestActionPayloadType.EMP_ISSUANCE_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD)
                .reviewGroupDecisions(Map.of(EmpReviewGroup.ABBREVIATIONS_AND_DEFINITIONS, reviewAmendDecision))
                .build();

        EmpIssuanceRequestPayload newEmpIssuanceRequestPayload = EmpIssuanceRequestPayload.builder()
            .reviewGroupDecisions(Map.of(EmpReviewGroup.ABBREVIATIONS_AND_DEFINITIONS, reviewAmendDecision))
            .build();
        Request newRequest = Request.builder()
            .id("2")
            .payload(newEmpIssuanceRequestPayload)
            .build();

        when(requestTaskService.findTaskByIdForUpdate(taskId)).thenReturn(requestTask);

        // Invoke
        RequestTaskPayload requestTaskPayload = handler.process(taskId,
            MrtmRequestTaskActionType.EMP_ISSUANCE_REVIEW_RETURN_FOR_AMENDS, appUser, emptyPayload);

        // Verify
        assertThat(requestTaskPayload).isEqualTo(payload);
        verify(requestTaskService).findTaskByIdForUpdate(taskId);
        verify(validatorService).validate(payload);
        verify(service).saveRequestReturnForAmends(requestTask, appUser);
        verify(requestService)
            .addActionToRequest(newRequest, actionPayload, MrtmRequestActionType.EMP_ISSUANCE_APPLICATION_RETURNED_FOR_AMENDS, userId);
        verify(workflowService)
            .completeTask(processTaskId, Map.of(BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.AMENDS_NEEDED.name()));
        verifyNoMoreInteractions(requestTaskService,
            requestService,
            service,
            workflowService,
            validatorService);
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes())
            .containsExactlyElementsOf(List.of(MrtmRequestTaskActionType.EMP_ISSUANCE_REVIEW_RETURN_FOR_AMENDS));
    }
}
