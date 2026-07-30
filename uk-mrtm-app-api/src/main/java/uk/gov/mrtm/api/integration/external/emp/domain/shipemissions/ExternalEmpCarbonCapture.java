package uk.gov.mrtm.api.integration.external.emp.domain.shipemissions;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.netz.api.common.validation.SpELExpression;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SpELExpression(expression = "{T(java.lang.Boolean).TRUE.equals(#captureAndStorageApplied) == (#technology != null)}",
    message = "emp.external.emission.carbon.technology.captureAndStorageApplied")
@SpELExpression(expression = "{T(java.lang.Boolean).TRUE.equals(#captureAndStorageApplied) == (#emissionSourceName?.size() gt 0)}",
    message = "emp.external.emission.carbon.emissionSourceName.captureAndStorageApplied")
public class ExternalEmpCarbonCapture {

    @Schema(description = "Are carbon capture and storage technologies being applied. If true, technology and emissionSourceName are required")
    @NotNull
    private Boolean captureAndStorageApplied;

    @Schema(description = "Technology that is used for carbon capture and storage")
    @Size(max = 10000)
    private String technology;

    @Schema(description = "Emission source names this technology is applied to")
    @Builder.Default
    @JsonDeserialize(as = LinkedHashSet.class)
    private Set<String> emissionSourceName = new LinkedHashSet<>();
}
