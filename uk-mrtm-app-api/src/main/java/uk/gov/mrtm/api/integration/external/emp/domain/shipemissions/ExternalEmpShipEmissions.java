package uk.gov.mrtm.api.integration.external.emp.domain.shipemissions;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.netz.api.common.validation.uniqueelements.UniqueField;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalEmpShipEmissions {

    @Schema(description = "Ships and emission details")
    @Valid
    @NotNull
    @UniqueField
    private ExternalEmpShipDetails shipDetails;

    @Builder.Default
    @Valid
    @NotEmpty
    @JsonDeserialize(as = LinkedHashSet.class)
    private Set<@NotNull ExternalEmpFuelsAndEmissionsFactors> fuelTypes = new LinkedHashSet<>();

    @Builder.Default
    @JsonDeserialize(as = LinkedHashSet.class)
    @NotEmpty
    @Valid
    private Set<@NotNull ExternalEmpEmissionsSources> emissionsSources = new LinkedHashSet<>();

    @Schema(description = "Level of uncertainty associated with the fuel monitoring methods")
    @Builder.Default
    @JsonDeserialize(as = LinkedHashSet.class)
    @NotEmpty
    @Valid
    private Set<@NotNull ExternalEmpUncertaintyLevel> uncertaintyLevel = new LinkedHashSet<>();

    @Schema(description = "Application of carbon capture and storage technologies")
    @Valid
    @NotNull
    private ExternalEmpCarbonCapture ccsCcu;

    @Schema(description = "Description of the measurement instruments involved")
    @Builder.Default
    @JsonDeserialize(as = LinkedHashSet.class)
    @NotEmpty
    @Valid
    private Set<@NotNull ExternalEmpMeasurementDescription> measuringEquipment = new LinkedHashSet<>();

    @Schema(description = "Conditions of exemption from per voyage reporting")
    @Valid
    @NotNull
    private ExternalEmpExemptionConditions conditionsOfExemption;
}
