package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.sitevisit.service.SiteVisitQueryService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform.SiteVisitReviewMapper;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;

@Service
@RequiredArgsConstructor
public class SiteVisitApprovedService {

    private final RequestService requestService;
    private final SiteVisitQueryService siteVisitQueryService;
    private final SiteVisitReviewMapper mapper;

    public void approve(String requestId) {
        Request request = requestService.findRequestById(requestId);
        SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();

        Long accountId = request.getAccountId();

        SiteVisitContainer siteVisitContainer =
                mapper.toSiteVisitContainer(requestPayload);

        siteVisitQueryService.submitSiteVisit(accountId, siteVisitContainer, requestPayload.getYear(), requestId);
    }

}
