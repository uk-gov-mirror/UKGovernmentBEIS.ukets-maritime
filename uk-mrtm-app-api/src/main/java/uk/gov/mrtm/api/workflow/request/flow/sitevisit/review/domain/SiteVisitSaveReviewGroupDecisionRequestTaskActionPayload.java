package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskActionPayload;

import java.util.HashMap;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload extends RequestTaskActionPayload {

    @NotNull
    private SiteVisitReviewDecision reviewDecision;

    @Builder.Default
    private Map<String, String> sectionsCompleted = new HashMap<>();
}
