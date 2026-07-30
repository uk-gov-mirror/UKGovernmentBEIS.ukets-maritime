package uk.gov.mrtm.api.integration.external.verification.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.repository.MrtmAccountRepository;
import uk.gov.mrtm.api.integration.external.aer.validation.ExternalAerValidator;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerVerification;
import uk.gov.mrtm.api.integration.external.verification.domain.StagingAerVerification;
import uk.gov.mrtm.api.integration.external.verification.domain.StagingAerVerificationEntity;
import uk.gov.mrtm.api.integration.external.verification.repository.StagingAerVerificationRepository;
import uk.gov.mrtm.api.integration.external.verification.transform.ExternalAerVerificationMapper;
import uk.gov.mrtm.api.integration.external.verification.validation.ExternalAerVerificationValidator;
import uk.gov.netz.api.authorization.core.domain.AppAuthority;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.utils.DateService;
import uk.gov.netz.api.thirdpartydataprovider.domain.ThirdPartyDataProvider;
import uk.gov.netz.api.thirdpartydataprovider.repository.ThirdPartyDataProviderRepository;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExternalAerVerificationServiceTest {

    @InjectMocks
    private ExternalAerVerificationService externalAerVerificationService;

    @Mock
    private ExternalAerVerificationValidator aerVerificationValidator;
    @Mock
    private ExternalAerValidator aerValidator;
    @Mock
    private ExternalAerVerificationMapper mapper;
    @Mock
    private StagingAerVerificationRepository stagingAerRepository;
    @Mock
    private MrtmAccountRepository mrtmAccountRepository;
    @Mock
    private ThirdPartyDataProviderRepository thirdPartyDataProviderRepository;
    @Mock
    private DateService dateService;

    @Test
    void submitAerVerificationData_staging_aer_staging_is_not_present() {
        ExternalAerVerification external = mock(ExternalAerVerification.class);
        String companyImoNumber = "1234567";
        Year year = Year.now();
        long thirdPartyDataProviderId = 1L;
        AppUser appUser = AppUser.builder()
            .authorities(List.of(AppAuthority.builder().thirdPartyDataProviderId(thirdPartyDataProviderId).build()))
            .build();
        ThirdPartyDataProvider thirdPartyDataProvider = ThirdPartyDataProvider.builder().name("provider name").build();
        Long accountId = 1234L;
        LocalDateTime now = LocalDateTime.now();
        MrtmAccount account = MrtmAccount.builder().id(accountId).build();
        StagingAerVerification staging = mock(StagingAerVerification.class);
        StagingAerVerificationEntity expectedStagingAerEntity = StagingAerVerificationEntity.builder()
            .payload(staging)
            .accountId(accountId)
            .year(year)
            .createdOn(now)
            .updatedOn(now)
            .providerName("provider name")
            .build();

        when(mapper.toStagingAerVerification(external, "AER_VERIFICATION_STAGING_PAYLOAD")).thenReturn(staging);
        when(mrtmAccountRepository.findByImoNumberForUpdate(companyImoNumber)).thenReturn(Optional.ofNullable(account));
        when(thirdPartyDataProviderRepository.findById(thirdPartyDataProviderId)).thenReturn(Optional.ofNullable(thirdPartyDataProvider));
        when(stagingAerRepository.findByAccountIdAndYear(accountId, year)).thenReturn(Optional.empty());
        when(dateService.getLocalDateTime()).thenReturn(now);

        externalAerVerificationService.submitAerVerificationData(external, companyImoNumber, year, appUser);
        verify(mapper).toStagingAerVerification(external, "AER_VERIFICATION_STAGING_PAYLOAD");
        verify(aerVerificationValidator).validateData(staging);
        verify(aerValidator).validateAerRequestTaskExists(year, accountId);
        verify(mrtmAccountRepository).findByImoNumberForUpdate(companyImoNumber);
        verify(stagingAerRepository).findByAccountIdAndYear(accountId, year);
        verify(dateService).getLocalDateTime();
        verify(thirdPartyDataProviderRepository).findById(thirdPartyDataProviderId);
        verify(stagingAerRepository).save(expectedStagingAerEntity);

        verifyNoMoreInteractions(mapper, aerVerificationValidator, mrtmAccountRepository, stagingAerRepository,
            dateService, thirdPartyDataProviderRepository, aerValidator);
    }

    @Test
    void submitAerVerificationData_staging_aer_staging_is_present() {
        ExternalAerVerification external = mock(ExternalAerVerification.class);
        String companyImoNumber = "1234567";
        Year year = Year.now();
        long thirdPartyDataProviderId = 1L;
        AppUser appUser = AppUser.builder()
            .authorities(List.of(AppAuthority.builder().thirdPartyDataProviderId(thirdPartyDataProviderId).build()))
            .build();
        ThirdPartyDataProvider  thirdPartyDataProvider = ThirdPartyDataProvider.builder().name("provider name").build();
        Long accountId = 1234L;
        Long stagingAerId = 4321L;
        LocalDateTime now = LocalDateTime.now();
        MrtmAccount account = MrtmAccount.builder().id(accountId).build();
        StagingAerVerification staging = mock(StagingAerVerification.class);
        StagingAerVerificationEntity stagingAerEntity = StagingAerVerificationEntity.builder()
            .id(stagingAerId)
            .payload(staging)
            .accountId(accountId)
            .updatedOn(now.minusDays(2))
            .providerName("old provider name")
            .build();
        StagingAerVerificationEntity expectedStagingAerEntity = StagingAerVerificationEntity.builder()
            .id(stagingAerId)
            .payload(staging)
            .accountId(accountId)
            .updatedOn(now)
            .providerName("provider name")
            .build();

        when(mapper.toStagingAerVerification(external, "AER_VERIFICATION_STAGING_PAYLOAD")).thenReturn(staging);
        when(mrtmAccountRepository.findByImoNumberForUpdate(companyImoNumber)).thenReturn(Optional.ofNullable(account));
        when(thirdPartyDataProviderRepository.findById(thirdPartyDataProviderId)).thenReturn(Optional.ofNullable(thirdPartyDataProvider));
        when(stagingAerRepository.findByAccountIdAndYear(accountId, year)).thenReturn(Optional.of(stagingAerEntity));
        when(dateService.getLocalDateTime()).thenReturn(now);

        externalAerVerificationService.submitAerVerificationData(external, companyImoNumber, year, appUser);
        verify(mapper).toStagingAerVerification(external, "AER_VERIFICATION_STAGING_PAYLOAD");
        verify(aerVerificationValidator).validateData(staging);
        verify(aerValidator).validateAerRequestTaskExists(year, accountId);
        verify(mrtmAccountRepository).findByImoNumberForUpdate(companyImoNumber);
        verify(stagingAerRepository).findByAccountIdAndYear(accountId, year);
        verify(thirdPartyDataProviderRepository).findById(thirdPartyDataProviderId);
        verify(dateService).getLocalDateTime();
        verify(stagingAerRepository).save(expectedStagingAerEntity);

        verifyNoMoreInteractions(mapper, aerVerificationValidator, mrtmAccountRepository,
            stagingAerRepository, dateService, thirdPartyDataProviderRepository, aerValidator);
    }
}