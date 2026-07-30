package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class SiteVisitApplicationAmendsSubmitRequestTaskPayload extends SiteVisitApplicationReviewRequestTaskPayload {

    private boolean updatedSubtask;
}

