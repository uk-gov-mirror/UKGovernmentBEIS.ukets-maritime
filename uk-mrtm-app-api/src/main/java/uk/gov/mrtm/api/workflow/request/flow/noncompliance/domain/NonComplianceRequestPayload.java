package uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.workflow.request.core.domain.RequestPayload;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class NonComplianceRequestPayload extends RequestPayload {

    @NotNull
    private NonComplianceReason reason;

    private LocalDate nonComplianceDate;

    private LocalDate complianceDate;

    @Size(max = 10000)
    private String nonComplianceComments;

    private NonComplianceCloseJustification closeJustification;
    
    private UUID initialPenaltyNotice;

    private String initialPenaltyComments;
    
    @Builder.Default
    private Map<String, String> initialPenaltySectionsCompleted = new HashMap<>();
    
    private Boolean issueNoticeOfIntent;

    private UUID noticeOfIntent;

    private String noticeOfIntentComments;

    @Builder.Default
    private Map<String, String> noticeOfIntentSectionsCompleted = new HashMap<>();

    private UUID civilPenalty;

    private BigDecimal civilPenaltyAmount;

    private LocalDate civilPenaltyDueDate;

    @Size(max = 10000)
    private String civilPenaltyComments;

    @Builder.Default
    private Map<String, String> civilPenaltySectionsCompleted = new HashMap<>();

    private boolean reIssueCivilPenalty;

    @Builder.Default
    private Map<UUID, String> nonComplianceAttachments = new HashMap<>();
}
