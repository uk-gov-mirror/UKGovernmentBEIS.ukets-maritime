package uk.gov.mrtm.api.integration.external.emp.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.repository.MrtmAccountRepository;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.integration.external.emp.domain.ExternalEmissionsMonitoringPlan;
import uk.gov.mrtm.api.integration.external.emp.domain.StagingEmissionsMonitoringPlan;
import uk.gov.mrtm.api.integration.external.emp.domain.StagingEmissionsMonitoringPlanEntity;
import uk.gov.mrtm.api.integration.external.emp.transform.ExternalEmpMapper;
import uk.gov.mrtm.api.integration.external.emp.repository.StagingEmissionsMonitoringPlanRepository;
import uk.gov.mrtm.api.integration.external.emp.validation.ExternalEmpValidator;
import uk.gov.netz.api.authorization.core.domain.AppAuthority;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.utils.DateService;
import uk.gov.netz.api.thirdpartydataprovider.domain.ThirdPartyDataProvider;
import uk.gov.netz.api.thirdpartydataprovider.repository.ThirdPartyDataProviderRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExternalEmpSubmitServiceTest {

    @InjectMocks
    private ExternalEmpSubmitService externalEmpSubmitService;

    @Mock
    private ExternalEmpValidator validator;
    @Mock
    private ExternalEmpMapper mapper;
    @Mock
    private StagingEmissionsMonitoringPlanRepository stagingEmpRepository;
    @Mock
    private MrtmAccountRepository mrtmAccountRepository;
    @Mock
    private ThirdPartyDataProviderRepository thirdPartyDataProviderRepository;
    @Mock
    private DateService dateService;

    @Test
    void submitEmissionsMonitoringPlanData_staging_emp_is_not_present() {
        ExternalEmissionsMonitoringPlan external = mock(ExternalEmissionsMonitoringPlan.class);
        String companyImoNumber = "1234567";
        long thirdPartyDataProviderId = 1L;
        AppUser appUser = AppUser.builder()
            .authorities(List.of(AppAuthority.builder().thirdPartyDataProviderId(thirdPartyDataProviderId).build()))
            .build();
        ThirdPartyDataProvider  thirdPartyDataProvider = ThirdPartyDataProvider.builder().name("provider name").build();
        Long accountId = 1234L;
        LocalDateTime now = LocalDateTime.now();
        MrtmAccount account = MrtmAccount.builder().id(accountId).build();
        StagingEmissionsMonitoringPlan  staging = mock(StagingEmissionsMonitoringPlan.class);
        StagingEmissionsMonitoringPlanEntity expectedStagingEmpPlanEntity = StagingEmissionsMonitoringPlanEntity.builder()
            .payload(staging)
            .accountId(accountId)
            .createdOn(now)
            .updatedOn(now)
            .providerName("provider name")
            .build();

        when(mapper.toStagingEmissionsMonitoringPlan(external)).thenReturn(staging);
        when(mrtmAccountRepository.findByImoNumberForUpdate(companyImoNumber)).thenReturn(Optional.ofNullable(account));
        when(thirdPartyDataProviderRepository.findById(thirdPartyDataProviderId)).thenReturn(Optional.ofNullable(thirdPartyDataProvider));
        when(stagingEmpRepository.findByAccountId(accountId)).thenReturn(Optional.empty());
        when(dateService.getLocalDateTime()).thenReturn(now);

        externalEmpSubmitService.submitEmissionsMonitoringPlanData(external, companyImoNumber, appUser);
        verify(mrtmAccountRepository).findByImoNumberForUpdate(companyImoNumber);
        verify(mapper).toStagingEmissionsMonitoringPlan(external);
        verify(validator).validate(staging, companyImoNumber);
        verify(stagingEmpRepository).findByAccountId(accountId);
        verify(dateService).getLocalDateTime();
        verify(thirdPartyDataProviderRepository).findById(thirdPartyDataProviderId);
        verify(stagingEmpRepository).save(expectedStagingEmpPlanEntity);

        verifyNoMoreInteractions(mapper, validator, mrtmAccountRepository, stagingEmpRepository,
            dateService, thirdPartyDataProviderRepository);
    }


    @Test
    void submitEmissionsMonitoringPlanData_staging_emp_is_present() {
        ExternalEmissionsMonitoringPlan external = mock(ExternalEmissionsMonitoringPlan.class);
        String companyImoNumber = "1234567";
        long thirdPartyDataProviderId = 1L;
        AppUser appUser = AppUser.builder()
            .authorities(List.of(AppAuthority.builder().thirdPartyDataProviderId(thirdPartyDataProviderId).build()))
            .build();
        ThirdPartyDataProvider  thirdPartyDataProvider = ThirdPartyDataProvider.builder().name("provider name").build();
        Long accountId = 1234L;
        Long stagingEmpId = 4321L;
        LocalDateTime now = LocalDateTime.now();
        MrtmAccount account = MrtmAccount.builder().id(accountId).build();
        StagingEmissionsMonitoringPlan  staging = mock(StagingEmissionsMonitoringPlan.class);
        StagingEmissionsMonitoringPlanEntity stagingEmpPlanEntity = StagingEmissionsMonitoringPlanEntity.builder()
            .id(stagingEmpId)
            .payload(staging)
            .accountId(accountId)
            .updatedOn(now.minusDays(2))
            .providerName("old provider name")
            .build();
        StagingEmissionsMonitoringPlanEntity expectedStagingEmpPlanEntity = StagingEmissionsMonitoringPlanEntity.builder()
            .id(stagingEmpId)
            .payload(staging)
            .accountId(accountId)
            .updatedOn(now)
            .providerName("provider name")
            .build();

        when(mapper.toStagingEmissionsMonitoringPlan(external)).thenReturn(staging);
        when(mrtmAccountRepository.findByImoNumberForUpdate(companyImoNumber)).thenReturn(Optional.ofNullable(account));
        when(thirdPartyDataProviderRepository.findById(thirdPartyDataProviderId)).thenReturn(Optional.ofNullable(thirdPartyDataProvider));
        when(stagingEmpRepository.findByAccountId(accountId)).thenReturn(Optional.of(stagingEmpPlanEntity));
        when(dateService.getLocalDateTime()).thenReturn(now);

        externalEmpSubmitService.submitEmissionsMonitoringPlanData(external, companyImoNumber, appUser);
        verify(mrtmAccountRepository).findByImoNumberForUpdate(companyImoNumber);
        verify(mapper).toStagingEmissionsMonitoringPlan(external);
        verify(validator).validate(staging, companyImoNumber);
        verify(stagingEmpRepository).findByAccountId(accountId);
        verify(thirdPartyDataProviderRepository).findById(thirdPartyDataProviderId);
        verify(dateService).getLocalDateTime();
        verify(stagingEmpRepository).save(expectedStagingEmpPlanEntity);

        verifyNoMoreInteractions(mapper, validator, mrtmAccountRepository,
            stagingEmpRepository, dateService, thirdPartyDataProviderRepository);
    }

    @Test
    void submitEmissionsMonitoringPlanData_acquiresAccountWriteLockBeforeStagingLookup() {
        ExternalEmissionsMonitoringPlan external = mock(ExternalEmissionsMonitoringPlan.class);
        String companyImoNumber = "1234567";
        long thirdPartyDataProviderId = 1L;
        AppUser appUser = AppUser.builder()
            .authorities(List.of(AppAuthority.builder().thirdPartyDataProviderId(thirdPartyDataProviderId).build()))
            .build();
        ThirdPartyDataProvider thirdPartyDataProvider = ThirdPartyDataProvider.builder().name("provider name").build();
        Long accountId = 1234L;
        LocalDateTime now = LocalDateTime.now();
        MrtmAccount account = MrtmAccount.builder().id(accountId).build();
        StagingEmissionsMonitoringPlan staging = mock(StagingEmissionsMonitoringPlan.class);

        when(mrtmAccountRepository.findByImoNumberForUpdate(companyImoNumber)).thenReturn(Optional.of(account));
        when(mapper.toStagingEmissionsMonitoringPlan(external)).thenReturn(staging);
        when(thirdPartyDataProviderRepository.findById(thirdPartyDataProviderId)).thenReturn(Optional.of(thirdPartyDataProvider));
        when(stagingEmpRepository.findByAccountId(accountId)).thenReturn(Optional.empty());
        when(dateService.getLocalDateTime()).thenReturn(now);

        externalEmpSubmitService.submitEmissionsMonitoringPlanData(external, companyImoNumber, appUser);

        InOrder inOrder = inOrder(mrtmAccountRepository, validator, stagingEmpRepository);
        inOrder.verify(mrtmAccountRepository).findByImoNumberForUpdate(companyImoNumber);
        inOrder.verify(validator).validate(staging, companyImoNumber);
        inOrder.verify(stagingEmpRepository).findByAccountId(accountId);
    }
}