package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceSaveReviewGroupDecisionRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service.RequestEmpReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionRequiredChange;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceReviewSaveGroupDecisionActionHandlerTest {

    @InjectMocks
    private EmpIssuanceReviewSaveGroupDecisionActionHandler reviewSaveGroupDecisionActionHandler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private RequestEmpReviewService requestEmpReviewService;

    @Test
    void process() {
        Long requestTaskId = 1L;
        EmpIssuanceSaveReviewGroupDecisionRequestTaskActionPayload requestTaskActionPayload =
            EmpIssuanceSaveReviewGroupDecisionRequestTaskActionPayload.builder()
                .payloadType(MrtmRequestTaskActionPayloadTypes.EMP_ISSUANCE_SAVE_REVIEW_GROUP_DECISION_PAYLOAD)
                .reviewGroup(EmpReviewGroup.ABBREVIATIONS_AND_DEFINITIONS)
                .decision(EmpIssuanceReviewDecision.builder()
                    .type(EmpReviewDecisionType.OPERATOR_AMENDS_NEEDED)
                    .details(ChangesRequiredDecisionDetails.builder()
                        .notes("notes")
                        .requiredChanges(List.of(ReviewDecisionRequiredChange.builder().reason("reason").files(Set.of(UUID.randomUUID())).build()))
                        .build())
                    .build())
                .build();

        RequestTaskPayload expectedRequestTaskPayload = mock(RequestTaskPayload.class);
        RequestTask requestTask = RequestTask.builder().id(requestTaskId).payload(expectedRequestTaskPayload).build();
        AppUser appUser = AppUser.builder().build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);

        //invoke
        RequestTaskPayload requestTaskPayload = reviewSaveGroupDecisionActionHandler.process(requestTask.getId(),
            MrtmRequestTaskActionType.EMP_ISSUANCE_SAVE_REVIEW_GROUP_DECISION,
            appUser,
            requestTaskActionPayload);

        assertThat(requestTaskPayload).isEqualTo(expectedRequestTaskPayload);
        verifyNoMoreInteractions(expectedRequestTaskPayload);
        verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTaskId);
        verify(requestEmpReviewService, times(1)).saveReviewGroupDecision(requestTaskActionPayload, requestTask);
        verifyNoMoreInteractions(requestTaskService, requestEmpReviewService);
    }

    @Test
    void getTypes() {
        assertThat(reviewSaveGroupDecisionActionHandler.getTypes())
            .containsOnly(MrtmRequestTaskActionType.EMP_ISSUANCE_SAVE_REVIEW_GROUP_DECISION);
    }
}