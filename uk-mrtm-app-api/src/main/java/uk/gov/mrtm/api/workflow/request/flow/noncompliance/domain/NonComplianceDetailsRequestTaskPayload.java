package uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.common.validation.NotAfterCurrentDateInZone;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class NonComplianceDetailsRequestTaskPayload extends RequestTaskPayload {

    @NotNull
    private NonComplianceReason reason;

    @NotAfterCurrentDateInZone
    private LocalDate nonComplianceDate;

    @NotAfterCurrentDateInZone
    private LocalDate complianceDate;

    @Size(max = 10000)
    private String nonComplianceComments;
}
