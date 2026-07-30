package uk.gov.mrtm.api.reporting.domain.aggregateddata;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.reporting.domain.common.AerPortEmissionsMeasurement;
import uk.gov.mrtm.api.reporting.domain.emissions.fuel.DataInputType;
import uk.gov.netz.api.common.validation.uniqueelements.UniqueField;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AerShipAggregatedData {

    @NotNull
    private UUID uniqueIdentifier;

    private boolean isFromFetch;

    @NotBlank
    @Size(max = 7)
    @UniqueField
    private String imoNumber;

    @Builder.Default
    @Valid
    @JsonDeserialize(as = LinkedHashSet.class)
    private Set<@NotNull @Valid AerAggregatedDataFuelConsumption> fuelConsumptions = new HashSet<>();

    @NotNull
    @Valid
    private AerPortEmissionsMeasurement emissionsWithinUKPorts;

    @NotNull
    @Valid
    private AerPortEmissionsMeasurement emissionsBetweenUKPorts;

    @NotNull
    @Valid
    private AerPortEmissionsMeasurement emissionsBetweenUKAndNIVoyages;

    @NotNull
    @Valid
    private AerPortEmissionsMeasurement totalEmissionsFromVoyagesAndPorts;

    @NotNull
    @Valid
    private AerPortEmissionsMeasurement lessVoyagesInNorthernIrelandDeduction;

    @NotNull
    @Valid
    @PositiveOrZero
    @Digits(integer = Integer.MAX_VALUE, fraction= 7)
    private BigDecimal totalShipEmissions;

    @NotNull
    @Valid
    @PositiveOrZero
    @Digits(integer = Integer.MAX_VALUE, fraction= 7)
    private BigDecimal surrenderEmissions;

    @NotNull
    private DataInputType dataInputType;
}
