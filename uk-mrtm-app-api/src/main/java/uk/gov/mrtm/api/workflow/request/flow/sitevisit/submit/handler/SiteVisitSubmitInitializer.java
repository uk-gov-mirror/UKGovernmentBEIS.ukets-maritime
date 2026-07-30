package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmitRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.InitializeRequestTaskHandler;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class SiteVisitSubmitInitializer implements InitializeRequestTaskHandler {

	@Override
    public RequestTaskPayload initializePayload(Request request) {

        SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();

        return SiteVisitApplicationSubmitRequestTaskPayload
            .builder()
            .payloadType(MrtmRequestTaskPayloadType.SITE_VISIT_APPLICATION_SUBMIT_PAYLOAD)
            .year(requestPayload.getYear())
            .build();
    }

    @Override
    public Set<String> getRequestTaskTypes() {
        return Set.of(MrtmRequestTaskType.SITE_VISIT_APPLICATION_SUBMIT);
    }
}
