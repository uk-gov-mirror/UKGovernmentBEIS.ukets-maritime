package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.flowable.engine.delegate.DelegateExecution;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.SiteVisitSubmittedAddRequestActionService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitApprovedAddRequestActionHandlerTest {

    @InjectMocks
    private SiteVisitApprovedAddRequestActionHandler handler;

    @Mock
    private SiteVisitSubmittedAddRequestActionService addRequestActionService;

    @Mock
    private DelegateExecution execution;

    @Test
    void execute() {
        String requestId = "1";
        SiteVisitDeterminationType determinationType = mock(SiteVisitDeterminationType.class);
        when(execution.getVariable(BpmnProcessConstants.REQUEST_ID)).thenReturn(requestId);
        when(execution.getVariable(BpmnProcessConstants.REVIEW_DETERMINATION)).thenReturn(determinationType);

        handler.execute(execution);

        verify(execution).getVariable(BpmnProcessConstants.REQUEST_ID);
        verify(addRequestActionService).addRequestAction(requestId, determinationType);
        verifyNoMoreInteractions(execution, addRequestActionService);
    }
}