package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceReviewSendAccountOpeningEvaluatorTest {

    @InjectMocks
    private EmpIssuanceReviewSendAccountOpeningEvaluator evaluator;

    @Test
    void isFiltered() {
        final boolean actual = evaluator.isEligible(EmpIssuanceApplicationReviewRequestTaskPayload.builder()
                .accountOpeningEventSentToRegistry(true)
                .build());
        assertFalse(actual);
    }

    @Test
    void getRequestTaskType() {
        assertEquals(MrtmRequestTaskType.EMP_ISSUANCE_APPLICATION_REVIEW, evaluator.getRequestTaskType());
    }

    @Test
    void getRequestTaskActionTypes() {
        assertThat(evaluator.getRequestTaskActionTypes()).containsExactly(MrtmRequestTaskActionType.EMP_ISSUANCE_SEND_REGISTRY_ACCOUNT_OPENING_EVENT);
    }
}
