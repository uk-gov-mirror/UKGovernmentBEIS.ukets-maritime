package uk.gov.mrtm.api.integration.external.emp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.repository.MrtmAccountRepository;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.integration.external.emp.domain.ExternalEmissionsMonitoringPlan;
import uk.gov.mrtm.api.integration.external.emp.domain.StagingEmissionsMonitoringPlan;
import uk.gov.mrtm.api.integration.external.emp.domain.StagingEmissionsMonitoringPlanEntity;
import uk.gov.mrtm.api.integration.external.emp.transform.ExternalEmpMapper;
import uk.gov.mrtm.api.integration.external.emp.repository.StagingEmissionsMonitoringPlanRepository;
import uk.gov.mrtm.api.integration.external.emp.validation.ExternalEmpValidator;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.utils.DateService;
import uk.gov.netz.api.thirdpartydataprovider.domain.ThirdPartyDataProvider;
import uk.gov.netz.api.thirdpartydataprovider.repository.ThirdPartyDataProviderRepository;

import java.time.LocalDateTime;
import java.util.Optional;

import static uk.gov.netz.api.common.exception.ErrorCode.RESOURCE_NOT_FOUND;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "feature-flag.external.integration.emp.submit.enabled", havingValue = "true")
public class ExternalEmpSubmitService {

    private final ExternalEmpValidator validator;
    private final ExternalEmpMapper mapper;
    private final StagingEmissionsMonitoringPlanRepository stagingEmpRepository;
    private final MrtmAccountRepository mrtmAccountRepository;
    private final DateService dateService;
    private final ThirdPartyDataProviderRepository thirdPartyDataProviderRepository;

    @Transactional
    public void submitEmissionsMonitoringPlanData(ExternalEmissionsMonitoringPlan external, String companyImoNumber,
                                                  AppUser appUser) {
        MrtmAccount account = mrtmAccountRepository
            .findByImoNumberForUpdate(companyImoNumber)
            .orElseThrow(() -> new BusinessException(RESOURCE_NOT_FOUND));

        StagingEmissionsMonitoringPlan staging = mapper.toStagingEmissionsMonitoringPlan(external);
        validator.validate(staging, companyImoNumber);

        Optional<StagingEmissionsMonitoringPlanEntity> optionalStagingEmpEntity =
            stagingEmpRepository.findByAccountId(account.getId());

        LocalDateTime now = dateService.getLocalDateTime();

        Long thirdPartyDataProviderId = appUser.getAuthorities().getFirst().getThirdPartyDataProviderId();
        ThirdPartyDataProvider thirdPartyDataProvider = thirdPartyDataProviderRepository.findById(thirdPartyDataProviderId)
            .orElseThrow(() -> new BusinessException(RESOURCE_NOT_FOUND));

        if (optionalStagingEmpEntity.isPresent()) {
            StagingEmissionsMonitoringPlanEntity stagingEmpEntity = optionalStagingEmpEntity.get();
            stagingEmpEntity.setPayload(staging);
            stagingEmpEntity.setUpdatedOn(now);
            stagingEmpEntity.setProviderName(thirdPartyDataProvider.getName());

            stagingEmpRepository.save(stagingEmpEntity);
        } else {
            stagingEmpRepository.save(
                StagingEmissionsMonitoringPlanEntity.builder()
                    .payload(staging)
                    .accountId(account.getId())
                    .createdOn(now)
                    .updatedOn(now)
                    .providerName(thirdPartyDataProvider.getName())
                    .build()
            );
        }

    }
}
