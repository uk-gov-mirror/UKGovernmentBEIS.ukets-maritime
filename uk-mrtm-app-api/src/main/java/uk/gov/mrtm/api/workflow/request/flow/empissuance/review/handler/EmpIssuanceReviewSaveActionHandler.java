package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceSaveApplicationReviewRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service.RequestEmpReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EmpIssuanceReviewSaveActionHandler
        implements RequestTaskActionHandler<EmpIssuanceSaveApplicationReviewRequestTaskActionPayload> {

    private final RequestTaskService requestTaskService;
    private final RequestEmpReviewService requestEmpReviewService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser,
                                      EmpIssuanceSaveApplicationReviewRequestTaskActionPayload payload) {
        RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);
        requestEmpReviewService.applySaveAction(payload, requestTask);

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_ISSUANCE_SAVE_APPLICATION_REVIEW);
    }
}
