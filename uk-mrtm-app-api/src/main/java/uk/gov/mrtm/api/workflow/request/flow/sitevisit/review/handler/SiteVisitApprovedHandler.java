package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import lombok.RequiredArgsConstructor;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.SiteVisitApprovedService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;

@Component
@RequiredArgsConstructor
public class SiteVisitApprovedHandler implements JavaDelegate {

    private final SiteVisitApprovedService siteVisitApprovedService;

    @Override
    public void execute(DelegateExecution execution) {
        String requestId = (String) execution.getVariable(BpmnProcessConstants.REQUEST_ID);
        siteVisitApprovedService.approve(requestId);
    }
}