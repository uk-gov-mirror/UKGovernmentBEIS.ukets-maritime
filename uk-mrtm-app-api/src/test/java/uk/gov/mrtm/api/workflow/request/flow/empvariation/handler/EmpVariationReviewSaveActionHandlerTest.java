package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveApplicationReviewRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpVariationReviewSaveActionHandlerTest {

    @InjectMocks
    private EmpVariationReviewSaveActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private EmpVariationReviewService empVariationReviewService;

    @Test
    void getTypes() {
        assertThat(handler.getTypes()).containsExactly(MrtmRequestTaskActionType.EMP_VARIATION_SAVE_APPLICATION_REVIEW);
    }

    @Test
    void process() {
        Long requestTaskId = 1L;
        String requestTaskActionType = MrtmRequestTaskActionType.EMP_VARIATION_SAVE_APPLICATION_REVIEW;
        AppUser appUser = AppUser.builder().build();
        RequestTaskPayload expectedRequestTaskPayload = mock(RequestTaskPayload.class);
        EmpVariationSaveApplicationReviewRequestTaskActionPayload payload = EmpVariationSaveApplicationReviewRequestTaskActionPayload
                .builder().build();

        RequestTask requestTask = RequestTask.builder().id(1L).payload(expectedRequestTaskPayload).build();
        when(requestTaskService.findTaskByIdForUpdate(1L)).thenReturn(requestTask);

        RequestTaskPayload requestTaskPayload = handler.process(requestTaskId, requestTaskActionType, appUser, payload);

        assertThat(requestTaskPayload).isEqualTo(expectedRequestTaskPayload);
        verifyNoMoreInteractions(expectedRequestTaskPayload);
        verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTask.getId());
        verify(empVariationReviewService, times(1)).saveEmpVariation(payload, requestTask);
        verifyNoMoreInteractions(requestTaskService,empVariationReviewService);
    }

}
