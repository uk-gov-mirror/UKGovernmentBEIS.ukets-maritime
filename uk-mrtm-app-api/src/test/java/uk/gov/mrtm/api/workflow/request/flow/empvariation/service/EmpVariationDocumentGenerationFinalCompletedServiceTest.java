package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.workflow.request.flow.common.constants.MrtmBpmnProcessConstants;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRegulatorLedReason;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRegulatorLedReasonType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSubmitOutcome;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

@ExtendWith(MockitoExtension.class)
class EmpVariationDocumentGenerationFinalCompletedServiceTest {

	@InjectMocks
    private EmpVariationDocumentGenerationFinalCompletedService cut;

    @Mock
    private WorkflowService workflowService;

    @Test
    void completed_operator_led_complete_task() {
    	RequestGeneratedFileType fileType = RequestGeneratedFileType.EMP;
    	FileInfoDTO fileInfoDTO = FileInfoDTO.builder()
    			.name("name")
    			.build();
    	
    	EmpVariationRequestPayload requestPayload = EmpVariationRequestPayload.builder()
    			.officialNotice(FileInfoDTO.builder().name("off").build())
    			.build();
    	
    	Request request = Request.builder()
    			.id("requestId")
    			.payload(requestPayload)
    			.metadata(EmpVariationRequestMetadata.builder().initiatorRoleType(RoleTypeConstants.OPERATOR).build())
    			.build();
    	
    	EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder()
    			.determination(EmpVariationDetermination.builder()
    					.type(EmpVariationDeterminationType.APPROVED)
    					.build())
    			.build();
    	
    	RequestTask requestTask = RequestTask.builder()
    			.payload(requestTaskPayload)
    			.request(request)
    			.processTaskId("prT")
    			.build();
    	
    	cut.completed(requestTask, fileType, fileInfoDTO);
    	
    	assertThat(requestPayload.getEmpDocument()).isEqualTo(fileInfoDTO);
    	assertThat(requestTaskPayload.getFinalDocumentsGenerationSuccessful()).isTrue();
    	assertThat(requestPayload.getEmpDocument()).isEqualTo(fileInfoDTO);
    	
    	verify(workflowService, times(1)).completeTask(requestTask.getProcessTaskId(),
                Map.of(BpmnProcessConstants.REQUEST_ID, requestTask.getRequest().getId(),
                        BpmnProcessConstants.REVIEW_DETERMINATION, EmpVariationDeterminationType.APPROVED,
                        BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.NOTIFY_OPERATOR));
    }
    
    @Test
    void completed_operator_led_not_complete_task() {
    	RequestGeneratedFileType fileType = RequestGeneratedFileType.EMP;
    	FileInfoDTO fileInfoDTO = FileInfoDTO.builder()
    			.name("name")
    			.build();
    	
    	EmpVariationRequestPayload requestPayload = EmpVariationRequestPayload.builder()
    			.officialNotice(null)
    			.build();
    	
    	Request request = Request.builder()
    			.id("requestId")
    			.payload(requestPayload)
    			.metadata(EmpVariationRequestMetadata.builder().initiatorRoleType(RoleTypeConstants.OPERATOR).build())
    			.build();
    	
    	EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder()
    			.determination(EmpVariationDetermination.builder()
    					.type(EmpVariationDeterminationType.APPROVED)
    					.build())
    			.build();
    	
    	RequestTask requestTask = RequestTask.builder()
    			.payload(requestTaskPayload)
    			.request(request)
    			.processTaskId("prT")
    			.build();
    	
    	cut.completed(requestTask, fileType, fileInfoDTO);
    	
    	assertThat(requestPayload.getEmpDocument()).isEqualTo(fileInfoDTO);
    	
    	verifyNoInteractions(workflowService);
    }
    
    @Test
    void completed_regulator_led_complete_task() {
    	RequestGeneratedFileType fileType = RequestGeneratedFileType.EMP;
    	FileInfoDTO fileInfoDTO = FileInfoDTO.builder()
    			.name("name")
    			.build();
    	
    	EmpVariationRequestPayload requestPayload = EmpVariationRequestPayload.builder()
    			.officialNotice(FileInfoDTO.builder().name("off").build())
    			.build();
    	
    	Request request = Request.builder()
    			.id("requestId")
    			.payload(requestPayload)
    			.metadata(EmpVariationRequestMetadata.builder().initiatorRoleType(RoleTypeConstants.REGULATOR).build())
    			.build();
    	
    	EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload requestTaskPayload = EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload.builder()
    			.reasonRegulatorLed(EmpVariationRegulatorLedReason.builder().type(EmpVariationRegulatorLedReasonType.OTHER).build())
    			.build();
    	
    	RequestTask requestTask = RequestTask.builder()
    			.payload(requestTaskPayload)
    			.request(request)
    			.processTaskId("prT")
    			.build();
    	
    	cut.completed(requestTask, fileType, fileInfoDTO);
    	
    	assertThat(requestPayload.getEmpDocument()).isEqualTo(fileInfoDTO);
    	assertThat(requestTaskPayload.getFinalDocumentsGenerationSuccessful()).isTrue();
    	assertThat(requestPayload.getEmpDocument()).isEqualTo(fileInfoDTO);
    	
    	verify(workflowService, times(1)).completeTask(requestTask.getProcessTaskId(),
    			Map.of(BpmnProcessConstants.REQUEST_ID, requestTask.getRequest().getId(),
                        MrtmBpmnProcessConstants.EMP_VARIATION_SUBMIT_OUTCOME, EmpVariationSubmitOutcome.SUBMITTED,
                        BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.NOTIFY_OPERATOR,
                        BpmnProcessConstants.SKIP_PAYMENT, true));
    }
}
