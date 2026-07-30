package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveReviewDeterminationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.validator.EmpVariationReviewDeterminationValidatorService;
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
public class EmpVariationReviewSaveDeterminationActionHandlerTest {

    @InjectMocks
    private EmpVariationReviewSaveDeterminationActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private EmpVariationReviewService empVariationReviewService;

    @Mock
    private EmpVariationReviewDeterminationValidatorService determinationValidatorService;

    @Test
    void process() {
        Long requestTaskId = 1L;
        String requestTaskActionType = MrtmRequestTaskActionType.EMP_VARIATION_SAVE_REVIEW_DETERMINATION;
        AppUser appUser = AppUser.builder().build();
        EmpVariationSaveReviewDeterminationRequestTaskActionPayload taskActionPayload =
                EmpVariationSaveReviewDeterminationRequestTaskActionPayload.builder()
                        .determination(EmpVariationDetermination.builder().type(EmpVariationDeterminationType.APPROVED).build())
                        .build();
        EmpVariationApplicationReviewRequestTaskPayload expectedRequestPayload = mock(EmpVariationApplicationReviewRequestTaskPayload.class);

        RequestTask requestTask = RequestTask.builder().id(requestTaskId).payload(expectedRequestPayload).build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);
        when(determinationValidatorService.isValid(expectedRequestPayload, EmpVariationDeterminationType.APPROVED)).thenReturn(true);

        RequestTaskPayload requestTaskPayload1 = handler.process(requestTaskId, requestTaskActionType, appUser, taskActionPayload);

        assertThat(requestTaskPayload1).isEqualTo(expectedRequestPayload);
        verifyNoMoreInteractions(requestTaskPayload1);
        verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
        verify(determinationValidatorService, times(1)).isValid(expectedRequestPayload, EmpVariationDeterminationType.APPROVED);
        verify(empVariationReviewService, times(1)).saveDetermination(taskActionPayload, requestTask);
    }

    @Test
    void process_when_invalid_determination_throw_error() {
        Long requestTaskId = 1L;
        String requestTaskActionType = MrtmRequestTaskActionType.EMP_VARIATION_SAVE_REVIEW_DETERMINATION;
        AppUser appUser = AppUser.builder().build();
        EmpVariationSaveReviewDeterminationRequestTaskActionPayload taskActionPayload =
                EmpVariationSaveReviewDeterminationRequestTaskActionPayload.builder()
                        .determination(EmpVariationDetermination.builder().type(EmpVariationDeterminationType.APPROVED).build())
                        .build();
        EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder().build();

        RequestTask requestTask = RequestTask.builder().id(requestTaskId).payload(requestTaskPayload).build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);
        when(determinationValidatorService.isValid(requestTaskPayload, EmpVariationDeterminationType.APPROVED)).thenReturn(false);

        BusinessException be = assertThrows(BusinessException.class,
                () -> handler.process(requestTaskId, requestTaskActionType, appUser, taskActionPayload));

        assertThat(be.getErrorCode()).isEqualTo(ErrorCode.FORM_VALIDATION);

        verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
        verify(determinationValidatorService, times(1)).isValid(requestTaskPayload, EmpVariationDeterminationType.APPROVED);
        verifyNoInteractions(empVariationReviewService);
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes()).containsExactly(MrtmRequestTaskActionType.EMP_VARIATION_SAVE_REVIEW_DETERMINATION);
    }
}
