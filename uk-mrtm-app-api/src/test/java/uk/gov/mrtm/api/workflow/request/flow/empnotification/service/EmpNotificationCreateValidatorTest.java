package uk.gov.mrtm.api.workflow.request.flow.empnotification.service;

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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpNotificationCreateValidatorTest {

    @InjectMocks
    private EmpNotificationCreateValidator validator;

    @Mock
    private RequestCreateValidatorService requestCreateValidatorService;

    @Test
    void checkAvailability() {
        Long accountId = 1L;
        RequestCreateValidationResult result = RequestCreateValidationResult.builder().valid(true).build();
        Set<AccountStatus> applicableAccountStatuses = Set.of(MrtmAccountStatus.LIVE);

        when(requestCreateValidatorService.validate(accountId, applicableAccountStatuses, Set.of()))
                .thenReturn(result);

        // Invoke
        RequestCreateValidationResult actual = validator.checkAvailability(accountId);

        // Verify
        assertThat(actual.isValid()).isTrue();
        assertThat(actual.getReportedRequestTypes()).isEmpty();
        assertThat(actual.getReportedAccountStatus()).isNull();

        verify(requestCreateValidatorService, times(1))
                .validate(accountId, applicableAccountStatuses, Set.of());
    }

    @Test
    void getApplicableAccountStatuses() {
        Set<AccountStatus> accountStatuses = Set.of(MrtmAccountStatus.LIVE);

        assertThat(validator.getApplicableAccountStatuses()).isEqualTo(accountStatuses);
    }

    @Test
    void getMutuallyExclusiveRequests() {
        assertThat(validator.getMutuallyExclusiveRequests()).isEqualTo(Set.of());
    }

    @Test
    void type() {
        assertEquals(MrtmRequestType.EMP_NOTIFICATION, validator.getRequestType());
    }
}
