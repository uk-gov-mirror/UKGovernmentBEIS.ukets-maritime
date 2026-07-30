package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceDocumentGenerationFinalCompletedServiceTest {

    @InjectMocks
    private EmpIssuanceDocumentGenerationFinalCompletedService cut;

    @Mock
    private WorkflowService workflowService;

    @ParameterizedTest
    @MethodSource
    void completed_complete_task(EmpIssuanceDeterminationType determinationType, RequestGeneratedFileType fileType,
                                 FileInfoDTO empFile, FileInfoDTO noticeFile,
                                 FileInfoDTO expectedEmpFile, FileInfoDTO expectedNoticeFile,
                                 FileInfoDTO fileInfoDTO, int verifyCompleteTask,
                                 boolean successful, boolean inProgress) {

        EmpIssuanceRequestPayload requestPayload = EmpIssuanceRequestPayload.builder()
            .officialNotice(noticeFile)
            .empDocument(empFile)
            .determination(EmpIssuanceDetermination.builder()
                .type(determinationType)
                .build())
            .build();

        Request request = Request.builder()
            .id("requestId")
            .payload(requestPayload)
            .build();

        EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload = EmpIssuanceApplicationReviewRequestTaskPayload.builder()
            .determination(EmpIssuanceDetermination.builder()
                .type(determinationType)
                .build())
            .finalDocumentsGenerationSuccessful(false)
            .finalDocumentsGenerationInProgress(true)
            .build();

        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .request(request)
            .processTaskId("prT")
            .build();

        cut.completed(requestTask, fileType, fileInfoDTO);

        assertThat(requestPayload.getEmpDocument()).isEqualTo(expectedEmpFile);
        assertThat(requestPayload.getOfficialNotice()).isEqualTo(expectedNoticeFile);

        assertThat(requestTaskPayload.getFinalDocumentsGenerationSuccessful()).isEqualTo(successful);
        assertThat(requestTaskPayload.getFinalDocumentsGenerationInProgress()).isEqualTo(inProgress);

        verify(workflowService, times(verifyCompleteTask)).completeTask(requestTask.getProcessTaskId(),
            Map.of(BpmnProcessConstants.REQUEST_ID, requestTask.getRequest().getId(),
                BpmnProcessConstants.REVIEW_DETERMINATION, determinationType,
                BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.NOTIFY_OPERATOR));

        verifyNoMoreInteractions(workflowService);
    }

    private static Stream<Arguments> completed_complete_task() {
        FileInfoDTO emp = FileInfoDTO.builder()
            .name("emp")
            .build();

        FileInfoDTO notice = FileInfoDTO.builder()
            .name("notice")
            .build();

        return Stream.of(
            Arguments.of(EmpIssuanceDeterminationType.APPROVED, RequestGeneratedFileType.EMP,
                null, notice, emp, notice, emp, 1, true, false),
            Arguments.of(EmpIssuanceDeterminationType.APPROVED, RequestGeneratedFileType.OFFICIAL_NOTICE,
                emp, null, emp, notice, notice, 1, true, false),
            Arguments.of(EmpIssuanceDeterminationType.DEEMED_WITHDRAWN, RequestGeneratedFileType.OFFICIAL_NOTICE,
                null, null, null, notice, notice, 1, true, false),
            Arguments.of(EmpIssuanceDeterminationType.APPROVED, RequestGeneratedFileType.EMP,
                null, null, emp, null, emp, 0, false, true),
            Arguments.of(EmpIssuanceDeterminationType.APPROVED, RequestGeneratedFileType.OFFICIAL_NOTICE,
                null, null, null, notice, notice, 0, false, true)
        );
    }
}