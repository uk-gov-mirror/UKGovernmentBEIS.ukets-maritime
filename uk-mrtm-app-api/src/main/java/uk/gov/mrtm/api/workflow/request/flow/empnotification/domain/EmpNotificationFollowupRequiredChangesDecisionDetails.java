package uk.gov.mrtm.api.workflow.request.flow.empnotification.domain;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.common.validation.NotBeforeCurrentDateInZone;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;

import java.time.LocalDate;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class EmpNotificationFollowupRequiredChangesDecisionDetails extends ChangesRequiredDecisionDetails {

    @NotBeforeCurrentDateInZone(inclusive = false)
    private LocalDate dueDate;
}
