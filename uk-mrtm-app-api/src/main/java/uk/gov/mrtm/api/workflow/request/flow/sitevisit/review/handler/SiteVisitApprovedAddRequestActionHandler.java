package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;


import lombok.RequiredArgsConstructor;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.SiteVisitSubmittedAddRequestActionService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;

@Service
@RequiredArgsConstructor
public class SiteVisitApprovedAddRequestActionHandler implements JavaDelegate {

    private final SiteVisitSubmittedAddRequestActionService addRequestActionService;

    @Override
    public void execute(DelegateExecution execution) {
        String requestId = (String) execution.getVariable(BpmnProcessConstants.REQUEST_ID);
        final SiteVisitDeterminationType determinationType =
            (SiteVisitDeterminationType) execution.getVariable(BpmnProcessConstants.REVIEW_DETERMINATION);

        addRequestActionService.addRequestAction(requestId, determinationType);
    }
}
