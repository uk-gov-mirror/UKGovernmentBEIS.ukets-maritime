package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpAcceptedVariationDecisionDetails;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationReviewDecisionType;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateAsyncWorkflowParamsProvider;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Stream;

@Component
@RequiredArgsConstructor
public class EmpVariationApprovedDocumentTemplateWorkflowParamsProvider
        implements DocumentTemplateAsyncWorkflowParamsProvider {
	
	private final EmissionsMonitoringPlanService emissionsMonitoringPlanService;
	
    @Override
    public String getContextActionType() {
        return MrtmDocumentTemplateGenerationContextActionType.EMP_VARIATION_ACCEPTED;
    }

    @Override
    public Map<String, Object> constructParams(RequestTask requestTask) {
		final EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = (EmpVariationApplicationReviewRequestTaskPayload) requestTask
				.getPayload();
		final int nextConsolidationNumber = emissionsMonitoringPlanService
				.calculateNextConsolidationNumber(requestTask.getRequest().getAccountId());
    	
        final EmpAcceptedVariationDecisionDetails variationDecisionDetails = (EmpAcceptedVariationDecisionDetails) requestTaskPayload
                .getEmpVariationDetailsReviewDecision().getDetails();

        final TreeMap<EmpReviewGroup, EmpVariationReviewDecision> sortedDecisions = new TreeMap<>(
        		requestTaskPayload.getReviewGroupDecisions());
        final List<String> reviewGroupsVariationScheduleItems = sortedDecisions
                .values()
                .stream()
                .filter(empVariationReviewDecision -> empVariationReviewDecision.getType() == EmpVariationReviewDecisionType.ACCEPTED)
                .map(EmpVariationReviewDecision::getDetails)
                .map(EmpAcceptedVariationDecisionDetails.class::cast)
                .map(EmpAcceptedVariationDecisionDetails::getVariationScheduleItems)
                .flatMap(List::stream)
                .toList();

        return Map.of(
                "empConsolidationNumber", nextConsolidationNumber,
                "variationScheduleItems", Stream.concat(variationDecisionDetails.getVariationScheduleItems().stream(),
                                reviewGroupsVariationScheduleItems.stream())
                        .toList()
        );
    }
}
