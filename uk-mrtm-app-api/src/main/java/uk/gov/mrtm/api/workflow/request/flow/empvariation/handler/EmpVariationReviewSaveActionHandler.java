package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveApplicationReviewRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EmpVariationReviewSaveActionHandler implements RequestTaskActionHandler<EmpVariationSaveApplicationReviewRequestTaskActionPayload> {

    private final RequestTaskService requestTaskService;
    private final EmpVariationReviewService empVariationReviewService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser,
                                      EmpVariationSaveApplicationReviewRequestTaskActionPayload payload) {
        final RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);
        empVariationReviewService.saveEmpVariation(payload, requestTask);

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_VARIATION_SAVE_APPLICATION_REVIEW);
    }

}
