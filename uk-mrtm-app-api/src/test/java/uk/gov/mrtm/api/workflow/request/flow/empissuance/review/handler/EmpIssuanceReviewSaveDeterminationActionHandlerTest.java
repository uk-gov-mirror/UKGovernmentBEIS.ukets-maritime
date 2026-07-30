package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service.RequestEmpReviewService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.validation.EmpIssuanceReviewDeterminationValidatorService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceReviewSaveDeterminationActionHandlerTest {

    @InjectMocks
    private EmpIssuanceReviewSaveDeterminationActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private RequestEmpReviewService requestEmpReviewService;

    @Mock
    private EmpIssuanceReviewDeterminationValidatorService determinationValidatorService;

    @Test
    void process() {
        Long requestTaskId = 1L;
        String requestTaskActionType = MrtmRequestTaskActionType.EMP_ISSUANCE_SAVE_REVIEW_DETERMINATION;
        AppUser appUser = AppUser.builder().build();
        EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload taskActionPayload =
            EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload.builder()
                .determination(EmpIssuanceDetermination.builder().type(EmpIssuanceDeterminationType.APPROVED).build())
                .build();
        EmpIssuanceApplicationReviewRequestTaskPayload expectedRequestTaskPayload =
            mock(EmpIssuanceApplicationReviewRequestTaskPayload.class);

        RequestTask requestTask = RequestTask.builder().id(requestTaskId).payload(expectedRequestTaskPayload).build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);
        when(determinationValidatorService.isValid(expectedRequestTaskPayload, EmpIssuanceDeterminationType.APPROVED)).thenReturn(true);

        RequestTaskPayload requestTaskPayload =
            handler.process(requestTaskId, requestTaskActionType, appUser, taskActionPayload);

        assertThat(requestTaskPayload).isEqualTo(expectedRequestTaskPayload);
        verifyNoMoreInteractions(expectedRequestTaskPayload);
        verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
        verify(determinationValidatorService, times(1)).isValid(expectedRequestTaskPayload, EmpIssuanceDeterminationType.APPROVED);
        verify(requestEmpReviewService, times(1)).saveDetermination(taskActionPayload, requestTask);

        verifyNoMoreInteractions(requestTaskService, requestEmpReviewService, determinationValidatorService);
    }

    @Test
    void process_when_invalid_determination_throw_error() {
        Long requestTaskId = 1L;
        String requestTaskActionType = MrtmRequestTaskActionType.EMP_ISSUANCE_SAVE_REVIEW_DETERMINATION;
        AppUser appUser = AppUser.builder().build();
        EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload taskActionPayload =
            EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload.builder()
                .determination(EmpIssuanceDetermination.builder().type(EmpIssuanceDeterminationType.APPROVED).build())
                .build();
        EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload = EmpIssuanceApplicationReviewRequestTaskPayload.builder().build();

        RequestTask requestTask = RequestTask.builder().id(requestTaskId).payload(requestTaskPayload).build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);
        when(determinationValidatorService.isValid(requestTaskPayload, EmpIssuanceDeterminationType.APPROVED)).thenReturn(false);

        BusinessException be = assertThrows(BusinessException.class,
            () -> handler.process(requestTaskId, requestTaskActionType, appUser, taskActionPayload));

        assertThat(be.getErrorCode()).isEqualTo(ErrorCode.FORM_VALIDATION);

        verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
        verify(determinationValidatorService, times(1)).isValid(requestTaskPayload, EmpIssuanceDeterminationType.APPROVED);
        verifyNoInteractions(requestEmpReviewService);
        verifyNoMoreInteractions(requestTaskService, requestEmpReviewService, determinationValidatorService);
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes())
            .containsExactly(MrtmRequestTaskActionType.EMP_ISSUANCE_SAVE_REVIEW_DETERMINATION);

    }

}