package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceSaveApplicationReviewRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service.RequestEmpReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceReviewSaveActionHandlerTest {

    @InjectMocks
    private EmpIssuanceReviewSaveActionHandler empIssuanceReviewSaveActionHandler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private RequestEmpReviewService requestEmpReviewService;

    @Test
    void process() {
        Long requestTaskId = 1L;
        EmpIssuanceSaveApplicationReviewRequestTaskActionPayload requestTaskActionPayload =
            EmpIssuanceSaveApplicationReviewRequestTaskActionPayload.builder()
                .payloadType(MrtmRequestTaskActionPayloadTypes.EMP_ISSUANCE_SAVE_APPLICATION_REVIEW_PAYLOAD)
                .emissionsMonitoringPlan(EmissionsMonitoringPlan.builder().build())
                .build();

        RequestTaskPayload expectedRequestTaskPayload = mock(RequestTaskPayload.class);
        RequestTask requestTask = RequestTask.builder().id(requestTaskId).payload(expectedRequestTaskPayload).build();
        AppUser appUser = AppUser.builder().build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);

        //invoke
        RequestTaskPayload requestTaskPayload = empIssuanceReviewSaveActionHandler.process(requestTask.getId(),
            MrtmRequestTaskActionType.EMP_ISSUANCE_SAVE_APPLICATION_REVIEW,
            appUser,
            requestTaskActionPayload);

        assertThat(requestTaskPayload).isEqualTo(expectedRequestTaskPayload);
        verifyNoMoreInteractions(expectedRequestTaskPayload);
        verify(requestTaskService).findTaskByIdForUpdate(requestTaskId);
        verify(requestEmpReviewService).applySaveAction(requestTaskActionPayload, requestTask);

        verifyNoMoreInteractions(requestEmpReviewService, requestTaskService);
    }

    @Test
    void getTypes() {
        assertThat(empIssuanceReviewSaveActionHandler.getTypes())
            .containsOnly(MrtmRequestTaskActionType.EMP_ISSUANCE_SAVE_APPLICATION_REVIEW);
    }
}