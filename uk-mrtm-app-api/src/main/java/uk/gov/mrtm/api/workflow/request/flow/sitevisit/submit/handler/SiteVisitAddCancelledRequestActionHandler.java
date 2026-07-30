package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.handler;

import lombok.RequiredArgsConstructor;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.service.SiteVisitAddCancelledRequestActionService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;

@Service
@RequiredArgsConstructor
public class SiteVisitAddCancelledRequestActionHandler implements JavaDelegate {

    private final SiteVisitAddCancelledRequestActionService siteVisitAddCancelledRequestActionService;

    @Override
    public void execute(DelegateExecution execution) {
        final String requestId = (String) execution.getVariable(BpmnProcessConstants.REQUEST_ID);
        siteVisitAddCancelledRequestActionService.add(requestId);
    }
}
