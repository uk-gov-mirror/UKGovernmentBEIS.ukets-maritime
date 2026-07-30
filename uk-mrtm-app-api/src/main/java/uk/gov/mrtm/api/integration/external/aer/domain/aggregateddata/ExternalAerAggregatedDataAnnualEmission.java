package uk.gov.mrtm.api.integration.external.aer.domain.aggregateddata;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalAerAggregatedDataAnnualEmission {

    @Builder.Default
    @Valid
    @NotEmpty
    @JsonDeserialize(as = LinkedHashSet.class)
    private Set<@NotNull @Valid ExternalAerAggregatedDataFuelConsumption> emissions = new LinkedHashSet<>();

    @NotNull
    @Valid
    private ExternalAerAggregatedDataEmissionsMeasurements etsEmissionsWithinUkPort;

    @NotNull
    @Valid
    private ExternalAerAggregatedDataEmissionsMeasurements etsEmissionsBetweenUkPort;

    @NotNull
    @Valid
    private ExternalAerAggregatedDataEmissionsMeasurements etsEmissionsBetweenUkAndNiPort;
}
