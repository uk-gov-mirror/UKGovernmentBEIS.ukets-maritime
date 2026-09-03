package uk.gov.mrtm.api.workflow.request.flow.empnotification.domain;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.common.validation.NotBeforeCurrentDateInZone;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskActionPayload;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class EmpNotificationFollowUpExtendDateRequestTaskActionPayload extends RequestTaskActionPayload {

    @NotNull
    @NotBeforeCurrentDateInZone(inclusive = false)
    private LocalDate dueDate;
}
