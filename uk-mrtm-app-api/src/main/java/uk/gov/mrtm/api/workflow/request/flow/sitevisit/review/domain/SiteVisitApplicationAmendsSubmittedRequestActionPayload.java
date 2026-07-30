package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmittedRequestActionPayload;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@SuperBuilder
public class SiteVisitApplicationAmendsSubmittedRequestActionPayload extends SiteVisitApplicationSubmittedRequestActionPayload {
}
