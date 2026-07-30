package uk.gov.mrtm.api.reporting.domain.verification;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.reporting.domain.common.UncorrectedItem;
import uk.gov.mrtm.api.reporting.domain.common.VerifierComment;
import uk.gov.netz.api.common.validation.SpELExpression;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@SpELExpression(expression = "{T(java.lang.Boolean).TRUE.equals(#exist) == (#uncorrectedNonConformities?.size() gt 0)}", message = "aerVerificationData.uncorrectedNonConformities.exist")
@SpELExpression(expression = "{T(java.lang.Boolean).TRUE.equals(#existPriorYearIssues) == (#priorYearIssues?.size() gt 0)}", message = "aerVerificationData.uncorrectedNonConformities.priorYearIssues.exist")
public class AerUncorrectedNonConformities {

    @NotNull
    private Boolean exist;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Builder.Default
    @Valid
    @JsonDeserialize(as = LinkedHashSet.class)
    private Set<@NotNull UncorrectedItem> uncorrectedNonConformities = new LinkedHashSet<>();

    @NotNull
    private Boolean existPriorYearIssues;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Builder.Default
    @Valid
    @JsonDeserialize(as = LinkedHashSet.class)
    private Set<@NotNull VerifierComment> priorYearIssues = new LinkedHashSet<>();
}
