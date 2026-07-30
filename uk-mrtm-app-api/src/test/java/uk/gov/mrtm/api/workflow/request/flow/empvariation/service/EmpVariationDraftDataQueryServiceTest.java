package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRegulatorLedReason;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestInfo;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestMetadata;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.common.utils.DateService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;

@ExtendWith(MockitoExtension.class)
class EmpVariationDraftDataQueryServiceTest {

	@InjectMocks
    private EmpVariationDraftDataQueryService cut;
	
    @Mock
    private DateService dateService;

    @Test
    void getEmpVariationDraftData_operator_led() {
    	LocalDateTime CREATION_DATE = LocalDateTime.of(2023, 6, 1, 9, 0, 0);
        LocalDateTime SUBMISSION_DATE = LocalDateTime.of(2023, 6, 10, 9, 0, 0);
        
        EmpVariationRequestMetadata requestMetadata = EmpVariationRequestMetadata.builder()
                .type("type")
                .initiatorRoleType(RoleTypeConstants.OPERATOR)
                .build();
        
        Request request = Request.builder()
                .id("1")
                .creationDate(CREATION_DATE)
                .submissionDate(SUBMISSION_DATE)
                .metadata(requestMetadata)
                .build();
        
        EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder()
        		.determination(EmpVariationDetermination.builder().summary("sum").build())
        		.build();
        
        RequestTask requestTask = RequestTask.builder()
        		.request(request)
        		.payload(requestTaskPayload)
        		.build();

        int nextConsolidationNumber = 3;
        
        LocalDateTime now = LocalDateTime.now();
        when(dateService.getLocalDateTime()).thenReturn(now);
        
        EmpVariationRequestInfo result = cut.getEmpVariationDraftData(requestTask, nextConsolidationNumber);
        
        assertThat(result).isEqualTo(EmpVariationRequestInfo.builder()
        		.id(request.getId())
        		.submissionDate(request.getSubmissionDate())
        		.endDate(now)
        		.metadata(EmpVariationRequestMetadata.builder()
        				.empConsolidationNumber(nextConsolidationNumber)
        				.type("type")
        				.initiatorRoleType(requestMetadata.getInitiatorRoleType())
						.summary("sum")
        				.build())
        		.build());

    }
    
    @Test
    void getEmpVariationDraftData_Reg() {
    	LocalDateTime CREATION_DATE = LocalDateTime.of(2023, 6, 1, 9, 0, 0);
        LocalDateTime SUBMISSION_DATE = LocalDateTime.of(2023, 6, 10, 9, 0, 0);
        
        EmpVariationRequestMetadata requestMetadata = EmpVariationRequestMetadata.builder()
                .type("type")
                .initiatorRoleType(RoleTypeConstants.REGULATOR)
                .build();
        
        Request request = Request.builder()
                .id("1")
                .creationDate(CREATION_DATE)
                .submissionDate(SUBMISSION_DATE)
                .metadata(requestMetadata)
                .build();
        
        EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload requestTaskPayload = EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload.builder()
        		.reasonRegulatorLed(EmpVariationRegulatorLedReason.builder().summary("sum").build())
        		.build();
        
        RequestTask requestTask = RequestTask.builder()
        		.request(request)
        		.payload(requestTaskPayload)
        		.build();


        int nextConsolidationNumber = 3;
        
        LocalDateTime now = LocalDateTime.now();
        when(dateService.getLocalDateTime()).thenReturn(now);
        
        EmpVariationRequestInfo result = cut.getEmpVariationDraftData(requestTask, nextConsolidationNumber);
        
        
        
        assertThat(result).isEqualTo(EmpVariationRequestInfo.builder()
        		.id(request.getId())
        		.submissionDate(request.getCreationDate())
        		.endDate(now)
        		.metadata(EmpVariationRequestMetadata.builder()
        				.empConsolidationNumber(nextConsolidationNumber)
        				.type("type")
        				.initiatorRoleType(requestMetadata.getInitiatorRoleType())
						.summary("sum")
        				.build())
        		.build());
    }

    @Test
    void getEmpVariationDeterminationSummary_whenSummaryMissing_returnsEmptyString() {
        EmpVariationApplicationReviewRequestTaskPayload payload =
                EmpVariationApplicationReviewRequestTaskPayload.builder()
                        .determination(EmpVariationDetermination.builder()
                                .type(EmpVariationDeterminationType.DEEMED_WITHDRAWN)
                                .reason("withdraw reason")
                                .build())
                        .build();

        assertThat(cut.getEmpVariationDeterminationSummary(payload)).isEmpty();
    }

    @Test
    void getEmpVariationDeterminationRegulatorLedSummary_whenSummaryMissing_returnsEmptyString() {
        EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload payload =
                EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload.builder()
                        .reasonRegulatorLed(EmpVariationRegulatorLedReason.builder().build())
                        .build();

        assertThat(cut.getEmpVariationDeterminationRegulatorLedSummary(payload)).isEmpty();
    }
    
}
