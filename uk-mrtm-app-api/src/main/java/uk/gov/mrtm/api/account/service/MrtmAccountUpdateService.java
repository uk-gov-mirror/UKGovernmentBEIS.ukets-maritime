package uk.gov.mrtm.api.account.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.account.domain.AccountUpdatedRegistryEvent;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.MrtmAccountReportingYearsUpdatedEvent;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.account.domain.dto.AccountDetailsHistorySnapshot;
import uk.gov.mrtm.api.account.domain.dto.MrtmAccountUpdateDTO;
import uk.gov.mrtm.api.account.enumeration.AccountSearchKey;
import uk.gov.mrtm.api.account.repository.MrtmAccountRepository;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.account.transform.MrtmAccountMapper;
import uk.gov.mrtm.api.account.transform.RegisteredAddressStateMapper;
import uk.gov.mrtm.api.common.exception.MrtmErrorCode;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.integration.registry.accountupdated.request.MaritimeAccountUpdatedEventListenerResolver;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationAccountDraftData;
import uk.gov.netz.api.account.service.AccountSearchAdditionalKeywordService;
import uk.gov.netz.api.account.service.validator.AccountStatus;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.exception.BusinessException;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Log4j2
@Service
@RequiredArgsConstructor
public class MrtmAccountUpdateService {
    private final MrtmAccountQueryService mrtmAccountQueryService;
    private final MrtmAccountRepository mrtmAccountRepository;
    private final MrtmAccountMapper mrtmAccountMapper;
    private final AccountSearchAdditionalKeywordService accountSearchAdditionalKeywordService;
    private final RegisteredAddressStateMapper registeredAddressStateMapper;
    private final EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;
    private final AddressStateMapper addressStateMapper;
    private final ApplicationEventPublisher publisher;
    private final MaritimeAccountUpdatedEventListenerResolver accountUpdatedRegistryListener;
    private final AccountDetailsHistoryQueryService accountDetailsHistoryQueryService;

    @Value("${feature-flag.aer.workflow.enabled}")
    private boolean aerEnabled;

    @Transactional
    @AccountStatus(expression = "{#status != 'CLOSED'}")
    public void updateMaritimeAccount(Long accountId, MrtmAccountUpdateDTO mrtmAccountUpdateDTO, AppUser user) {
        MrtmAccount mrtmAccount = mrtmAccountQueryService.getAccountById(accountId);
        boolean yearUpdated = mrtmAccount.getFirstMaritimeActivityDate().getYear()
            != mrtmAccountUpdateDTO.getFirstMaritimeActivityDate().getYear();

        validateFirstMaritimeActivityDate(
            mrtmAccount.getFirstMaritimeActivityDate().getYear(),
            mrtmAccountUpdateDTO.getFirstMaritimeActivityDate().getYear());

        AccountDetailsHistorySnapshot previousDetails = toAccountDetailsHistorySnapshot(mrtmAccount);

        mrtmAccountMapper.updateMrtmAccount(mrtmAccount, mrtmAccountUpdateDTO);
        mrtmAccount.setUpdatedBy(user.getUserId());
        mrtmAccount.setLastUpdatedDate(LocalDateTime.now());

        AccountDetailsHistorySnapshot newDetails = toAccountDetailsHistorySnapshot(mrtmAccount);
        recordAccountDetailsHistoryIfChanged(
                accountId, previousDetails, newDetails, mrtmAccountUpdateDTO.getReason(), user.getFullName(), user.getUserId());

        accountSearchAdditionalKeywordService.storeKeywordsForAccount(accountId,
                Map.of(AccountSearchKey.ACCOUNT_NAME.name(), mrtmAccountUpdateDTO.getName()));

        final List<Year> reportingYears = ReportingYearService
                .calculateReportingYears(Year.of(mrtmAccountUpdateDTO.getFirstMaritimeActivityDate().getYear()));

        if (aerEnabled) {
            publisher.publishEvent(MrtmAccountReportingYearsUpdatedEvent.builder()
                    .accountId(accountId)
                    .reportingYears(reportingYears)
                    .build());
        }

        if (yearUpdated) {
            log.info("Year updated, sending account updated event for account {}", accountId);
            sendAccountUpdateToRegistry(accountId);
        }
    }

    @Transactional
    @AccountStatus(expression = "{#status != 'CLOSED'}")
    public void closeAccount(Long accountId, AppUser appUser, String reason) {
        MrtmAccount mrtmAccount = mrtmAccountQueryService.getAccountById(accountId);
        mrtmAccount.setClosureReason(reason);
        mrtmAccount.setClosingDate(LocalDateTime.now());
        mrtmAccount.setClosedBy(appUser.getUserId());
        mrtmAccount.setClosedByName(appUser.getFullName());
        mrtmAccount.setStatus(MrtmAccountStatus.CLOSED);

        mrtmAccountRepository.save(mrtmAccount);
    }

