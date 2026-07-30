package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationAmendSubmitMapper;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.validator.EmpVariationReviewReturnForAmendsValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmpVariationReviewReturnForAmendsHandler implements RequestTaskActionHandler<RequestTaskActionEmptyPayload> {

    private final RequestTaskService requestTaskService;
    private final RequestService requestService;
    private final EmpVariationReviewService empVariationReviewService;
    private final EmpVariationReviewReturnForAmendsValidatorService empVariationReviewReturnForAmendsValidatorService;
    private final WorkflowService workflowService;
    private static final EmpVariationAmendSubmitMapper MAPPER = Mappers.getMapper(EmpVariationAmendSubmitMapper.class);

    @Override
    @Transactional
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser, RequestTaskActionEmptyPayload payload) {
        final RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);

        // Validate that at least one review group is 'Operator to amend'
        empVariationReviewReturnForAmendsValidatorService.validate(
                (EmpVariationApplicationReviewRequestTaskPayload) requestTask.getPayload());

        // Update request payload
        empVariationReviewService.saveRequestReturnForAmends(requestTask, appUser);

        // Add request action
        createRequestAction(requestTask.getRequest(), appUser, (EmpVariationApplicationReviewRequestTaskPayload) requestTask.getPayload());

        // Close task
        workflowService.completeTask(requestTask.getProcessTaskId(),
                Map.of(BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.AMENDS_NEEDED.name()));

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_VARIATION_REVIEW_RETURN_FOR_AMENDS);
    }

    private void createRequestAction(Request request, AppUser appUser, EmpVariationApplicationReviewRequestTaskPayload taskPayload) {
        EmpVariationApplicationReturnedForAmendsRequestActionPayload requestActionPayload =
                MAPPER.toEmpVariationApplicationReturnedForAmendsRequestActionPayload(taskPayload,
                        MrtmRequestActionPayloadType.EMP_VARIATION_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD
                );

        requestService.addActionToRequest(request, requestActionPayload, MrtmRequestActionType.EMP_VARIATION_APPLICATION_RETURNED_FOR_AMENDS,
                appUser.getUserId());
    }
}
