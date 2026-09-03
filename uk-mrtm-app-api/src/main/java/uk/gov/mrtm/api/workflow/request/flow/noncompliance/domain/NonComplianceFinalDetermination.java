package uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.common.validation.NotAfterCurrentDateInZone;
import uk.gov.netz.api.common.validation.SpELExpression;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@SpELExpression(
    expression = "{(#complianceRestored eq 'YES') == (#complianceRestoredDate != null)}",
    message = "non.compliance.restoration.date"
)
@SpELExpression(
    expression = "{T(java.lang.Boolean).TRUE.equals(#operatorPaid) == (#operatorPaidDate != null)}",
    message = "non.compliance.payment.date"
)
public class NonComplianceFinalDetermination {

    @NotNull
    private ComplianceRestored complianceRestored;

    @NotAfterCurrentDateInZone
    private LocalDate complianceRestoredDate;

    @NotNull
    @Size(max = 10000)
    private String comments;

    @NotNull
    private Boolean reissuePenalty;

    @NotNull
    private Boolean operatorPaid;

    @NotAfterCurrentDateInZone
    private LocalDate operatorPaidDate;
}
