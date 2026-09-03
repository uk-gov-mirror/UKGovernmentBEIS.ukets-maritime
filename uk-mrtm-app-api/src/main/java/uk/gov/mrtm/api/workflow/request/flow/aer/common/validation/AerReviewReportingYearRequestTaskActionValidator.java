package uk.gov.mrtm.api.workflow.request.flow.aer.common.validation;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.common.exception.MrtmRequestTaskActionValidationErrorCodes;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.aer.submit.domain.AerApplicationSubmitRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskActionValidationResult;
import uk.gov.netz.api.workflow.request.core.validation.RequestTaskActionConflictBasedAbstractValidator;

import java.time.Year;
import java.util.Set;

@Service
public class AerReviewReportingYearRequestTaskActionValidator extends RequestTaskActionConflictBasedAbstractValidator {

    @Value("${feature-flag.aer.current.year.submission.enabled}")
    private boolean aerCurrentYearSubmitEnabled;

    @Override
    protected String getErrorCode() {
        return MrtmRequestTaskActionValidationErrorCodes.AER_SUBMIT_NOT_ALLOWED_INVALID_REPORTING_YEAR;
    }

    @Override
    public Set<String> getTypes() {
        return Set.of(
            MrtmRequestTaskActionType.AER_SUBMIT_APPLICATION,
            MrtmRequestTaskActionType.AER_SUBMIT_APPLICATION_AMEND
        );
    }

    @Override
    public Set<String> getConflictingRequestTaskTypes() {
        return Set.of();
    }

    @Override
    public RequestTaskActionValidationResult validate(final RequestTask requestTask) {
        if (aerCurrentYearSubmitEnabled) {
            return RequestTaskActionValidationResult.validResult();
        }

        boolean validYear = ((AerApplicationSubmitRequestTaskPayload) requestTask.getPayload()).getReportingYear()
            .isBefore(Year.now());

        if (!validYear) {
            return RequestTaskActionValidationResult.invalidResult(this.getErrorCode());
        }

        return RequestTaskActionValidationResult.validResult();
    }
}
