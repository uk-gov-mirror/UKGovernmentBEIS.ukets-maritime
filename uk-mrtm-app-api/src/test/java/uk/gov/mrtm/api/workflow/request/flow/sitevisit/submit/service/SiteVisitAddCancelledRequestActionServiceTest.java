package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitAddCancelledRequestActionServiceTest {

    @InjectMocks
    private SiteVisitAddCancelledRequestActionService service;

    @Mock
    private RequestService requestService;

    @Test
    void add() {
        String requestId = "requestId";
        String operatorAssignee = "operatorAssignee";

        Request request = Request.builder()
            .payload(SiteVisitRequestPayload.builder().operatorAssignee(operatorAssignee).build())
            .build();

        when(requestService.findRequestById(requestId)).thenReturn(request);

        service.add(requestId);

        verify(requestService).findRequestById(requestId);
        verify(requestService).addActionToRequest(request, null, MrtmRequestActionType.SITE_VISIT_APPLICATION_CANCELLED,
            operatorAssignee);

        verifyNoMoreInteractions(requestService);
    }
}