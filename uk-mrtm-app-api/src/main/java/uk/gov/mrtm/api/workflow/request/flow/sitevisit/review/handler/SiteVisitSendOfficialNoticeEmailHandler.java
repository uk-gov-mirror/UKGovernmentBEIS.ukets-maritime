package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import lombok.RequiredArgsConstructor;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.SiteVisitOfficialNoticeService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;

@Service
@RequiredArgsConstructor
public class SiteVisitSendOfficialNoticeEmailHandler implements JavaDelegate {

    private final SiteVisitOfficialNoticeService siteVisitOfficialNoticeService;

    @Override
    public void execute(DelegateExecution execution) {
        final String requestId = (String) execution.getVariable(BpmnProcessConstants.REQUEST_ID);
        siteVisitOfficialNoticeService.sendOfficialNotice(requestId);
    }
}
