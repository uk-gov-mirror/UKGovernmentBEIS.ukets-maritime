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
import uk.gov.netz.api.common.validation.SpELExpression;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@SpELExpression(expression = "{T(java.lang.Boolean).TRUE.equals(#exist) == (#uncorrectedNonCompliances?.size() gt 0)}", message = "aerVerificationData.uncorrectedNonCompliances.exist")
public class ExternalAerUncorrectedNonCompliances {

    @NotNull
    @Schema(description = "Indicates if there have been any non-compliances with the maritime monitoring and reporting requirements in the UK ETS Order")
    private Boolean exist;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Builder.Default
    @Valid
    @JsonDeserialize(as = LinkedHashSet.class)
    @Schema(description = "Non-compliances with the maritime monitoring and reporting requirements. Required only when 'exist' is true, otherwise must be omitted")
    private Set<@NotNull ExternalUncorrectedItem> uncorrectedNonCompliances = new LinkedHashSet<>();
}
