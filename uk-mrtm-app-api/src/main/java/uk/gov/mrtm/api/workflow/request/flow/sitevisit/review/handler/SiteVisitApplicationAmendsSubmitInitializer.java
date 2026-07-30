package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform.SiteVisitReviewMapper;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.InitializeRequestTaskHandler;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class SiteVisitApplicationAmendsSubmitInitializer implements InitializeRequestTaskHandler {

    private final SiteVisitReviewMapper mapper;

    @Override
    public RequestTaskPayload initializePayload(Request request) {
        SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();
        return mapper.toSiteVisitApplicationAmendsSubmitRequestTaskPayload(
            requestPayload,
            MrtmRequestTaskPayloadType.SITE_VISIT_APPLICATION_AMENDS_SUBMIT_PAYLOAD,
            requestPayload.getAmendsSectionsCompleted()
        );
    }

    @Override
    public Set<String> getRequestTaskTypes() {
        return Set.of(MrtmRequestTaskType.SITE_VISIT_APPLICATION_AMENDS_SUBMIT);
    }
}
