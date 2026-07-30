package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRequestTaskPayload;

import static org.assertj.core.api.Assertions.assertThat;

class EmpVariationImportThetisXmlEligibilityEvaluatorTest {

    private final EmpVariationImportThetisXmlEligibilityEvaluator evaluator =
            new EmpVariationImportThetisXmlEligibilityEvaluator();

    @Test
    void isEligible_whenFlagDisabled_thenNotEligible() {
        ReflectionTestUtils.setField(evaluator, "thetisImportEnabled", false);

        assertThat(evaluator.isEligible(EmpVariationApplicationSubmitRequestTaskPayload.builder().build())).isFalse();
    }

    @Test
    void isEligible_whenFlagEnabled_thenEligible() {
        ReflectionTestUtils.setField(evaluator, "thetisImportEnabled", true);

        assertThat(evaluator.isEligible(EmpVariationApplicationSubmitRequestTaskPayload.builder().build())).isTrue();
    }

    @Test
    void getRequestTaskType() {
        assertThat(evaluator.getRequestTaskType()).isEqualTo(MrtmRequestTaskType.EMP_VARIATION_APPLICATION_SUBMIT);
    }

    @Test
    void getRequestTaskActionTypes() {
        assertThat(evaluator.getRequestTaskActionTypes())
                .containsOnly(MrtmRequestTaskActionType.EMP_VARIATION_IMPORT_THETIS_XML);
    }
}
