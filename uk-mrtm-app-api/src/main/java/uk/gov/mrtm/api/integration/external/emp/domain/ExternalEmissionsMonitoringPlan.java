package uk.gov.mrtm.api.integration.external.emp.domain;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.integration.external.emp.domain.datagaps.ExternalEmpDataGaps;
import uk.gov.mrtm.api.integration.external.emp.domain.delegatedresponsibility.ExternalEmpDelegatedResponsibility;
import uk.gov.mrtm.api.integration.external.emp.domain.procedures.ExternalEmpProcedures;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpShipEmissions;
import uk.gov.netz.api.common.validation.uniqueelements.UniqueElements;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalEmissionsMonitoringPlan {

    @Schema(description = "Ships and emission details. All ships related to the EMP must be provided")
    @Builder.Default
    @Valid
    @NotEmpty
    @JsonDeserialize(as = LinkedHashSet.class)
    @UniqueElements
    private Set<@NotNull @Valid ExternalEmpShipEmissions> shipParticulars = new LinkedHashSet<>();

    @Schema(description = "Delegated UK ETS responsibility")
    @Valid
    @NotNull
    private ExternalEmpDelegatedResponsibility delegatedResponsibility;

    @Valid
    @NotNull
    private ExternalEmpProcedures procedures;

    @Valid
    @NotNull
    private ExternalEmpDataGaps dataGaps;
}