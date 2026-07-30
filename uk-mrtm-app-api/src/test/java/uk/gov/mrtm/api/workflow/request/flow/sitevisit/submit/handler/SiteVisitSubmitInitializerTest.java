package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmitRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class SiteVisitSubmitInitializerTest {

    @InjectMocks
    private SiteVisitSubmitInitializer initializer;

    @Test
    void initializePayload() {
        Map<String, String> sectionsCompleted = Map.of("s1", "a");
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder()
            .reviewSectionsCompleted(sectionsCompleted)
            .build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();
        SiteVisitApplicationSubmitRequestTaskPayload taskPayload = SiteVisitApplicationSubmitRequestTaskPayload
            .builder()
            .payloadType(MrtmRequestTaskPayloadType.SITE_VISIT_APPLICATION_SUBMIT_PAYLOAD)
            .year(requestPayload.getYear())
            .build();

        RequestTaskPayload actual = initializer.initializePayload(request);

        assertThat(actual).isEqualTo(taskPayload);
    }

    @Test
    void getRequestTaskTypes() {
        assertThat(initializer.getRequestTaskTypes()).containsExactlyInAnyOrder(
            MrtmRequestTaskType.SITE_VISIT_APPLICATION_SUBMIT);
    }

}