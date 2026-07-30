package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service.RequestEmpReviewService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.validation.EmpIssuanceReviewDeterminationValidatorService;
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
public class EmpIssuanceReviewSaveDeterminationActionHandler
        implements RequestTaskActionHandler<EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload> {

    private final RequestTaskService requestTaskService;
    private final RequestEmpReviewService requestEmpReviewService;
    private final EmpIssuanceReviewDeterminationValidatorService determinationValidatorService;
    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser,
                                      EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload taskActionPayload) {
        RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);

        checkDeterminationValidity(taskActionPayload.getDetermination(), requestTask);
        requestEmpReviewService.saveDetermination(taskActionPayload, requestTask);

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_ISSUANCE_SAVE_REVIEW_DETERMINATION);
    }

    private void checkDeterminationValidity(EmpIssuanceDetermination determination, RequestTask requestTask) {
        EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload =
                (EmpIssuanceApplicationReviewRequestTaskPayload) requestTask.getPayload();

        if (!determinationValidatorService.isValid(requestTaskPayload, determination.getType())) {
            throw new BusinessException(ErrorCode.FORM_VALIDATION);
        }

    }
}
