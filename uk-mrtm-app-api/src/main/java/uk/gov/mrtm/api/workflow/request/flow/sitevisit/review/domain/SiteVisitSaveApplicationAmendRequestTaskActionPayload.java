package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSaveRequestTaskActionPayload;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class SiteVisitSaveApplicationAmendRequestTaskActionPayload extends SiteVisitApplicationSaveRequestTaskActionPayload {

    private boolean updatedSubtask;
}
