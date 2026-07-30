package uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.RequestPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.payment.domain.RequestPayloadPayable;
import uk.gov.netz.api.workflow.request.flow.payment.domain.RequestPaymentInfo;
import uk.gov.netz.api.workflow.request.flow.rde.domain.RdeData;
import uk.gov.netz.api.workflow.request.flow.rde.domain.RequestPayloadRdeable;
import uk.gov.netz.api.workflow.request.flow.rfi.domain.RequestPayloadRfiable;
import uk.gov.netz.api.workflow.request.flow.rfi.domain.RfiData;

import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class EmpIssuanceRequestPayload extends RequestPayload implements RequestPayloadRdeable, RequestPayloadRfiable, RequestPayloadPayable {

    private EmissionsMonitoringPlan emissionsMonitoringPlan;

    @Builder.Default
    private Map<String, String> empSectionsCompleted = new HashMap<>();

    @Builder.Default
    private Map<UUID, String> empAttachments = new HashMap<>();

    @Builder.Default
    private Map<EmpReviewGroup, EmpIssuanceReviewDecision> reviewGroupDecisions = new EnumMap<>(EmpReviewGroup.class);

    @Builder.Default
    private Map<UUID, String> reviewAttachments = new HashMap<>();

    private EmpIssuanceDetermination determination;

    private DecisionNotification decisionNotification;

    private FileInfoDTO officialNotice;

    private FileInfoDTO empDocument;

    private boolean accountOpeningEventSentToRegistry;

    @JsonUnwrapped
    private RfiData rfiData;

    @JsonUnwrapped
    private RdeData rdeData;

    private RequestPaymentInfo requestPaymentInfo;

    public boolean shouldGenerateEmpDocument() {
        return determination != null && determination.getType() == EmpIssuanceDeterminationType.APPROVED;
    }
}
