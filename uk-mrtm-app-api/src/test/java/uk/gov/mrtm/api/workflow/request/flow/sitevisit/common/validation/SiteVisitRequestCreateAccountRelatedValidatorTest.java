package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestCreateActionPayload;
import uk.gov.netz.api.account.domain.enumeration.AccountStatus;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestCreateValidationResult;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestCreateValidatorService;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitRequestCreateAccountRelatedValidatorTest {

    @InjectMocks
    private SiteVisitRequestCreateAccountRelatedValidator validator;

    @Mock
    private RequestCreateValidatorService requestCreateValidatorService;

    @Mock
    private SiteVisitRequestCreateValidatorService siteVisitRequestCreateValidatorService;

    @Test
    void checkAvailability() {
        final Long accountId = 1L;

        RequestCreateValidationResult result = RequestCreateValidationResult.builder().valid(true).build();
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW, MrtmAccountStatus.WITHDRAWN);

        when(siteVisitRequestCreateValidatorService.checkAvailability(accountId, applicableAccountStatuses))
            .thenReturn(result);

        // Invoke
        final RequestCreateValidationResult actual = validator.checkAvailability(accountId);

        // Verify
        assertThat(actual.isValid()).isTrue();
        assertThat(actual.getReportedRequestTypes()).isEmpty();
        assertThat(actual.getReportedAccountStatus()).isNull();

        verify(siteVisitRequestCreateValidatorService, times(1)).checkAvailability(accountId, applicableAccountStatuses);
        verifyNoMoreInteractions(siteVisitRequestCreateValidatorService);
        verifyNoInteractions(requestCreateValidatorService);
    }

    @Test
    void validateCreation() {
        final Long accountId = 1L;

        RequestCreateValidationResult result = RequestCreateValidationResult.builder().valid(true).build();
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW, MrtmAccountStatus.WITHDRAWN);
        SiteVisitRequestCreateActionPayload payload = mock(SiteVisitRequestCreateActionPayload.class);

        when(siteVisitRequestCreateValidatorService.validateCreation(accountId, applicableAccountStatuses, payload))
            .thenReturn(result);

        // Invoke
        final RequestCreateValidationResult actual = validator.validateCreation(accountId, payload);

        // Verify
        assertThat(actual.isValid()).isTrue();
        assertThat(actual.getReportedRequestTypes()).isEmpty();
        assertThat(actual.getReportedAccountStatus()).isNull();

        verify(siteVisitRequestCreateValidatorService, times(1)).validateCreation(accountId, applicableAccountStatuses, payload);
        verifyNoMoreInteractions(siteVisitRequestCreateValidatorService);
        verifyNoInteractions(requestCreateValidatorService);
    }

    @Test
    void getApplicableAccountStatuses() {
        Set<AccountStatus> accountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW, MrtmAccountStatus.WITHDRAWN);

        assertThat(validator.getApplicableAccountStatuses()).isEqualTo(accountStatuses);
    }

    @Test
    void getMutuallyExclusiveRequests() {
        Set<String> mutuallyExclusiveRequests = Set.of();

        assertThat(validator.getMutuallyExclusiveRequests()).isEqualTo(mutuallyExclusiveRequests);
    }

    @Test
    void getRequestType() {
        assertThat(validator.getRequestType()).isEqualTo(MrtmRequestType.SITE_VISIT);
    }
}
