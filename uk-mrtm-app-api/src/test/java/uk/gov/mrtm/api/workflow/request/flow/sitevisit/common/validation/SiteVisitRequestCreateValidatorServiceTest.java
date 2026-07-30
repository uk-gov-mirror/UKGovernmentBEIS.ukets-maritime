package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.AccountReportingStatus;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
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
import uk.gov.netz.api.workflow.request.core.domain.RequestType;
import uk.gov.netz.api.workflow.request.core.domain.constants.RequestStatuses;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestCreateValidationResult;

import java.time.Year;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitRequestCreateValidatorServiceTest {

    @InjectMocks
    private SiteVisitRequestCreateValidatorService validatorService;

    @Mock
    private AccountQueryService accountQueryService;
    @Mock
    private RequestCustomRepository requestRepository;
    @Mock
    private AccountReportingStatusRepository accountReportingStatusRepository;

    @Test
    void checkAvailability_is_valid() {
        Long accountId = 1L;
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW);
        RequestCreateValidationResult expected = RequestCreateValidationResult.builder().valid(true)
            .build();
        AccountReportingStatus accountReportingStatus = AccountReportingStatus.builder().status(MrtmAccountReportingStatus.REQUIRED_TO_REPORT).build();

        when(accountQueryService.getAccountStatus(accountId)).thenReturn(MrtmAccountStatus.LIVE);
        when(requestRepository.findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue())).thenReturn(Optional.of(Request.builder().build()));
        when(requestRepository.findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().minusYears(1).getValue())).thenReturn(Optional.empty());
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now())).thenReturn(accountReportingStatus);
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now().minusYears(1))).thenReturn(accountReportingStatus);

        RequestCreateValidationResult actual = validatorService.checkAvailability(accountId, applicableAccountStatuses);

        assertEquals(expected, actual);

        verify(accountQueryService).getAccountStatus(accountId);
        verify(requestRepository).findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue());
        verify(requestRepository).findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().minusYears(1).getValue());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now().minusYears(1));

        verifyNoMoreInteractions(accountQueryService, accountReportingStatusRepository, requestRepository);
    }

    @EnumSource(MrtmAccountReportingStatus.class)
    @ParameterizedTest
    void checkAvailability_is_invalid_status(MrtmAccountReportingStatus status) {
        Long accountId = 1L;
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW);
        RequestCreateValidationResult expected = RequestCreateValidationResult.builder().valid(false)
            .applicableAccountStatuses(Set.of("LIVE", "NEW"))
            .reportedAccountStatus("WITHDRAWN")
            .build();
        AccountReportingStatus otherReportingStatus = AccountReportingStatus.builder().status(status).build();
        AccountReportingStatus requiredToReport = AccountReportingStatus.builder().status(MrtmAccountReportingStatus.REQUIRED_TO_REPORT).build();

        when(accountQueryService.getAccountStatus(accountId)).thenReturn(MrtmAccountStatus.WITHDRAWN);
        when(requestRepository.findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue())).thenReturn(Optional.of(Request.builder().build()));
        when(requestRepository.findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().minusYears(1).getValue())).thenReturn(Optional.empty());
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now())).thenReturn(otherReportingStatus);
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now().minusYears(1))).thenReturn(requiredToReport);

        RequestCreateValidationResult actual = validatorService.checkAvailability(accountId, applicableAccountStatuses);

        assertEquals(expected, actual);

        verify(accountQueryService).getAccountStatus(accountId);
        verify(requestRepository).findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue());
        verify(requestRepository).findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().minusYears(1).getValue());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now().minusYears(1));

        verifyNoMoreInteractions(accountQueryService, accountReportingStatusRepository, requestRepository);
    }

    @Test
    void checkAvailability_is_missing_reporting_status() {
        Long accountId = 1L;
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW);
        RequestCreateValidationResult expected = RequestCreateValidationResult.builder().valid(false)
            .build();

        when(accountQueryService.getAccountStatus(accountId)).thenReturn(MrtmAccountStatus.LIVE);
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now())).thenReturn(null);
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now().minusYears(1))).thenReturn(null);

        RequestCreateValidationResult actual = validatorService.checkAvailability(accountId, applicableAccountStatuses);

        assertEquals(expected, actual);

        verify(accountQueryService).getAccountStatus(accountId);
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now().minusYears(1));
        verifyNoInteractions(requestRepository);

        verifyNoMoreInteractions(accountQueryService, accountReportingStatusRepository);
    }

    @Test
    void checkAvailability_is_invalid_request_types() {
        Long accountId = 1L;
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW);
        RequestCreateValidationResult expected = RequestCreateValidationResult.builder().valid(false)
            .build();
        AccountReportingStatus reportingStatus = AccountReportingStatus.builder().status(MrtmAccountReportingStatus.EXEMPT).build();

        when(accountQueryService.getAccountStatus(accountId)).thenReturn(MrtmAccountStatus.LIVE);
        when(requestRepository.findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue())).thenReturn(Optional.of(Request.builder().type(RequestType.builder().code("SITE_VISIT").build()).build()));
        when(requestRepository.findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().minusYears(1).getValue())).thenReturn(Optional.of(Request.builder().type(RequestType.builder().code("SITE_VISIT").build()).build()));
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now())).thenReturn(reportingStatus);
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now().minusYears(1))).thenReturn(reportingStatus);

        RequestCreateValidationResult actual = validatorService.checkAvailability(accountId, applicableAccountStatuses);

        assertEquals(expected, actual);

        verify(accountQueryService).getAccountStatus(accountId);
        verify(requestRepository).findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue());
        verify(requestRepository).findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().minusYears(1).getValue());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now().minusYears(1));

        verifyNoMoreInteractions(accountQueryService, accountReportingStatusRepository, requestRepository);
    }

    @Test
    void validateCreation_is_invalid_status() {
        Long accountId = 1L;
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW);
        RequestCreateValidationResult expected = RequestCreateValidationResult.builder().valid(false)
            .applicableAccountStatuses(Set.of("LIVE", "NEW"))
            .reportedAccountStatus("WITHDRAWN")
            .build();
        SiteVisitRequestCreateActionPayload payload = SiteVisitRequestCreateActionPayload.builder().year(Year.now()).build();
        AccountReportingStatus reportingStatus = AccountReportingStatus.builder().status(MrtmAccountReportingStatus.REQUIRED_TO_REPORT).build();

        when(accountQueryService.getAccountStatus(accountId)).thenReturn(MrtmAccountStatus.WITHDRAWN);
        when(requestRepository.findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue())).thenReturn(Optional.empty());
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now())).thenReturn(reportingStatus);

        RequestCreateValidationResult actual = validatorService.validateCreation(accountId, applicableAccountStatuses, payload);

        assertEquals(expected, actual);

        verify(accountQueryService).getAccountStatus(accountId);
        verify(requestRepository).findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now());

        verifyNoMoreInteractions(accountQueryService, accountReportingStatusRepository, requestRepository);
    }

    @MethodSource
    @ParameterizedTest
    void validateCreation_is_invalid_year(Year year) {
        Long accountId = 1L;
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW);
        RequestCreateValidationResult expected = RequestCreateValidationResult.builder().valid(false)
            .build();
        SiteVisitRequestCreateActionPayload payload = SiteVisitRequestCreateActionPayload.builder().year(year).build();
        AccountReportingStatus reportingStatus = AccountReportingStatus.builder().status(MrtmAccountReportingStatus.REQUIRED_TO_REPORT).build();

        when(accountQueryService.getAccountStatus(accountId)).thenReturn(MrtmAccountStatus.NEW);
        when(requestRepository.findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            year.getValue())).thenReturn(Optional.empty());
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, year)).thenReturn(reportingStatus);

        RequestCreateValidationResult actual = validatorService.validateCreation(accountId, applicableAccountStatuses, payload);

        assertEquals(expected, actual);

        verify(accountQueryService).getAccountStatus(accountId);
        verify(requestRepository).findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            year.getValue());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, year);

        verifyNoMoreInteractions(accountQueryService, accountReportingStatusRepository, requestRepository);
    }

    private static Stream<Year> validateCreation_is_invalid_year() {
        return Stream.of(
            Year.now().plusYears(1),
            Year.now().minusYears(2)
        );
    }

    @EnumSource(MrtmAccountReportingStatus.class)
    @ParameterizedTest
    void validateCreation_is_invalid_request_exists(MrtmAccountReportingStatus status) {
        Long accountId = 1L;
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW);
        RequestCreateValidationResult expected = RequestCreateValidationResult.builder().valid(false)
            .build();
        SiteVisitRequestCreateActionPayload payload = SiteVisitRequestCreateActionPayload.builder().year(Year.now()).build();
        AccountReportingStatus reportingStatus = AccountReportingStatus.builder().status(status).build();

        when(accountQueryService.getAccountStatus(accountId)).thenReturn(MrtmAccountStatus.LIVE);
        when(requestRepository.findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue())).thenReturn(Optional.of(Request.builder().build()));
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now())).thenReturn(reportingStatus);

        RequestCreateValidationResult actual = validatorService.validateCreation(accountId, applicableAccountStatuses, payload);

        assertEquals(expected, actual);

        verify(accountQueryService).getAccountStatus(accountId);
        verify(requestRepository).findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now());

        verifyNoMoreInteractions(accountQueryService, accountReportingStatusRepository, requestRepository);
    }

    @Test
    void validateCreation_whenReportingStatusMissing_returnsInvalidWithoutNpe() {
        Long accountId = 1L;
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW);
        RequestCreateValidationResult expected = RequestCreateValidationResult.builder().valid(false)
            .build();
        SiteVisitRequestCreateActionPayload payload = SiteVisitRequestCreateActionPayload.builder().year(Year.now()).build();

        when(accountQueryService.getAccountStatus(accountId)).thenReturn(MrtmAccountStatus.LIVE);
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now())).thenReturn(null);

        RequestCreateValidationResult actual = validatorService.validateCreation(accountId, applicableAccountStatuses, payload);

        assertEquals(expected, actual);

        verify(accountQueryService).getAccountStatus(accountId);
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now());
        verifyNoInteractions(requestRepository);

        verifyNoMoreInteractions(accountQueryService, accountReportingStatusRepository);
    }

    @Test
    void validateCreation_is_invalid_reporting_status() {
        Long accountId = 1L;
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW);
        RequestCreateValidationResult expected = RequestCreateValidationResult.builder().valid(false)
            .build();
        SiteVisitRequestCreateActionPayload payload = SiteVisitRequestCreateActionPayload.builder().year(Year.now()).build();
        AccountReportingStatus reportingStatus = AccountReportingStatus.builder().status(MrtmAccountReportingStatus.EXEMPT).build();

        when(accountQueryService.getAccountStatus(accountId)).thenReturn(MrtmAccountStatus.LIVE);
        when(requestRepository.findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue())).thenReturn(Optional.empty());
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now())).thenReturn(reportingStatus);

        RequestCreateValidationResult actual = validatorService.validateCreation(accountId, applicableAccountStatuses, payload);

        assertEquals(expected, actual);

        verify(accountQueryService).getAccountStatus(accountId);
        verify(requestRepository).findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now());

        verifyNoMoreInteractions(accountQueryService, accountReportingStatusRepository, requestRepository);
    }

    @Test
    void validateCreation_is_valid() {
        Long accountId = 1L;
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW);
        RequestCreateValidationResult expected = RequestCreateValidationResult.builder().valid(true)
            .build();
        SiteVisitRequestCreateActionPayload payload = SiteVisitRequestCreateActionPayload.builder().year(Year.now()).build();
        AccountReportingStatus reportingStatus = AccountReportingStatus.builder().status(MrtmAccountReportingStatus.REQUIRED_TO_REPORT).build();

        when(accountQueryService.getAccountStatus(accountId)).thenReturn(MrtmAccountStatus.LIVE);
        when(requestRepository.findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue())).thenReturn(Optional.empty());
        when(accountReportingStatusRepository.findByAccountIdAndYear(accountId, Year.now())).thenReturn(reportingStatus);

        RequestCreateValidationResult actual = validatorService.validateCreation(accountId, applicableAccountStatuses, payload);

        assertEquals(expected, actual);

        verify(accountQueryService).getAccountStatus(accountId);
        verify(requestRepository).findByRequestTypeAndResourceAndStatusAndYear(MrtmRequestType.SITE_VISIT, ResourceType.ACCOUNT,
            accountId.toString(), Set.of(RequestStatuses.IN_PROGRESS, SiteVisitDeterminationType.APPROVED.name()),
            Year.now().getValue());
        verify(accountReportingStatusRepository).findByAccountIdAndYear(accountId, Year.now());

        verifyNoMoreInteractions(accountQueryService, accountReportingStatusRepository, requestRepository);
    }
}