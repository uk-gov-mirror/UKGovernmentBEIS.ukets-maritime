package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitReviewDecisionDetails;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class SiteVisitDocumentTemplateWorkflowParamsProviderTest {

    @InjectMocks
    private SiteVisitDocumentTemplateWorkflowParamsProvider provider;

    @Test
    void getContextActionType() {
        assertThat(provider.getContextActionType()).isEqualTo(
            MrtmDocumentTemplateGenerationContextActionType.SITE_VISIT);
    }

    @Test
    void constructParams() {
        String officialNotice = "test";

        SiteVisitRequestPayload payload = SiteVisitRequestPayload.builder()
            .reviewDecision(SiteVisitReviewDecision.builder()
                .type(SiteVisitReviewDecisionType.ACCEPTED)
                .details(SiteVisitReviewDecisionDetails.builder().summary(officialNotice).build())
                .build())
            .build();

        Map<String, Object> params = provider.constructParams(payload);
        assertThat(params.size()).isEqualTo(1);
        assertThat(params).containsEntry("officialNotice", officialNotice);
    }
}
