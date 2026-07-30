package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.sitevisit.service.SiteVisitQueryService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform.SiteVisitReviewMapper;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.service.RequestService;

import java.time.Year;
import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitApprovedServiceTest {

    @InjectMocks
    private SiteVisitApprovedService service;

    @Mock
    private RequestService requestService;
    @Mock
    private SiteVisitQueryService siteVisitQueryService;
    @Mock
    private SiteVisitReviewMapper mapper;

    @Test
    void approve() {
        long accountId = 1L;
        String requestId = "requestId";
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().year(Year.now()).build();
        SiteVisitContainer siteVisitContainer = mock(SiteVisitContainer.class);
        Request request = Request.builder()
            .requestResources(List.of(
                RequestResource.builder().resourceId(String.valueOf(accountId)).resourceType(ResourceType.ACCOUNT).build()))
            .payload(requestPayload)
            .build();

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(mapper.toSiteVisitContainer(requestPayload)).thenReturn(siteVisitContainer);

        service.approve(requestId);

        verify(requestService).findRequestById(requestId);
        verify(mapper).toSiteVisitContainer(requestPayload);
        verify(siteVisitQueryService).submitSiteVisit(accountId, siteVisitContainer, Year.now(), requestId);
    }
}