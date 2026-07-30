package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpAcceptedVariationDecisionDetails;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateAsyncWorkflowParamsProvider;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Component
@RequiredArgsConstructor
public class EmpVariationApprovedRegulatorLedDocumentTemplateWorkflowParamsProvider
        implements DocumentTemplateAsyncWorkflowParamsProvider {
	
	private final EmissionsMonitoringPlanService emissionsMonitoringPlanService;
	
    @Override
    public String getContextActionType() {
        return MrtmDocumentTemplateGenerationContextActionType.EMP_VARIATION_REGULATOR_LED_APPROVED;
    }

    @Override
    public Map<String, Object> constructParams(RequestTask requestTask) {
		final EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload requestTaskPayload = (EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload) requestTask
				.getPayload();
		
		final int nextConsolidationNumber = emissionsMonitoringPlanService
				.calculateNextConsolidationNumber(requestTask.getRequest().getAccountId());
    	
        final TreeMap<EmpReviewGroup, EmpAcceptedVariationDecisionDetails> sortedDecisions = new TreeMap<>(
        		requestTaskPayload.getReviewGroupDecisions());
        final List<String> reviewGroupsVariationScheduleItems = sortedDecisions
            .values()
            .stream()
            .map(EmpAcceptedVariationDecisionDetails::getVariationScheduleItems)
            .flatMap(List::stream)
            .toList();

        return Map.of(
            "reason", requestTaskPayload.getReasonRegulatorLed().getDocumentReason(),
            "empConsolidationNumber", nextConsolidationNumber,
            "variationScheduleItems", reviewGroupsVariationScheduleItems
        );
    }

}
