package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.common.exception.MrtmErrorCode;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.validator.EmpVariationReviewReturnForAmendsValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.constants.RequestTaskActionPayloadTypes;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionRequiredChange;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EmpVariationReviewReturnForAmendsHandlerTest {

    @InjectMocks
    private EmpVariationReviewReturnForAmendsHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private RequestService requestService;

    @Mock
    private EmpVariationReviewService service;

    @Mock
    private EmpVariationReviewReturnForAmendsValidatorService validatorService;

    @Mock
    private WorkflowService workflowService;

    @Test
    void doProcess() {
        long taskId = 1L;
        RequestTaskActionEmptyPayload emptyPayload = RequestTaskActionEmptyPayload
                .builder()
                .payloadType(RequestTaskActionPayloadTypes.EMPTY_PAYLOAD)
                .build();
        String userId = "userId";
        AppUser appUser = AppUser.builder().userId(userId).build();

        String processTaskId = "processTaskId";

        EmpVariationReviewDecision reviewAmendDecision = EmpVariationReviewDecision.builder()
                .type(EmpVariationReviewDecisionType.OPERATOR_AMENDS_NEEDED)
                .details(ChangesRequiredDecisionDetails.builder()
                        .requiredChanges(Collections.singletonList(new ReviewDecisionRequiredChange("changesRequired", Collections.emptySet()))).build())
                .build();
        EmpVariationReviewDecision reviewNoAmendDecision = EmpVariationReviewDecision.builder()
                .type(EmpVariationReviewDecisionType.ACCEPTED).build();
        EmpVariationApplicationReviewRequestTaskPayload payload =
                EmpVariationApplicationReviewRequestTaskPayload.builder()
                        .reviewGroupDecisions(Map.of(
                                EmpReviewGroup.ABBREVIATIONS_AND_DEFINITIONS, reviewAmendDecision,
                                EmpReviewGroup.ADDITIONAL_DOCUMENTS, reviewNoAmendDecision
                        )).build();

        Request request = Request.builder()
                .id("2")
                .payload(EmpVariationRequestPayload.builder().build())
                .build();
        RequestTask requestTask = RequestTask.builder()
                .id(taskId)
                .processTaskId(processTaskId)
                .payload(payload)
                .request(request)
                .build();

        EmpVariationApplicationReturnedForAmendsRequestActionPayload actionPayload =
                EmpVariationApplicationReturnedForAmendsRequestActionPayload.builder()
                        .payloadType(MrtmRequestActionPayloadType.EMP_VARIATION_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD)
                        .reviewGroupDecisions(Map.of(EmpReviewGroup.ABBREVIATIONS_AND_DEFINITIONS, reviewAmendDecision))
                        .build();

        EmpVariationRequestPayload newEmpVariationRequestPayload = EmpVariationRequestPayload.builder()
                .reviewGroupDecisions(Map.of(EmpReviewGroup.ABBREVIATIONS_AND_DEFINITIONS, reviewAmendDecision))
                .build();
        Request newRequest = Request.builder()
                .id("2")
                .payload(newEmpVariationRequestPayload)
                .build();

        when(requestTaskService.findTaskByIdForUpdate(taskId)).thenReturn(requestTask);

        // Invoke
        handler.process(taskId, MrtmRequestTaskActionType.EMP_VARIATION_REVIEW_RETURN_FOR_AMENDS, appUser, emptyPayload);

        // Verify
        verify(requestTaskService, times(1)).findTaskByIdForUpdate(taskId);
        verify(validatorService, times(1)).validate(payload);
        verify(service, times(1)).saveRequestReturnForAmends(requestTask, appUser);
        verify(requestService, times(1))
                .addActionToRequest(newRequest, actionPayload, MrtmRequestActionType.EMP_VARIATION_APPLICATION_RETURNED_FOR_AMENDS, userId);
        verify(workflowService, times(1))
                .completeTask(processTaskId, Map.of(BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.AMENDS_NEEDED.name()));
    }

    @Test
    void doProcess_not_valid() {
        long taskId = 1L;
        RequestTaskActionEmptyPayload emptyPayload = RequestTaskActionEmptyPayload
                .builder()
                .payloadType(RequestTaskActionPayloadTypes.EMPTY_PAYLOAD)
                .build();
        String userId = "userId";
        AppUser appUser = AppUser.builder().userId(userId).build();

        String processTaskId = "processTaskId";

        EmpVariationApplicationReviewRequestTaskPayload payload =
                EmpVariationApplicationReviewRequestTaskPayload.builder()
                        .reviewGroupDecisions(Map.of(
                                EmpReviewGroup.ADDITIONAL_DOCUMENTS, EmpVariationReviewDecision
                                        .builder()
                                        .type(EmpVariationReviewDecisionType.ACCEPTED)
                                        .build()
                        )).build();

        RequestTask requestTask = RequestTask.builder()
                .id(taskId)
                .processTaskId(processTaskId)
                .payload(payload)
                .request(Request.builder().build())
                .build();

        when(requestTaskService.findTaskByIdForUpdate(taskId)).thenReturn(requestTask);
        doThrow(new BusinessException((MrtmErrorCode.INVALID_EMP_VARIATION_REVIEW))).when(validatorService)
                .validate(payload);

        // Invoke
        BusinessException businessException = assertThrows(BusinessException.class,
                () -> handler.process(taskId, MrtmRequestTaskActionType.EMP_VARIATION_REVIEW_RETURN_FOR_AMENDS, appUser, emptyPayload));

        // Verify
        assertEquals(MrtmErrorCode.INVALID_EMP_VARIATION_REVIEW, businessException.getErrorCode());
        verify(requestTaskService, times(1)).findTaskByIdForUpdate(taskId);
        verify(validatorService, times(1)).validate(payload);
        verify(service, never()).saveRequestReturnForAmends(any(), any());
        verify(requestService, never()).addActionToRequest(any(), any(), any(), anyString());
        verify(workflowService, never()).completeTask(anyString(), anyMap());
    }
}
