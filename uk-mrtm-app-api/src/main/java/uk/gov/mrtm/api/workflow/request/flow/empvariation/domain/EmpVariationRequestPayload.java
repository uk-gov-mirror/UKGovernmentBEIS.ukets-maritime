package uk.gov.mrtm.api.workflow.request.flow.empvariation.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
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
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;


@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class EmpVariationRequestPayload extends RequestPayload
	implements RequestPayloadPayable, RequestPayloadRdeable, RequestPayloadRfiable {
	
	private EmissionsMonitoringPlanContainer originalEmpContainer;

	private EmissionsMonitoringPlan emissionsMonitoringPlan;
	
	private EmpVariationDetails empVariationDetails;
	
	private String empVariationDetailsCompleted;

	@Builder.Default
	private Set<EmpReviewGroup> updatedSubtasks = new HashSet<>();

	@Builder.Default
	private Map<String, String> empSectionsCompleted = new HashMap<>();

	@Builder.Default
	private Map<UUID, String> empAttachments = new HashMap<>();

	private String empVariationDetailsReviewCompleted;
	
	@Builder.Default
    private Map<EmpReviewGroup, EmpVariationReviewDecision> reviewGroupDecisions = new EnumMap<>(EmpReviewGroup.class);
	
	private EmpVariationReviewDecision empVariationDetailsReviewDecision;
	
    @Builder.Default
    private Map<UUID, String> reviewAttachments = new HashMap<>();
    
	/** Regulator LED property */
    private Map<EmpReviewGroup, EmpAcceptedVariationDecisionDetails> reviewGroupDecisionsRegulatorLed;
	
	/** Regulator LED property */
	private EmpVariationRegulatorLedReason reasonRegulatorLed;
    
    private EmpVariationDetermination determination;
    
    private DecisionNotification decisionNotification;
    
    @JsonInclude(Include.NON_EMPTY)
	private Integer empConsolidationNumber;

    private RequestPaymentInfo requestPaymentInfo;
    
    @JsonUnwrapped
    private RfiData rfiData;

    @JsonUnwrapped
    private RdeData rdeData;
    
    private FileInfoDTO officialNotice;
    
    private FileInfoDTO empDocument;
    
	public boolean shouldGenerateEmpDocument() {
		return (determination != null && determination.getType() == EmpVariationDeterminationType.APPROVED)
				|| reasonRegulatorLed != null;
	}
	
}
