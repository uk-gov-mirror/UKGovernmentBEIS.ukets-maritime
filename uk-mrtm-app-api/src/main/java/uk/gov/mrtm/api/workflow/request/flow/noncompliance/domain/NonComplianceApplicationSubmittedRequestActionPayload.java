package uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.common.validation.NotAfterCurrentDateInZone;
import uk.gov.netz.api.workflow.request.application.taskview.RequestInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.RequestActionPayload;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class NonComplianceApplicationSubmittedRequestActionPayload extends RequestActionPayload {

    @NotNull
    private NonComplianceReason reason;

    @NotAfterCurrentDateInZone
    private LocalDate nonComplianceDate;

    @NotAfterCurrentDateInZone
    private LocalDate complianceDate;

    @Size(max = 10000)
    private String nonComplianceComments;

    @Builder.Default
    private Set<RequestInfoDTO> selectedRequests = new HashSet<>();

    @Valid
    @NotNull
    @JsonUnwrapped
    private NonCompliancePenalties nonCompliancePenalties;

    @Builder.Default
    private Map<String, String> sectionsCompleted = new HashMap<>();
}
