package uk.gov.mrtm.api.integration.external.verification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.repository.MrtmAccountRepository;
import uk.gov.mrtm.api.integration.external.aer.validation.ExternalAerValidator;
import uk.gov.mrtm.api.integration.external.common.MrtmStagingPayloadType;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerVerification;
import uk.gov.mrtm.api.integration.external.verification.domain.StagingAerVerification;
import uk.gov.mrtm.api.integration.external.verification.domain.StagingAerVerificationEntity;
import uk.gov.mrtm.api.integration.external.verification.repository.StagingAerVerificationRepository;
import uk.gov.mrtm.api.integration.external.verification.transform.ExternalAerVerificationMapper;
import uk.gov.mrtm.api.integration.external.verification.validation.ExternalAerVerificationValidator;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.utils.DateService;
import uk.gov.netz.api.thirdpartydataprovider.domain.ThirdPartyDataProvider;
import uk.gov.netz.api.thirdpartydataprovider.repository.ThirdPartyDataProviderRepository;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.Optional;

import static uk.gov.netz.api.common.exception.ErrorCode.RESOURCE_NOT_FOUND;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "feature-flag.external.integration.aer.verification.enabled", havingValue = "true")
public class ExternalAerVerificationService {

    private final ExternalAerVerificationMapper mapper;
    private final ExternalAerVerificationValidator aerVerificationValidator;
    private final ExternalAerValidator aerValidator;
    private final MrtmAccountRepository mrtmAccountRepository;
    private final StagingAerVerificationRepository stagingAerVerificationRepository;
    private final ThirdPartyDataProviderRepository thirdPartyDataProviderRepository;
    private final DateService dateService;

    @Transactional
    public void submitAerVerificationData(ExternalAerVerification external, String companyImoNumber,
                                          Year year, AppUser appUser) {
        MrtmAccount account = mrtmAccountRepository
            .findByImoNumberForUpdate(companyImoNumber)
            .orElseThrow(() -> new BusinessException(RESOURCE_NOT_FOUND));
        aerValidator.validateAerRequestTaskExists(year, account.getId());

        StagingAerVerification staging = mapper.toStagingAerVerification(external, MrtmStagingPayloadType.AER_VERIFICATION_STAGING_PAYLOAD);
        aerVerificationValidator.validateData(staging);

        Optional<StagingAerVerificationEntity> optionalStagingAerEntity =
            stagingAerVerificationRepository.findByAccountIdAndYear(account.getId(), year);

        LocalDateTime now = dateService.getLocalDateTime();

        Long thirdPartyDataProviderId = appUser.getAuthorities().getFirst().getThirdPartyDataProviderId();
        ThirdPartyDataProvider thirdPartyDataProvider = thirdPartyDataProviderRepository.findById(thirdPartyDataProviderId)
            .orElseThrow(() -> new BusinessException(RESOURCE_NOT_FOUND));

        if (optionalStagingAerEntity.isPresent()) {
            StagingAerVerificationEntity stagingAerEntity = optionalStagingAerEntity.get();
            stagingAerEntity.setPayload(staging);
            stagingAerEntity.setUpdatedOn(now);
            stagingAerEntity.setProviderName(thirdPartyDataProvider.getName());

            stagingAerVerificationRepository.save(stagingAerEntity);
        } else {
            stagingAerVerificationRepository.save(
                StagingAerVerificationEntity.builder()
                    .payload(staging)
                    .year(year)
                    .accountId(account.getId())
                    .createdOn(now)
                    .updatedOn(now)
                    .providerName(thirdPartyDataProvider.getName())
                    .build()
            );
        }
    }
}
