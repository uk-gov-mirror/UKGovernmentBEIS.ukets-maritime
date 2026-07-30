package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpAcceptedVariationDecisionDetails;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRegulatorLedReason;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRegulatorLedReasonType;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpVariationApprovedRegulatorLedDocumentTemplateWorkflowParamsProviderTest {

    @InjectMocks
    private EmpVariationApprovedRegulatorLedDocumentTemplateWorkflowParamsProvider provider;
    
    @Mock
    private EmissionsMonitoringPlanService emissionsMonitoringPlanService;

    @Test
    void getContextActionType() {
        assertThat(provider.getContextActionType()).isEqualTo(
            MrtmDocumentTemplateGenerationContextActionType.EMP_VARIATION_REGULATOR_LED_APPROVED);
    }

    @ParameterizedTest
    @MethodSource("regulatorReasonType")
    void constructParams(EmpVariationRegulatorLedReasonType type, String reasonOtherSummary, String expectedReason) {
    	Long accountId = 1L;
    	
    	int nextConsolidationNumber = 3;
    	
    	when(emissionsMonitoringPlanService.calculateNextConsolidationNumber(accountId)).thenReturn(nextConsolidationNumber);
    	
    	EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload requestTaskPayload = EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload.builder()
    			.reviewGroupDecisions(Map.of(
    	                EmpReviewGroup.MARITIME_OPERATOR_DETAILS,
    	                EmpAcceptedVariationDecisionDetails.builder().variationScheduleItems(List.of("1", "2")).build(),
    	                EmpReviewGroup.ABBREVIATIONS_AND_DEFINITIONS,
    	                EmpAcceptedVariationDecisionDetails.builder().variationScheduleItems(List.of("3", "4")).build()
    	            ))
    			.reasonRegulatorLed(EmpVariationRegulatorLedReason.builder().type(type).reasonOtherSummary(reasonOtherSummary).build())
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
            "reason", expectedReason,
            "variationScheduleItems", List.of("1", "2", "3", "4")
        ));
        
        verify(emissionsMonitoringPlanService, times(1)).calculateNextConsolidationNumber(accountId);
    }


    private static Stream<Arguments> regulatorReasonType() {
        return Stream.of(
            Arguments.of(EmpVariationRegulatorLedReasonType.FOLLOWING_IMPROVING_REPORT, null,
                EmpVariationRegulatorLedReasonType.FOLLOWING_IMPROVING_REPORT.getDescription()),
            Arguments.of(EmpVariationRegulatorLedReasonType.FAILED_TO_COMPLY_OR_APPLY, null,
                EmpVariationRegulatorLedReasonType.FAILED_TO_COMPLY_OR_APPLY.getDescription()),
            Arguments.of(EmpVariationRegulatorLedReasonType.OTHER, "other reason",
                "The Environment Agency has varied your emissions monitoring plan other reason")
        );
    }
}