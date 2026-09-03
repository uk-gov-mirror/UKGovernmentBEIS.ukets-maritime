package uk.gov.mrtm.api.account.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import uk.gov.mrtm.api.account.domain.AccountUpdatedRegistryEvent;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.account.domain.MrtmAccountReportingYearsUpdatedEvent;
import uk.gov.mrtm.api.account.domain.dto.MrtmAccountUpdateDTO;
import uk.gov.mrtm.api.account.enumeration.AccountSearchKey;
import uk.gov.mrtm.api.account.repository.MrtmAccountRepository;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.account.transform.MrtmAccountMapper;
import uk.gov.mrtm.api.account.transform.RegisteredAddressStateMapper;
import uk.gov.mrtm.api.common.domain.AddressState;
import uk.gov.mrtm.api.common.domain.RegisteredAddressState;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;
import uk.gov.mrtm.api.common.exception.MrtmErrorCode;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.integration.registry.accountupdated.request.MaritimeAccountUpdatedEventListenerResolver;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationAccountDraftData;
import uk.gov.netz.api.account.service.AccountSearchAdditionalKeywordService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.exception.BusinessException;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MrtmAccountUpdateServiceTest {
    private static final Long ACCOUNT_ID = 1L;

    @InjectMocks
    private MrtmAccountUpdateService mrtmAccountUpdateService;

    @Mock
    private MrtmAccountQueryService mrtmAccountQueryService;

    @Mock
    private MrtmAccountMapper mrtmAccountMapper;

    @Mock
    private RegisteredAddressStateMapper registeredAddressStateMapper;

    @Mock
    private AddressStateMapper addressStateMapper;

    @Mock
    private MrtmAccountRepository mrtmAccountRepository;

    @Mock
    private AccountSearchAdditionalKeywordService accountSearchAdditionalKeywordService;

    @Mock
    private  ApplicationEventPublisher publisher;

    @Mock
    private EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;

    @Mock
    private MaritimeAccountUpdatedEventListenerResolver accountUpdatedRegistryListener;

    @Mock
    private AccountDetailsHistoryQueryService accountDetailsHistoryQueryService;

    @Captor
    ArgumentCaptor<LocalDateTime> dateTimeArgumentCaptor;

    @ParameterizedTest
    @MethodSource("createRemainingReportingYearsScenarios")
    void updateMaritimeAccount_publish_account_updated_event(LocalDate currentFirstMaritimeActivity,
                                                             LocalDate newFirstMaritimeActivity,
                                                             List<Year> expectedYears,
                                                             int accountUpdateInvocations) throws IllegalAccessException, NoSuchFieldException {
        String name = "name";
        AppUser appUser = AppUser.builder().userId("userId").build();
        AddressState address = AddressState.builder().line1("line1").city("city").country("GB").build();
        AddressStateDTO addressDTO = AddressStateDTO.builder().line1("line1").city("city").country("GB").build();

        MrtmAccountUpdateDTO mrtmAccountUpdateDTO = mock(MrtmAccountUpdateDTO.class);
        MrtmAccount mrtmAccount = mock(MrtmAccount.class);
        EmissionsMonitoringPlan emissionsMonitoringPlan = mock(EmissionsMonitoringPlan.class);

        Field field = MrtmAccountUpdateService.class.getDeclaredField("aerEnabled");
        field.setAccessible(true);
        field.set(mrtmAccountUpdateService, true);

        when(mrtmAccountUpdateDTO.getName()).thenReturn(name);
        when(mrtmAccountQueryService.getAccountById(ACCOUNT_ID)).thenReturn(mrtmAccount);
        when(mrtmAccount.getName()).thenReturn(name);
        when(mrtmAccount.getSopId()).thenReturn(1L);
        when(mrtmAccount.getAddress()).thenReturn(address);
        when(mrtmAccount.getRegisteredAddress()).thenReturn(null);
        when(mrtmAccount.getRegistryId()).thenReturn(null);
        when(mrtmAccount.getFirstMaritimeActivityDate()).thenReturn(currentFirstMaritimeActivity);
        when(mrtmAccountUpdateDTO.getFirstMaritimeActivityDate()).thenReturn(newFirstMaritimeActivity);
        when(addressStateMapper.toAddressStateDTO(address)).thenReturn(addressDTO);
        when(registeredAddressStateMapper.toAddressStateDTO(null)).thenReturn(null);
        lenient().when(emissionsMonitoringPlanQueryService.getLastestEmissionsMonitoringPlan(ACCOUNT_ID))
            .thenReturn(emissionsMonitoringPlan);

        mrtmAccountUpdateService.updateMaritimeAccount(ACCOUNT_ID, mrtmAccountUpdateDTO, appUser);

        verify(mrtmAccountQueryService).getAccountById(ACCOUNT_ID);
        verify(mrtmAccountMapper).updateMrtmAccount(mrtmAccount, mrtmAccountUpdateDTO);
        verify(emissionsMonitoringPlanQueryService, times(accountUpdateInvocations)).getLastestEmissionsMonitoringPlan(ACCOUNT_ID);
        verify(accountUpdatedRegistryListener, times(accountUpdateInvocations)).onAccountUpdatedEvent(AccountUpdatedRegistryEvent.builder()
            .accountId(ACCOUNT_ID)
            .emissionsMonitoringPlan(emissionsMonitoringPlan)
            .build());
        verify(accountSearchAdditionalKeywordService).storeKeywordsForAccount(ACCOUNT_ID,
            Map.of(AccountSearchKey.ACCOUNT_NAME.name(), name));
        verify(publisher).publishEvent(MrtmAccountReportingYearsUpdatedEvent.builder()
                .accountId(ACCOUNT_ID)
                .reportingYears(expectedYears)
                .build());
        verifyNoInteractions(accountDetailsHistoryQueryService);
        verifyNoMoreInteractions(emissionsMonitoringPlanQueryService, accountUpdatedRegistryListener,
            mrtmAccountQueryService, mrtmAccountMapper, accountSearchAdditionalKeywordService, publisher);
        verifyNoInteractions(mrtmAccountRepository);
    }

    private static Stream<Arguments> createRemainingReportingYearsScenarios() {
        return Stream.of(
            Arguments.of(LocalDate.now(), LocalDate.now(), List.of(Year.now()), 0),
            Arguments.of(LocalDate.now().plusYears(1), LocalDate.now().plusYears(1), List.of(Year.now()), 0),
            Arguments.of(LocalDate.now(), LocalDate.now().minusYears(1), List.of(Year.now().minusYears(1), Year.now()), 1)
        );
    }

    @Test
    void updateMaritimeAccount_throws_invalid_year_exception() {
        AppUser appUser = AppUser.builder().userId("userId").build();

        MrtmAccountUpdateDTO mrtmAccountUpdateDTO = mock(MrtmAccountUpdateDTO.class);
        MrtmAccount mrtmAccount = mock(MrtmAccount.class);

        when(mrtmAccountQueryService.getAccountById(ACCOUNT_ID)).thenReturn(mrtmAccount);
        when(mrtmAccount.getFirstMaritimeActivityDate()).thenReturn(LocalDate.now().minusYears(1));
        when(mrtmAccountUpdateDTO.getFirstMaritimeActivityDate()).thenReturn(LocalDate.now());

        BusinessException exception = assertThrows(BusinessException.class,
            () -> mrtmAccountUpdateService.updateMaritimeAccount(ACCOUNT_ID, mrtmAccountUpdateDTO, appUser));

        assertEquals(MrtmErrorCode.FIRST_MARITIME_ACTIVITY_DATE_AFTER_PREVIOUS, exception.getErrorCode());

        verify(mrtmAccountQueryService).getAccountById(ACCOUNT_ID);

        verifyNoMoreInteractions(mrtmAccountQueryService);
        verifyNoInteractions(emissionsMonitoringPlanQueryService, accountUpdatedRegistryListener,
            mrtmAccountMapper, accountSearchAdditionalKeywordService, publisher, accountDetailsHistoryQueryService);
    }

    @Test
    void closeAccount() {
        String reason = "reason";
        AppUser appUser = AppUser.builder().userId("userId").firstName("firstName").lastName("lastName").build();

        MrtmAccount mrtmAccount = mock(MrtmAccount.class);
        when(mrtmAccountQueryService.getAccountById(ACCOUNT_ID)).thenReturn(mrtmAccount);

        mrtmAccountUpdateService.closeAccount(ACCOUNT_ID, appUser, reason);

        verify(mrtmAccount).setClosureReason(reason);
        verify(mrtmAccount).setClosingDate(dateTimeArgumentCaptor.capture());
        assertThat(dateTimeArgumentCaptor.getValue()).isCloseTo(LocalDateTime.now(), within(10, ChronoUnit.SECONDS));
        verify(mrtmAccount).setClosedBy(appUser.getUserId());
        verify(mrtmAccount).setClosedByName(appUser.getFullName());
        verify(mrtmAccount).setStatus(MrtmAccountStatus.CLOSED);

        verify(mrtmAccountQueryService).getAccountById(ACCOUNT_ID);
        verify(mrtmAccountRepository).save(mrtmAccount);
        verifyNoMoreInteractions(mrtmAccountQueryService, mrtmAccountRepository, mrtmAccount);
        verifyNoInteractions(mrtmAccountMapper, accountSearchAdditionalKeywordService);
    }

    @Test
    void updateAccountUponEmpWithdrawn() {
        MrtmAccount account = mock(MrtmAccount.class);
        when(mrtmAccountQueryService.getAccountById(ACCOUNT_ID)).thenReturn(account);

        mrtmAccountUpdateService.updateAccountUponEmpWithdrawn(ACCOUNT_ID);

        verify(mrtmAccountQueryService).getAccountById(ACCOUNT_ID);
        verify(account).setStatus(MrtmAccountStatus.WITHDRAWN);
        verifyNoMoreInteractions(account, mrtmAccountQueryService);
        verifyNoInteractions(mrtmAccountMapper, accountSearchAdditionalKeywordService);
    }

    @Test
    void updateAccountUponEmpApproved() {
        AddressState oldAddress = AddressState.builder().line1("old").city("city").country("GB").build();
        AddressState newAddress = AddressState.builder().line1("new").city("city").country("GB").build();
        RegisteredAddressState oldRegistered = RegisteredAddressState.builder().line1("oldReg").city("city").country("GB").build();
        RegisteredAddressState newRegistered = RegisteredAddressState.builder().line1("newReg").city("city").country("GB").build();
        AddressStateDTO oldAddressDTO = AddressStateDTO.builder().line1("old").city("city").country("GB").build();
        AddressStateDTO newAddressDTO = AddressStateDTO.builder().line1("new").city("city").country("GB").build();
        AddressStateDTO oldRegisteredDTO = AddressStateDTO.builder().line1("oldReg").city("city").country("GB").build();
        AddressStateDTO newRegisteredDTO = AddressStateDTO.builder().line1("newReg").city("city").country("GB").build();

        MrtmAccount account = MrtmAccount.builder()
                .name("old name")
                .address(oldAddress)
                .registeredAddress(oldRegistered)
                .firstMaritimeActivityDate(LocalDate.of(2026, 1, 1))
                .build();
        EmpIssuanceAccountDraftData accountDraftData = EmpIssuanceAccountDraftData.builder()
                .name("test name")
                .address(newAddress)
                .registeredAddress(newRegistered)
                .build();

        when(mrtmAccountQueryService.getAccountById(ACCOUNT_ID)).thenReturn(account);
        when(addressStateMapper.toAddressStateDTO(oldAddress)).thenReturn(oldAddressDTO);
        when(addressStateMapper.toAddressStateDTO(newAddress)).thenReturn(newAddressDTO);
        when(registeredAddressStateMapper.toAddressStateDTO(oldRegistered)).thenReturn(oldRegisteredDTO);
        when(registeredAddressStateMapper.toAddressStateDTO(newRegistered)).thenReturn(newRegisteredDTO);

        mrtmAccountUpdateService.updateAccountUponEmpApproved(
                ACCOUNT_ID,
                accountDraftData,
                AccountDetailsHistoryConstants.updatedThroughWorkflow(
                        AccountDetailsHistoryConstants.WORKFLOW_NAME_EMP_ISSUANCE, "REQ3"),
                AccountDetailsHistoryConstants.SUBMITTED_BY_SYSTEM);

        assertThat(account.getName()).isEqualTo("test name");
        assertThat(account.getStatus()).isEqualTo(MrtmAccountStatus.LIVE);
        verify(accountDetailsHistoryQueryService).createAccountDetailsHistory(
                eq(ACCOUNT_ID), any(), any(),
                eq("Updated through Emissions monitoring plan REQ3"),
                eq(AccountDetailsHistoryConstants.SUBMITTED_BY_SYSTEM),
                eq(null));
    }

    @Test
    void updateAccountUponEmpVariationApproved() {
    	AddressState oldAddress = AddressState.builder().city("oldcity").country("GB").build();
    	AddressState newAddress = AddressState.builder().city("city").country("GB").build();
    	RegisteredAddressState oldRegistered = RegisteredAddressState.builder().city("oldcity2").country("GB").build();
    	RegisteredAddressState newRegistered = RegisteredAddressState.builder().city("city2").country("GB").build();
    	AddressStateDTO oldAddressDTO = AddressStateDTO.builder().city("oldcity").country("GB").build();
    	AddressStateDTO newAddressDTO = AddressStateDTO.builder().city("city").country("GB").build();
    	AddressStateDTO oldRegisteredDTO = AddressStateDTO.builder().city("oldcity2").country("GB").build();
    	AddressStateDTO newRegisteredDTO = AddressStateDTO.builder().city("city2").country("GB").build();

    	EmpVariationAccountDraftData accountDraftData = EmpVariationAccountDraftData.builder()
    			.name("name")
    			.address(newAddress)
    			.registeredAddress(newRegistered)
    			.build();

    	MrtmAccount account = MrtmAccount.builder()
    			.name("oldname")
    			.address(oldAddress)
    			.registeredAddress(oldRegistered)
    			.firstMaritimeActivityDate(LocalDate.of(2026, 1, 1))
    			.build();
        when(mrtmAccountQueryService.getAccountById(ACCOUNT_ID)).thenReturn(account);
        when(addressStateMapper.toAddressStateDTO(oldAddress)).thenReturn(oldAddressDTO);
        when(addressStateMapper.toAddressStateDTO(newAddress)).thenReturn(newAddressDTO);
        when(registeredAddressStateMapper.toAddressStateDTO(oldRegistered)).thenReturn(oldRegisteredDTO);
        when(registeredAddressStateMapper.toAddressStateDTO(newRegistered)).thenReturn(newRegisteredDTO);

        mrtmAccountUpdateService.updateAccountUponEmpVariationApproved(
                ACCOUNT_ID,
                accountDraftData,
                AccountDetailsHistoryConstants.updatedThroughWorkflow(
                        AccountDetailsHistoryConstants.WORKFLOW_NAME_EMP_VARIATION, "requestId"),
                AccountDetailsHistoryConstants.SUBMITTED_BY_SYSTEM);
        assertThat(account.getName()).isEqualTo(accountDraftData.getName());
        assertThat(account.getAddress()).isEqualTo(accountDraftData.getAddress());
        assertThat(account.getRegisteredAddress()).isEqualTo(accountDraftData.getRegisteredAddress());
        verify(mrtmAccountQueryService).getAccountById(ACCOUNT_ID);
        verify(accountDetailsHistoryQueryService).createAccountDetailsHistory(
                eq(ACCOUNT_ID), any(), any(),
                eq("Updated through EMP variation requestId"),
                eq(AccountDetailsHistoryConstants.SUBMITTED_BY_SYSTEM),
                eq(null));
    }

    @Test
    void updateAccountRegistryId_recordsHistoryWithSystem() {
        MrtmAccount account = MrtmAccount.builder()
                .name("name")
                .address(AddressState.builder().line1("line1").city("city").country("GB").build())
                .firstMaritimeActivityDate(LocalDate.of(2026, 1, 1))
                .registryId(1111111)
                .build();
        AddressStateDTO addressDTO = AddressStateDTO.builder().line1("line1").city("city").country("GB").build();

        when(mrtmAccountQueryService.getAccountById(ACCOUNT_ID)).thenReturn(account);
        when(addressStateMapper.toAddressStateDTO(account.getAddress())).thenReturn(addressDTO);
        when(registeredAddressStateMapper.toAddressStateDTO(null)).thenReturn(null);

        mrtmAccountUpdateService.updateAccountRegistryId(ACCOUNT_ID, 2222222);

        assertThat(account.getRegistryId()).isEqualTo(2222222);
        verify(mrtmAccountRepository).save(account);
        verify(accountDetailsHistoryQueryService).createAccountDetailsHistory(
                eq(ACCOUNT_ID),
                any(),
                any(),
                eq(AccountDetailsHistoryConstants.REASON_REGISTRY_SET_OPERATOR),
                eq(AccountDetailsHistoryConstants.SUBMITTED_BY_SYSTEM),
                eq(null));
    }

    @Test
    void updateMaritimeAccount_recordsHistoryWhenDetailsChange() {
        AppUser appUser = AppUser.builder().userId("userId").firstName("Jane").lastName("Regulator").build();
        AddressState address = AddressState.builder().line1("line1").city("city").country("GB").build();
        AddressStateDTO addressDTO = AddressStateDTO.builder().line1("line1").city("city").country("GB").build();
        LocalDate fyro = LocalDate.of(2026, 1, 1);

        MrtmAccount account = MrtmAccount.builder()
                .name("Old Name")
                .sopId(10L)
                .address(address)
                .firstMaritimeActivityDate(fyro)
                .build();

        MrtmAccountUpdateDTO updateDTO = MrtmAccountUpdateDTO.builder()
                .name("New Name")
                .sopId(10L)
                .address(addressDTO)
                .firstMaritimeActivityDate(fyro)
                .reason("Corrected company data")
                .build();

        when(mrtmAccountQueryService.getAccountById(ACCOUNT_ID)).thenReturn(account);
        when(addressStateMapper.toAddressStateDTO(address)).thenReturn(addressDTO);
        when(registeredAddressStateMapper.toAddressStateDTO(null)).thenReturn(null);
        org.mockito.Mockito.doAnswer(invocation -> {
            account.setName(updateDTO.getName());
            account.setSopId(updateDTO.getSopId());
            account.setFirstMaritimeActivityDate(updateDTO.getFirstMaritimeActivityDate());
            return null;
        }).when(mrtmAccountMapper).updateMrtmAccount(account, updateDTO);

        mrtmAccountUpdateService.updateMaritimeAccount(ACCOUNT_ID, updateDTO, appUser);

        verify(accountDetailsHistoryQueryService).createAccountDetailsHistory(
            eq(ACCOUNT_ID), any(), any(), eq("Corrected company data"), eq(appUser.getFullName()),
            eq(appUser.getUserId()));
    }
}
