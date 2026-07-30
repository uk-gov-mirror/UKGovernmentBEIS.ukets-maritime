package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform.SiteVisitReviewMapper;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitWaitForPeerReviewInitializerTest {

    @InjectMocks
    private SiteVisitWaitForPeerReviewInitializer initializer;

    @Mock
    private SiteVisitReviewMapper mapper;

    @Test
    void initializePayload() {
        Map<String, String> sectionsCompleted = Map.of("s1", "a");
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder()
            .reviewSectionsCompleted(sectionsCompleted)
            .build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();
        SiteVisitApplicationReviewRequestTaskPayload taskPayload = mock(SiteVisitApplicationReviewRequestTaskPayload.class);

        when(mapper.toApplicationReviewRequestTaskPayload(requestPayload,
            MrtmRequestTaskPayloadType.SITE_VISIT_WAIT_FOR_PEER_REVIEW_PAYLOAD, sectionsCompleted)).thenReturn(taskPayload);
        RequestTaskPayload actual = initializer.initializePayload(request);

        assertThat(actual).isEqualTo(taskPayload);

        verify(mapper).toApplicationReviewRequestTaskPayload(requestPayload,
            MrtmRequestTaskPayloadType.SITE_VISIT_WAIT_FOR_PEER_REVIEW_PAYLOAD, sectionsCompleted);
        verifyNoMoreInteractions(mapper);
    }

    @Test
    void getRequestTaskTypes() {
        assertThat(initializer.getRequestTaskTypes()).containsExactlyInAnyOrder(
            MrtmRequestTaskType.SITE_VISIT_WAIT_FOR_PEER_REVIEW);
    }

}