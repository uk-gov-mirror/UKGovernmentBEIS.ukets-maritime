package uk.gov.mrtm.api.account.search.domain.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class MrtmAccountSearchCriteriaValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void sortBy_null_isValid() {
        assertThat(violations(MrtmAccountSearchCriteria.builder().sortBy(null).build())).isEmpty();
    }

    @Test
    void sortBy_blank_isValid() {
        assertThat(violations(MrtmAccountSearchCriteria.builder().sortBy("").build())).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"OPERATOR_NAME  ", "  ACCOUNT_ID  ", "  STATUS ", " IMO_NUMBER"})
    void sortBy_validValuesWithSurroundingWhitespace_areValid(String sortBy) {
        Set<ConstraintViolation<MrtmAccountSearchCriteria>> violations =
            violations(MrtmAccountSearchCriteria.builder().sortBy(sortBy).build());

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
            .isEqualTo("sortBy must be one of OPERATOR_NAME, ACCOUNT_ID, STATUS, IMO_NUMBER");
    }

    @Test
    void sortBy_invalidValue_isRejected() {
        Set<ConstraintViolation<MrtmAccountSearchCriteria>> violations =
                violations(MrtmAccountSearchCriteria.builder().sortBy("UNKNOWN").build());

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
                .isEqualTo("sortBy must be one of OPERATOR_NAME, ACCOUNT_ID, STATUS, IMO_NUMBER");
    }

    private Set<ConstraintViolation<MrtmAccountSearchCriteria>> violations(MrtmAccountSearchCriteria criteria) {
        return validator.validate(criteria);
    }
}
