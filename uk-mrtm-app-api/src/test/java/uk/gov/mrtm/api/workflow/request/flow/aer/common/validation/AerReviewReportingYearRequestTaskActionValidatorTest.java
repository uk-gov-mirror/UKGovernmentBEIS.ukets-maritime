package uk.gov.mrtm.api.workflow.request.flow.aer.common.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import uk.gov.mrtm.api.common.exception.MrtmRequestTaskActionValidationErrorCodes;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.aer.submit.domain.AerApplicationSubmitRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskActionValidationResult;

import java.time.Year;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class AerReviewReportingYearRequestTaskActionValidatorTest {

    @InjectMocks
    private AerReviewReportingYearRequestTaskActionValidator validator;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(validator, "aerCurrentYearSubmitEnabled", false);
    }

    @Test
    void validate_is_invalid() {
        RequestTask requestTask = RequestTask.builder()
            .payload(AerApplicationSubmitRequestTaskPayload.builder()
                .reportingYear(Year.now().plusYears(1))
                .build())
            .build();

        RequestTaskActionValidationResult result = validator.validate(requestTask);

        assertThat(result).isEqualTo(RequestTaskActionValidationResult.invalidResult(
            MrtmRequestTaskActionValidationErrorCodes.AER_SUBMIT_NOT_ALLOWED_INVALID_REPORTING_YEAR));
    }

    @Test
    void validate_is_valid() {
        RequestTask requestTask = RequestTask.builder()
            .payload(AerApplicationSubmitRequestTaskPayload.builder()
                .reportingYear(Year.now().minusYears(1))
                .build())
            .build();

        RequestTaskActionValidationResult result = validator.validate(requestTask);

        assertThat(result).isEqualTo(RequestTaskActionValidationResult.validResult());
    }

    @Test
    void validate_current_year_is_invalid_when_flag_disabled() {
        RequestTask requestTask = RequestTask.builder()
            .payload(AerApplicationSubmitRequestTaskPayload.builder()
                .reportingYear(Year.now())
                .build())
            .build();

        RequestTaskActionValidationResult result = validator.validate(requestTask);

        assertThat(result).isEqualTo(RequestTaskActionValidationResult.invalidResult(
            MrtmRequestTaskActionValidationErrorCodes.AER_SUBMIT_NOT_ALLOWED_INVALID_REPORTING_YEAR));
    }

    @Test
    void validate_current_year_is_valid_when_flag_enabled() {
        ReflectionTestUtils.setField(validator, "aerCurrentYearSubmitEnabled", true);

        RequestTask requestTask = RequestTask.builder()
            .payload(AerApplicationSubmitRequestTaskPayload.builder()
                .reportingYear(Year.now())
                .build())
            .build();

        RequestTaskActionValidationResult result = validator.validate(requestTask);

        assertThat(result).isEqualTo(RequestTaskActionValidationResult.validResult());
    }

    @Test
    void validate_skips_year_check_when_flag_enabled() {
        ReflectionTestUtils.setField(validator, "aerCurrentYearSubmitEnabled", true);

        RequestTask requestTask = RequestTask.builder()
            .payload(AerApplicationSubmitRequestTaskPayload.builder()
                .reportingYear(Year.now().plusYears(1))
                .build())
            .build();

        RequestTaskActionValidationResult result = validator.validate(requestTask);

        assertThat(result).isEqualTo(RequestTaskActionValidationResult.validResult());
    }

    @Test
    void getTypes() {
        assertThat(validator.getTypes()).isEqualTo(Set.of(
            MrtmRequestTaskActionType.AER_SUBMIT_APPLICATION,
            MrtmRequestTaskActionType.AER_SUBMIT_APPLICATION_AMEND
        ));
    }

    @Test
    void getConflictingRequestTaskTypes() {
        assertThat(validator.getConflictingRequestTaskTypes()).isEqualTo(Set.of());
    }

    @Test
    void getErrorCode() {
        assertThat(validator.getErrorCode()).isEqualTo(
            MrtmRequestTaskActionValidationErrorCodes.AER_SUBMIT_NOT_ALLOWED_INVALID_REPORTING_YEAR);
    }
}