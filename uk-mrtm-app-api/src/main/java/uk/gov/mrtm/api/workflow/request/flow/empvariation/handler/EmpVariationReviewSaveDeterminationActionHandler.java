package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveReviewDeterminationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.validator.EmpVariationReviewDeterminationValidatorService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EmpVariationReviewSaveDeterminationActionHandler implements RequestTaskActionHandler<EmpVariationSaveReviewDeterminationRequestTaskActionPayload> {

    private final RequestTaskService requestTaskService;
    private final EmpVariationReviewService empVariationReviewService;
    private final EmpVariationReviewDeterminationValidatorService determinationValidatorService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser, EmpVariationSaveReviewDeterminationRequestTaskActionPayload taskActionPayload) {
        RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);

        checkDeterminationValidity(taskActionPayload.getDetermination(), requestTask);
        empVariationReviewService.saveDetermination(taskActionPayload, requestTask);

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_VARIATION_SAVE_REVIEW_DETERMINATION);
    }

    private void checkDeterminationValidity(EmpVariationDetermination determination, RequestTask requestTask) {
        EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload =
                (EmpVariationApplicationReviewRequestTaskPayload) requestTask.getPayload();

        if (!determinationValidatorService.isValid(requestTaskPayload, determination.getType())) {
            throw new BusinessException(ErrorCode.FORM_VALIDATION);
        }
    }
}
