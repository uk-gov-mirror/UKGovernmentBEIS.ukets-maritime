package uk.gov.mrtm.api.workflow.request.flow.accountclosure.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.netz.api.account.domain.enumeration.AccountStatus;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestCreateValidationResult;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestCreateValidatorService;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountClosureCreateValidatorTest {

	@InjectMocks
    private AccountClosureCreateValidator validator;
    
    @Mock
    private RequestCreateValidatorService requestCreateValidatorService;
    
    @Test
    void checkAvailability_whenValid_thenOk() {
    	final Long accountId = 1L;

        RequestCreateValidationResult result = RequestCreateValidationResult.builder().valid(true).build();
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW, MrtmAccountStatus.WITHDRAWN);
        Set<String> mutuallyExclusiveRequests = Set.of(MrtmRequestType.ACCOUNT_CLOSURE);

        when(requestCreateValidatorService.validate(accountId, applicableAccountStatuses, mutuallyExclusiveRequests))
                .thenReturn(result);

        // Invoke
        final RequestCreateValidationResult actual = validator.checkAvailability(accountId);

        // Verify
        assertThat(actual.isValid()).isTrue();
        assertThat(actual.getReportedRequestTypes()).isEmpty();
        assertThat(actual.getReportedAccountStatus()).isNull();

        verify(requestCreateValidatorService, times(1))
                .validate(accountId, applicableAccountStatuses, mutuallyExclusiveRequests);
    }
    
    @Test
    void getApplicableAccountStatuses() {
        Set<AccountStatus> accountStatuses = Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW, MrtmAccountStatus.WITHDRAWN);

        assertThat(validator.getApplicableAccountStatuses()).isEqualTo(accountStatuses);
    }

    @Test
    void getMutuallyExclusiveRequests() {
        Set<String> mutuallyExclusiveRequests = Set.of(MrtmRequestType.ACCOUNT_CLOSURE);

        assertThat(validator.getMutuallyExclusiveRequests()).isEqualTo(mutuallyExclusiveRequests);
    }

    @Test
    void getRequestType() {
        assertThat(validator.getRequestType()).isEqualTo(MrtmRequestType.ACCOUNT_CLOSURE);
    }
}
