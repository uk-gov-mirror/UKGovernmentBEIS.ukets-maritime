package uk.gov.mrtm.api.emissionsmonitoringplan.domain.datagaps;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

class EmpDataGapsTest {

    private Validator validator;

    @BeforeEach
    void setup() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    void when_data_gaps_are_all_null_then_invalid() {
        final EmpDataGaps empDataGaps = EmpDataGaps.builder().build();

        final Set<ConstraintViolation<EmpDataGaps>> violations = validator.validate(empDataGaps);

        assertEquals(4, violations.size());
        assertThat(violations).allMatch(violation -> "must not be blank".equals(violation.getMessage()));
    }

    @Test
    void when_data_gaps_correct_then_valid() {

         EmpDataGaps empDataGaps = createDataGaps("Some formulae used","Some responsible person or position");
        final Set<ConstraintViolation<EmpDataGaps>> violations = validator.validate(empDataGaps);

        assertEquals(0, violations.size());
    }

    @Test
    void when_data_gaps_with_responsible_person_more_than_250_chars_then_invalid() {

        String responsiblePersonOrPosition = RandomStringUtils.secure().next(251);
        EmpDataGaps empDataGaps = createDataGaps("Some formulae used", responsiblePersonOrPosition);
        final Set<ConstraintViolation<EmpDataGaps>> violations = validator.validate(empDataGaps);

        assertEquals(1, violations.size());
        assertThat(violations).allMatch(violation -> "size must be between 0 and 250".equals(violation.getMessage()));
    }

    @Test
    void when_data_gaps_with_formulae_used_more_than_1000_chars_then_invalid() {

        String formulaeUsed = RandomStringUtils.secure().next(10001);
        EmpDataGaps empDataGaps = createDataGaps(formulaeUsed, "Some Responsible person or position");
        final Set<ConstraintViolation<EmpDataGaps>> violations = validator.validate(empDataGaps);

        assertEquals(1, violations.size());
        assertThat(violations).allMatch(violation -> "size must be between 0 and 10000".equals(violation.getMessage()));
    }

    private EmpDataGaps createDataGaps(String formulaeUsed, String responsiblePersonOrPosition) {
        return EmpDataGaps.builder()
                .formulaeUsed(formulaeUsed)
                .fuelConsumptionEstimationMethod("Some fuel consumption method")
                .responsiblePersonOrPosition(responsiblePersonOrPosition)
                .dataSources("Some Data Sources")
                .recordsLocation("Some Records location")
                .itSystemUsed("Some IT System used")
                .build();
    }
}
