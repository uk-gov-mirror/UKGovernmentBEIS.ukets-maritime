package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.AccountReportingStatus;
import uk.gov.mrtm.api.account.enumeration.MrtmAccountReportingStatus;
import uk.gov.mrtm.api.account.repository.AccountReportingStatusRepository;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.core.repository.RequestCustomRepository;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestCreateActionPayload;
import uk.gov.netz.api.account.domain.enumeration.AccountStatus;
import uk.gov.netz.api.account.service.AccountQueryService;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.constants.RequestStatuses;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestCreateAccountStatusValidationResult;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestCreateRequestTypeValidationResult;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestCreateValidationResult;

import java.time.Year;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteVisitRequestCreateValidatorService {

    private final AccountQueryService accountQueryService;
    private final RequestCustomRepository requestRepository;
    private final AccountReportingStatusRepository accountReportingStatusRepository;

    public RequestCreateValidationResult checkAvailability(final Long accountId,
                                                           Set<AccountStatus> applicableAccountStatuses) {
        final RequestCreateValidationResult validationResult = RequestCreateValidationResult.builder().valid(true)
                .build();

        final RequestCreateAccountStatusValidationResult validationAccountStatusesResult = validateAccountStatuses(
                accountId, applicableAccountStatuses);
        if (!validationAccountStatusesResult.isValid()) {
            final Set<String> applicableAccountStatusSet = applicableAccountStatuses.stream()
                    .map(AccountStatus::getName)
                    .collect(Collectors.toSet());
            validationResult.setValid(false);
            validationResult.setApplicableAccountStatuses(applicableAccountStatusSet);
            validationResult.setReportedAccountStatus(validationAccountStatusesResult.getReportedAccountStatus());
        }

        final RequestCreateRequestTypeValidationResult validationConflictingRequestsTypesResult = validateConflictingRequestTypes(
                accountId);
        if (!validationConflictingRequestsTypesResult.isValid()) {
            validationResult.setValid(false);
        }

        return validationResult;
    }

    public RequestCreateValidationResult validateCreation(Long accountId, Set<AccountStatus> applicableAccountStatuses,
                                                          SiteVisitRequestCreateActionPayload payload) {
        final RequestCreateValidationResult validationResult = RequestCreateValidationResult.builder().valid(true)
            .build();

        final RequestCreateAccountStatusValidationResult validationAccountStatusesResult = validateAccountStatuses(
            accountId, applicableAccountStatuses);
        if (!validationAccountStatusesResult.isValid()) {
            final Set<String> applicableAccountStatusSet = applicableAccountStatuses.stream()
                .map(AccountStatus::getName)
                .collect(Collectors.toSet());
            validationResult.setValid(false);
            validationResult.setApplicableAccountStatuses(applicableAccountStatusSet);
            validationResult.setReportedAccountStatus(validationAccountStatusesResult.getReportedAccountStatus());
        }

        final RequestCreateRequestTypeValidationResult validationYearResult = validateYear(payload.getYear());
        if (!validationYearResult.isValid()) {
            validationResult.setValid(false);
        }

        final RequestCreateRequestTypeValidationResult validationExistingRequestResult = validateConflictingRequestTypesByYear(
            accountId, payload.getYear());
        if (!validationExistingRequestResult.isValid()) {
            validationResult.setValid(false);
        }

        return validationResult;
    }

    private RequestCreateAccountStatusValidationResult validateAccountStatuses(final Long accountId,
                                                                              Set<AccountStatus> applicableAccountStatuses) {

        final AccountStatus accountStatus = accountQueryService.getAccountStatus(accountId);

        final boolean validAccountStatus = applicableAccountStatuses.isEmpty()
                || applicableAccountStatuses.contains(accountStatus);

        final RequestCreateAccountStatusValidationResult validationResult = !validAccountStatus
                ? new RequestCreateAccountStatusValidationResult(false, accountStatus)
                : new RequestCreateAccountStatusValidationResult(true);

        return validationResult;
    }

    private RequestCreateRequestTypeValidationResult validateConflictingRequestTypes(final Long accountId) {
        final RequestCreateRequestTypeValidationResult validationResult = RequestCreateRequestTypeValidationResult.builder().valid(true)
                .build();

        final Year currentYear = Year.now();
        final Year lastYear = currentYear.minusYears(1);

        boolean isEligibleForCurrentYear = isAvailableByYear(accountId, currentYear);
        boolean isEligibleForLastYear = isAvailableByYear(accountId, lastYear);

        if (!isEligibleForCurrentYear && !isEligibleForLastYear) {
            validationResult.setValid(false);
        }

        return validationResult;
    }

    private RequestCreateRequestTypeValidationResult validateConflictingRequestTypesByYear(final Long accountId,
                                                                                           Year year) {
        final RequestCreateRequestTypeValidationResult validationResult = RequestCreateRequestTypeValidationResult.builder().valid(true)
            .build();

        boolean isEligible = isAvailableByYear(accountId, year);

        if (!isEligible) {
            validationResult.setValid(false);
        }

        return validationResult;
    }

    private RequestCreateRequestTypeValidationResult validateYear(Year year) {
        final RequestCreateRequestTypeValidationResult validationResult = RequestCreateRequestTypeValidationResult.builder().valid(true)
            .build();

        if (!year.equals(Year.now()) && !year.equals(Year.now().minusYears(1))) {
            validationResult.setValid(false);
        }

        return validationResult;
    }

    private boolean isAvailableByYear(Long accountId, Year year) {
        AccountReportingStatus accountReportingStatus = accountReportingStatusRepository.findByAccountIdAndYear(accountId, year);
        if (accountReportingStatus == null) {
            return false;
        }

        Optional<Request> request = requestRepository.findByRequestTypeAndResourceAndStatusAndYear(
            MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(),
            Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            year.getValue());

        return request.isEmpty() && accountReportingStatus.getStatus() == MrtmAccountReportingStatus.REQUIRED_TO_REPORT;
    }
}
