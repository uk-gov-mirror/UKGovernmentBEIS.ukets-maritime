package uk.gov.mrtm.api.integration.external.aer.domain;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.integration.external.aer.domain.aggregateddata.ExternalAerAggregatedDataEmissions;
import uk.gov.mrtm.api.integration.external.aer.domain.reductionclaim.ExternalAerReductionClaim;
import uk.gov.mrtm.api.integration.external.aer.domain.shipemissions.ExternalAerShipEmissions;
import uk.gov.netz.api.common.validation.uniqueelements.UniqueElements;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalAer {

    @Schema(description = "Ships and emission details. All ships related to the AER must be provided")
    @Builder.Default
    @Valid
    @NotEmpty
    @JsonDeserialize(as = LinkedHashSet.class)
    @UniqueElements
    private Set<@NotNull @Valid ExternalAerShipEmissions> shipParticulars = new LinkedHashSet<>();

    @NotNull
    @Valid
    private ExternalAerReductionClaim reductionClaim;

    @Valid
    @NotNull
    private ExternalAerAggregatedDataEmissions emissions;
}