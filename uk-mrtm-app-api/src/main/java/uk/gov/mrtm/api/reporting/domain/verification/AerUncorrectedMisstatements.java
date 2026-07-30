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
import uk.gov.netz.api.common.validation.SpELExpression;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@SpELExpression(expression = "{T(java.lang.Boolean).TRUE.equals(#exist) == (#uncorrectedMisstatements?.size() gt 0)}", message = "aerVerificationData.uncorrectedMisstatements.exist")
public class AerUncorrectedMisstatements {

    @NotNull
    private Boolean exist;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Builder.Default
    @Valid
    @JsonDeserialize(as = LinkedHashSet.class)
    private Set<@NotNull UncorrectedItem> uncorrectedMisstatements = new LinkedHashSet<>();
}
