package uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceApplicationSubmitRequestTaskPayload;

import static org.assertj.core.api.Assertions.assertThat;

class EmpIssuanceImportThetisXmlEligibilityEvaluatorTest {

    private final EmpIssuanceImportThetisXmlEligibilityEvaluator evaluator =
            new EmpIssuanceImportThetisXmlEligibilityEvaluator();

    @Test
    void isEligible_whenFlagDisabled_thenNotEligible() {
        ReflectionTestUtils.setField(evaluator, "thetisImportEnabled", false);

        assertThat(evaluator.isEligible(EmpIssuanceApplicationSubmitRequestTaskPayload.builder().build())).isFalse();
    }

    @Test
    void isEligible_whenFlagEnabled_thenEligible() {
        ReflectionTestUtils.setField(evaluator, "thetisImportEnabled", true);

        assertThat(evaluator.isEligible(EmpIssuanceApplicationSubmitRequestTaskPayload.builder().build())).isTrue();
    }

    @Test
    void getRequestTaskType() {
        assertThat(evaluator.getRequestTaskType()).isEqualTo(MrtmRequestTaskType.EMP_ISSUANCE_APPLICATION_SUBMIT);
    }

    @Test
    void getRequestTaskActionTypes() {
        assertThat(evaluator.getRequestTaskActionTypes())
                .containsOnly(MrtmRequestTaskActionType.EMP_ISSUANCE_IMPORT_THETIS_XML);
    }
}
