package uk.gov.mrtm.api.integration.external.verification.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.integration.external.verification.domain.common.ExternalUncorrectedItem;
import uk.gov.mrtm.api.integration.external.verification.domain.common.ExternalVerifierComment;
import uk.gov.netz.api.common.validation.SpELExpression;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@SpELExpression(expression = "{T(java.lang.Boolean).TRUE.equals(#exist) == (#uncorrectedNonConformities?.size() gt 0)}", message = "aerVerificationData.uncorrectedNonConformities.exist")
@SpELExpression(expression = "{T(java.lang.Boolean).TRUE.equals(#existPriorYearIssues) == (#priorYearIssues?.size() gt 0)}", message = "aerVerificationData.uncorrectedNonConformities.priorYearIssues.exist")
public class ExternalAerUncorrectedNonConformities {

    @NotNull
    @Schema(description = "Indicates if there have been any uncorrected non-conformities with the approved emissions monitoring plan")
    private Boolean exist;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Builder.Default
    @Valid
    @JsonDeserialize(as = LinkedHashSet.class)
    @Schema(description = "Non-conformities with the approved emissions monitoring plan. Required only when 'exist' is true, otherwise must be omitted")
    private Set<@NotNull ExternalUncorrectedItem> uncorrectedNonConformities = new LinkedHashSet<>();

    @NotNull
    @Schema(description = "Indicates if there are any non-conformities from the previous year that have not been resolved")
    private Boolean existPriorYearIssues;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Builder.Default
    @Valid
    @JsonDeserialize(as = LinkedHashSet.class)
    @Schema(description = "Non-conformities from the previous year that have not been resolved. Required only when 'existPriorYearIssues' is true, otherwise must be omitted")
    private Set<@NotNull ExternalVerifierComment> priorYearIssues = new LinkedHashSet<>();
}