    @Transactional
    @AccountStatus(expression = "{#status == 'NEW'}")
    public void updateAccountUponEmpApproved(Long accountId, EmpIssuanceAccountDraftData accountDraftData,
                                             String reason, String submitterName) {
        MrtmAccount account = mrtmAccountQueryService.getAccountById(accountId);
        AccountDetailsHistorySnapshot previousDetails = toAccountDetailsHistorySnapshot(account);

        account.setName(accountDraftData.getName());
        account.setAddress(accountDraftData.getAddress());
        account.setRegisteredAddress(accountDraftData.getRegisteredAddress());
        account.setStatus(MrtmAccountStatus.LIVE);

        AccountDetailsHistorySnapshot newDetails = toAccountDetailsHistorySnapshot(account);
        recordAccountDetailsHistoryIfChanged(
                accountId,
                previousDetails,
                newDetails,
                reason,
                submitterName,
                null);
    }

    @Transactional
    @AccountStatus(expression = "{#status == 'NEW'}")
    public void updateAccountUponEmpWithdrawn(Long accountId) {
        MrtmAccount account = mrtmAccountQueryService.getAccountById(accountId);
        account.setStatus(MrtmAccountStatus.WITHDRAWN);
    }

    @Transactional
    @AccountStatus(expression = "{#status == 'LIVE'}")
    public void updateAccountUponEmpVariationApproved(Long accountId, EmpVariationAccountDraftData accountDraftData,
                                                      String reason, String submitterName) {
        MrtmAccount account = mrtmAccountQueryService.getAccountById(accountId);
        AccountDetailsHistorySnapshot previousDetails = toAccountDetailsHistorySnapshot(account);

        account.setName(accountDraftData.getName());
        account.setAddress(accountDraftData.getAddress());
        account.setRegisteredAddress(accountDraftData.getRegisteredAddress());

        AccountDetailsHistorySnapshot newDetails = toAccountDetailsHistorySnapshot(account);
        recordAccountDetailsHistoryIfChanged(
                accountId,
                previousDetails,
                newDetails,
                reason,
                submitterName,
                null);
    }

    @Transactional
    public void updateAccountRegistryId(Long accountId, Integer registryId) {
        MrtmAccount account = mrtmAccountQueryService.getAccountById(accountId);
        AccountDetailsHistorySnapshot previousDetails = toAccountDetailsHistorySnapshot(account);

        account.setRegistryId(registryId);
        mrtmAccountRepository.save(account);

        AccountDetailsHistorySnapshot newDetails = toAccountDetailsHistorySnapshot(account);
        recordAccountDetailsHistoryIfChanged(
                accountId,
                previousDetails,
                newDetails,
                AccountDetailsHistoryConstants.REASON_REGISTRY_SET_OPERATOR,
                AccountDetailsHistoryConstants.SUBMITTED_BY_SYSTEM,
                null);
    }

    private void validateFirstMaritimeActivityDate(int currentFirstMaritimeActivityDate, int newFirstMaritimeActivityDate) {
        if (newFirstMaritimeActivityDate > currentFirstMaritimeActivityDate) {
            throw new BusinessException(MrtmErrorCode.FIRST_MARITIME_ACTIVITY_DATE_AFTER_PREVIOUS);
        }
    }

    private void recordAccountDetailsHistoryIfChanged(Long accountId,
                                                      AccountDetailsHistorySnapshot previousDetails,
                                                      AccountDetailsHistorySnapshot newDetails,
                                                      String reason,
                                                      String submitterName,
                                                      String submitterId) {
        if (Objects.equals(previousDetails, newDetails)) {
            return;
        }

        accountDetailsHistoryQueryService.createAccountDetailsHistory(
                accountId, previousDetails, newDetails, reason, submitterName, submitterId);
    }

    private AccountDetailsHistorySnapshot toAccountDetailsHistorySnapshot(MrtmAccount account) {
        return AccountDetailsHistorySnapshot.builder()
                .operatorName(account.getName())
                .sopId(account.getSopId())
                .contactAddress(addressStateMapper.toAddressStateDTO(account.getAddress()))
                .registeredAddress(registeredAddressStateMapper.toAddressStateDTO(account.getRegisteredAddress()))
                .firstYearOfReportingObligation(account.getFirstMaritimeActivityDate())
                .registryId(account.getRegistryId())
                .build();
    }

    private void sendAccountUpdateToRegistry(Long accountId) {
        EmissionsMonitoringPlan emissionsMonitoringPlan = emissionsMonitoringPlanQueryService
            .getLastestEmissionsMonitoringPlan(accountId);

        accountUpdatedRegistryListener.onAccountUpdatedEvent(AccountUpdatedRegistryEvent.builder()
            .accountId(accountId)
            .emissionsMonitoringPlan(emissionsMonitoringPlan)
            .build());
    }

}
