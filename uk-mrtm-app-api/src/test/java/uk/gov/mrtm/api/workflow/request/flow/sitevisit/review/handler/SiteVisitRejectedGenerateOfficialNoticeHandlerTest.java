package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.flowable.engine.delegate.DelegateExecution;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.SiteVisitOfficialNoticeService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitRejectedGenerateOfficialNoticeHandlerTest {

    @InjectMocks
    private SiteVisitRejectedGenerateOfficialNoticeHandler handler;

    @Mock
    private SiteVisitOfficialNoticeService siteVisitOfficialNoticeService;

    @Mock
    private DelegateExecution execution;

    @Test
    void execute() {
        String requestId = "1";
        when(execution.getVariable(BpmnProcessConstants.REQUEST_ID)).thenReturn(requestId);

        handler.execute(execution);

        verify(execution).getVariable(BpmnProcessConstants.REQUEST_ID);
        verify(siteVisitOfficialNoticeService).generateRejectedOfficialNotice(requestId);
        verifyNoMoreInteractions(execution, siteVisitOfficialNoticeService);
    }
}