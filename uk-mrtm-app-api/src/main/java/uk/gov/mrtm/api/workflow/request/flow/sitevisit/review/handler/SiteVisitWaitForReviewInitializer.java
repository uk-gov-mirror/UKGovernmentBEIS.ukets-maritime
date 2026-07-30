package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.transform.SiteVisitSubmitMapper;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.InitializeRequestTaskHandler;

import java.util.Set;

@Service
@AllArgsConstructor
public class SiteVisitWaitForReviewInitializer implements InitializeRequestTaskHandler {

    private final SiteVisitSubmitMapper mapper;

    @Override
    public RequestTaskPayload initializePayload(Request request) {
        return mapper.toSiteVisitApplicationSubmitRequestTaskPayload(
            (SiteVisitRequestPayload) request.getPayload(),
            MrtmRequestTaskPayloadType.SITE_VISIT_WAIT_FOR_REVIEW_PAYLOAD);
    }

    @Override
    public Set<String> getRequestTaskTypes() {
        return Set.of(MrtmRequestTaskType.SITE_VISIT_WAIT_FOR_REVIEW);
    }
}
