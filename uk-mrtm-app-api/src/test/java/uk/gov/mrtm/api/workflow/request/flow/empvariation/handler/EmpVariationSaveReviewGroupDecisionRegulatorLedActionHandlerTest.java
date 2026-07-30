package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;


import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpAcceptedVariationDecisionDetails;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveReviewGroupDecisionRegulatorLedRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationSubmitRegulatorLedService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EmpVariationSaveReviewGroupDecisionRegulatorLedActionHandlerTest {

    @InjectMocks
    private EmpVariationSaveReviewGroupDecisionRegulatorLedActionHandler handler;

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
        EmpVariationSaveReviewGroupDecisionRegulatorLedRequestTaskActionPayload expectedRequestPayload = EmpVariationSaveReviewGroupDecisionRegulatorLedRequestTaskActionPayload.builder()
                .group(EmpReviewGroup.ABBREVIATIONS_AND_DEFINITIONS)
                .decision(EmpAcceptedVariationDecisionDetails.builder()
                        .notes("notes")
                        .variationScheduleItems(List.of("var1", "var2"))
                        .build())
                .build();
        RequestTask requestTask = RequestTask.builder().id(requestTaskId).payload(expectedRequestTaskPayload).build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);

        RequestTaskPayload requestTaskPayload = handler.process(requestTaskId, requestTaskActionType, appUser, expectedRequestPayload);

        assertThat(requestTaskPayload).isEqualTo(expectedRequestTaskPayload);
        verifyNoMoreInteractions(expectedRequestTaskPayload);
        verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
        verify(empVariationSubmitRegulatorLedService, times(1)).saveReviewGroupDecision(expectedRequestPayload, requestTask);
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes()).containsExactly(MrtmRequestTaskActionType.EMP_VARIATION_SAVE_REVIEW_GROUP_DECISION_REGULATOR_LED);
    }
}
