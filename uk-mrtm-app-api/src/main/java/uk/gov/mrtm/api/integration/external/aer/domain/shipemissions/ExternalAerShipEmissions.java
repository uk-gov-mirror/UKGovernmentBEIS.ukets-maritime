package uk.gov.mrtm.api.integration.external.aer.domain.shipemissions;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpUncertaintyLevel;
import uk.gov.netz.api.common.validation.uniqueelements.UniqueField;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalAerShipEmissions {

    @Schema(description = "Ships and emission details")
    @Valid
    @NotNull
    @UniqueField
    private ExternalAerShipDetails shipDetails;

    @Builder.Default
    @Valid
    @NotEmpty
    @JsonDeserialize(as = LinkedHashSet.class)
    private Set<@NotNull ExternalAerFuelsAndEmissionsFactors> fuelTypes = new LinkedHashSet<>();

    @Builder.Default
    @JsonDeserialize(as = LinkedHashSet.class)
    @NotEmpty
    @Valid
    private Set<@NotNull ExternalAerEmissionsSources> emissionsSources = new LinkedHashSet<>();

    @Schema(description = "Level of uncertainty associated with the fuel monitoring methods")
    @Builder.Default
    @JsonDeserialize(as = LinkedHashSet.class)
    @NotEmpty
    @Valid
    private Set<@NotNull ExternalEmpUncertaintyLevel> uncertaintyLevel = new LinkedHashSet<>();

    @Schema(description = "Exemption from per voyage monitoring")
    @Valid
    @NotNull
    private ExternalAerDerogations derogations;
}
