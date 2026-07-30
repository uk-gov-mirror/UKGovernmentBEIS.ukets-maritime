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
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitApplicationReviewInitializerTest {

    @InjectMocks
    private SiteVisitApplicationReviewInitializer initializer;

    @Mock
    private SiteVisitReviewMapper mapper;

    @Test
    void initializePayload() {
        Map<String, String> sectionsCompleted = Map.of("s1", "a");
        SiteVisitApplicationReviewRequestTaskPayload expected = mock(SiteVisitApplicationReviewRequestTaskPayload.class);
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder()
            .reviewSectionsCompleted(sectionsCompleted)
            .build();
        Request request = Request.builder().payload(requestPayload).requestResources(List.of(RequestResource.builder().resourceId("1").resourceType(ResourceType.ACCOUNT).build())).build();

        when(mapper.toApplicationReviewRequestTaskPayload(requestPayload,
            MrtmRequestTaskPayloadType.SITE_VISIT_APPLICATION_REVIEW_PAYLOAD,
            sectionsCompleted)).thenReturn(expected);

        RequestTaskPayload actual = initializer.initializePayload(request);

        assertThat(expected).isEqualTo(actual);
        verify(mapper).toApplicationReviewRequestTaskPayload(requestPayload,
            MrtmRequestTaskPayloadType.SITE_VISIT_APPLICATION_REVIEW_PAYLOAD,
            sectionsCompleted);

        verifyNoMoreInteractions(mapper);
    }

    @Test
    void getRequestTaskTypes() {
        assertEquals(initializer.getRequestTaskTypes(), Set.of(MrtmRequestTaskType.SITE_VISIT_APPLICATION_REVIEW));
    }
}
