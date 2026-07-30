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
@SpELExpression(expression = "{T(java.lang.Boolean).TRUE.equals(#exist) == (#uncorrectedMisstatements?.size() gt 0)}", message = "aerVerificationData.uncorrectedMisstatements.exist")
public class ExternalAerUncorrectedMisstatements {

    @NotNull
    @Schema(description = "Indicates if there are any misstatements that were not corrected before issuing this report")
    private Boolean exist;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Builder.Default
    @Valid
    @JsonDeserialize(as = LinkedHashSet.class)
    @Schema(description = "Misstatements not corrected before issuing this report. Required only when 'exist' is true, otherwise must be omitted")
    private Set<@NotNull ExternalUncorrectedItem> uncorrectedMisstatements = new LinkedHashSet<>();
}
