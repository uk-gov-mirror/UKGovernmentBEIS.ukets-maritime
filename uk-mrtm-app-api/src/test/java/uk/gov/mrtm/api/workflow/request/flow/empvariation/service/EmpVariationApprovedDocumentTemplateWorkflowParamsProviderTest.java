package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpAcceptedVariationDecisionDetails;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationReviewDecisionType;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionDetails;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpVariationApprovedDocumentTemplateWorkflowParamsProviderTest {

    @InjectMocks
    private EmpVariationApprovedDocumentTemplateWorkflowParamsProvider provider;
    
    @Mock
    private EmissionsMonitoringPlanService emissionsMonitoringPlanService;

    @Test
    void getContextActionType() {
        assertThat(provider.getContextActionType()).isEqualTo(
                MrtmDocumentTemplateGenerationContextActionType.EMP_VARIATION_ACCEPTED);
    }

    @Test
    void constructParams() {
    	Long accountId = 1L;
    	int nextConsolidationNumber = 3;
    	
    	when(emissionsMonitoringPlanService.calculateNextConsolidationNumber(accountId)).thenReturn(nextConsolidationNumber);
    	
    	EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder()
    			.determination(EmpVariationDetermination.builder()
                        .type(EmpVariationDeterminationType.APPROVED)
                        .reason("Reason")
                        .build())
    			.empVariationDetailsReviewDecision(EmpVariationReviewDecision.builder()
                        .details(EmpAcceptedVariationDecisionDetails.builder()
                                .variationScheduleItems(List.of("sch_var_details_1", "sch_var_details_2"))
                                .notes("notes")
                                .build())
                        .build())
    			.reviewGroupDecisions(Map.of(
                        EmpReviewGroup.ABBREVIATIONS_AND_DEFINITIONS, EmpVariationReviewDecision.builder()
                                .type(EmpVariationReviewDecisionType.ACCEPTED)
                                .details(EmpAcceptedVariationDecisionDetails.builder()
                                        .variationScheduleItems(List.of("sch_abbr_1", "sch_abbr_2")).build()).build(),
                        EmpReviewGroup.MARITIME_OPERATOR_DETAILS, EmpVariationReviewDecision.builder()
                                .type(EmpVariationReviewDecisionType.ACCEPTED)
                                .details(EmpAcceptedVariationDecisionDetails.builder()
                                        .variationScheduleItems(List.of("sch_op_details_1")).build()).build(),
                        EmpReviewGroup.ADDITIONAL_DOCUMENTS, EmpVariationReviewDecision.builder()
                                .type(EmpVariationReviewDecisionType.REJECTED)
                                .details(ReviewDecisionDetails.builder().notes("notes").build()).build()
                ))
    			.build();
    	
    	Request request = Request.builder()
    			.requestResources(List.of(
    					RequestResource.builder()
    						.resourceType(ResourceType.ACCOUNT).resourceId(String.valueOf(accountId))
    						.build()
    					))
    			.build();
    	
    	RequestTask requestTask = RequestTask.builder()
    			.request(request)
    			.payload(requestTaskPayload)
    			.build();
    	
        Map<String, Object> result = provider.constructParams(requestTask);

        assertThat(result).containsExactlyInAnyOrderEntriesOf(Map.of(
                "empConsolidationNumber", nextConsolidationNumber,
                "variationScheduleItems", List.of("sch_var_details_1", "sch_var_details_2",
                        "sch_op_details_1",
                        "sch_abbr_1", "sch_abbr_2")
        ));
        
        verify(emissionsMonitoringPlanService, times(1)).calculateNextConsolidationNumber(accountId);
    }
}
