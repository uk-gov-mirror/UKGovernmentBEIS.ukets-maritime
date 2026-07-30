package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;


import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.abbreviations.EmpAbbreviations;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveApplicationRegulatorLedRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationSubmitRegulatorLedService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EmpVariationSaveRegulatorLedActionHandlerTest {

    @InjectMocks
    private EmpVariationSaveRegulatorLedActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private EmpVariationSubmitRegulatorLedService empVariationSubmitRegulatorLedService;

    @Test
    void process() {
        Long requestTaskId = 1L;
        String requestTaskActionType = MrtmRequestTaskActionType.EMP_VARIATION_SAVE_APPLICATION_REGULATOR_LED;
        AppUser appUser = AppUser.builder().build();
        RequestTaskPayload expectedRequestTaskPayload = mock(RequestTaskPayload.class);
        EmpVariationSaveApplicationRegulatorLedRequestTaskActionPayload payload = EmpVariationSaveApplicationRegulatorLedRequestTaskActionPayload.builder()
                .emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
                        .abbreviations(EmpAbbreviations.builder()
                                .exist(true)
                                .build())
                        .build())
                .empSectionsCompleted(Map.of("ABBREV", "false"))
                .build();
        RequestTask requestTask = RequestTask.builder().id(requestTaskId).payload(expectedRequestTaskPayload).build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);

        RequestTaskPayload requestTaskPayload = handler.process(requestTaskId, requestTaskActionType, appUser, payload);

        assertThat(requestTaskPayload).isEqualTo(expectedRequestTaskPayload);
        verifyNoMoreInteractions(expectedRequestTaskPayload);
        verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
        verify(empVariationSubmitRegulatorLedService, times(1)).saveEmpVariation(payload, requestTask);
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes()).containsExactly(MrtmRequestTaskActionType.EMP_VARIATION_SAVE_APPLICATION_REGULATOR_LED);
    }
}
