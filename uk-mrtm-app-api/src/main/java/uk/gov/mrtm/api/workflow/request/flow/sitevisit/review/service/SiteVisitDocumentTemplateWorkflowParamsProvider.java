package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitReviewDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateSyncWorkflowParamsProvider;

import java.util.Map;

@Component
public class SiteVisitDocumentTemplateWorkflowParamsProvider
		implements DocumentTemplateSyncWorkflowParamsProvider<SiteVisitRequestPayload> {

    @Override
    public String getContextActionType() {
        return MrtmDocumentTemplateGenerationContextActionType.SITE_VISIT;
    }

    @Override
    public Map<String, Object> constructParams(SiteVisitRequestPayload payload) {
        String officialNotice = ((SiteVisitReviewDecisionDetails) payload.getReviewDecision().getDetails()).getSummary();

        return Map.of(
            "officialNotice", officialNotice
        );
    }
}
