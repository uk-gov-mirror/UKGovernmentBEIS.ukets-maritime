package uk.gov.mrtm.api.integration.external.aer.domain.shipemissions;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.EmissionSourceClass;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.EmissionSourceType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.MonitoringMethod;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpFuelOriginTypeName;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalAerEmissionsSources {

    @NotBlank
    @Size(min = 1, max = 255)
    private String name;

    @NotNull
    private EmissionSourceType emissionSourceTypeCode;

    @NotNull
    private EmissionSourceClass emissionSourceClassCode;

    @Builder.Default
    @JsonDeserialize(as = LinkedHashSet.class)
    @NotEmpty
    @Valid
    private Set<ExternalEmpFuelOriginTypeName> fuelTypeCodes = new LinkedHashSet<>();

    @Builder.Default
    @JsonDeserialize(as = LinkedHashSet.class)
    @NotEmpty
    private Set<MonitoringMethod> monitoringMethods = new LinkedHashSet<>();
}
