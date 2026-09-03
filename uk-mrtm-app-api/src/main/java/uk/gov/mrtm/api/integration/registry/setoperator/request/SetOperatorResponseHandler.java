package uk.gov.mrtm.api.integration.registry.setoperator.request;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.AccountReportingStatus;
import uk.gov.mrtm.api.account.domain.AccountUpdatedRegistryEvent;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.enumeration.AccountSearchKey;
import uk.gov.mrtm.api.account.enumeration.MrtmAccountReportingStatus;
import uk.gov.mrtm.api.account.repository.AccountReportingStatusRepository;
import uk.gov.mrtm.api.account.repository.MrtmAccountRepository;
import uk.gov.mrtm.api.account.service.MrtmAccountUpdateService;
import uk.gov.mrtm.api.common.constants.MrtmNotificationTemplateName;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.integration.registry.accountcontacts.domain.AccountContactsRegistryEvent;
import uk.gov.mrtm.api.integration.registry.accountcontacts.request.MaritimeAccountContactsEventListenerResolver;
import uk.gov.mrtm.api.integration.registry.accountexempt.domain.AccountExemptEvent;
import uk.gov.mrtm.api.integration.registry.accountexempt.request.MaritimeAccountExemptEventListenerResolver;
import uk.gov.mrtm.api.integration.registry.accountupdated.request.MaritimeAccountUpdatedEventListenerResolver;
import uk.gov.mrtm.api.integration.registry.common.NotifyRegistryEmailService;
import uk.gov.mrtm.api.integration.registry.common.NotifyRegistryEmailServiceParams;
import uk.gov.mrtm.api.integration.registry.common.PayloadFieldsUtils;
import uk.gov.mrtm.api.integration.registry.common.RegistryCompetentAuthorityEnum;
import uk.gov.mrtm.api.integration.registry.common.RegistryIntegrationEmailProperties;
import uk.gov.mrtm.api.integration.registry.setoperator.validate.SetOperatorRequestValidator;
import uk.gov.netz.api.account.domain.Account;
import uk.gov.netz.api.account.service.AccountSearchAdditionalKeywordService;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;
import uk.gov.netz.api.kafka.utils.KafkaConstants;
import uk.gov.netz.integration.model.IntegrationEventOutcome;
import uk.gov.netz.integration.model.error.ContactPoint;
import uk.gov.netz.integration.model.error.IntegrationEventErrorDetails;
import uk.gov.netz.integration.model.operator.OperatorUpdateEvent;
import uk.gov.netz.integration.model.operator.OperatorUpdateEventOutcome;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static uk.gov.mrtm.api.integration.registry.common.PayloadFieldsUtils.asStringOrEmpty;

@Log4j2
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "registry.integration.set.operator.enabled", havingValue = "true")
public class SetOperatorResponseHandler {

    private static final String INTEGRATION_POINT_KEY = "Set Operator ID";

    private final SetOperatorSendToRegistryProducer setOperatorSendToRegistryProducer;
    private final NotifyRegistryEmailService notifyRegistryEmailService;
    private final RegistryIntegrationEmailProperties emailProperties;
    private final KafkaTemplate<String, OperatorUpdateEventOutcome> setOperatorKafkaTemplate;
    private final SetOperatorRequestValidator validator;
    private final MrtmAccountRepository mrtmAccountRepository;
    private final AccountReportingStatusRepository accountReportingStatusRepository;
    private final MaritimeAccountUpdatedEventListenerResolver accountUpdatedRegistryListener;
    private final EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;
    private final MaritimeAccountContactsEventListenerResolver accountContactsEventListenerResolver;
    private final MaritimeAccountExemptEventListenerResolver accountExemptEventListenerResolver;
    private final AccountSearchAdditionalKeywordService accountSearchAdditionalKeywordService;
    private final MrtmAccountUpdateService mrtmAccountUpdateService;

    public void handleResponse(OperatorUpdateEvent event, String correlationId, String parentCorrelationId) {
        log.info("Set operator outcome with correlationId {}, parentCorrelationId {} and emitter ID {}",
                correlationId, parentCorrelationId, event.getEmitterId());

        if (parentCorrelationId == null) {
            log.warn("Inbound Set Operator ID request did not include {} header; outbound Set Operator ID Response "
                            + "cannot satisfy required parentCorrelationId. Upstream Registry/METS contract gap.",
                    KafkaConstants.CORRELATION_PARENT_ID_HEADER);
        }

        OperatorUpdateEventOutcome eventOutcome = process(event, correlationId);

        setOperatorSendToRegistryProducer.produce(
                eventOutcome, setOperatorKafkaTemplate, correlationId, parentCorrelationId);
    }

    private OperatorUpdateEventOutcome process(OperatorUpdateEvent event, String correlationId) {
        List<IntegrationEventErrorDetails> errors = validator.validate(event);

        if (errors.isEmpty()) {
            MrtmAccount account = mrtmAccountRepository.findByBusinessId(event.getEmitterId());
            mrtmAccountUpdateService.updateAccountRegistryId(account.getId(), event.getOperatorId().intValue());
            storeRegistryIdSearchKeyword(account, event.getOperatorId());
            sendUpdateAccountEvent(account.getId());
            sendAccountContactsEvent(account.getId());
            sendAccountExemptEvent(account.getId());
        } else {
            handleValidationErrors(event, correlationId, errors);
        }

        return OperatorUpdateEventOutcome.builder()
            .event(event)
            .outcome(errors.isEmpty() ? IntegrationEventOutcome.SUCCESS : IntegrationEventOutcome.ERROR)
            .errors(errors)
            .build();
    }

    private void sendUpdateAccountEvent(Long accountId) {
        EmissionsMonitoringPlan emissionsMonitoringPlan = emissionsMonitoringPlanQueryService
            .getLastestEmissionsMonitoringPlan(accountId);

        accountUpdatedRegistryListener
            .onAccountUpdatedEvent(AccountUpdatedRegistryEvent.builder()
                .accountId(accountId)
                .emissionsMonitoringPlan(emissionsMonitoringPlan)
                .build());
    }

    private void sendAccountContactsEvent(Long accountId) {
        accountContactsEventListenerResolver.onAccountContactsEvent(AccountContactsRegistryEvent.builder().accountIds(Set.of(accountId)).build());
    }

    private void handleValidationErrors(OperatorUpdateEvent event, String correlationId, List<IntegrationEventErrorDetails> errors) {
        CompetentAuthorityEnum ca = RegistryCompetentAuthorityEnum.getCompetentAuthorityEnum(event.getRegulator()).getCompetentAuthorityEnum();
        String recipient = emailProperties.getEmail().get(ca.getCode());
        MrtmAccount account = mrtmAccountRepository.findByBusinessId(event.getEmitterId());
        Map<String, String> fields = getAccountFields(event);

        notifyActionRecipients(account, errors, fields, ContactPoint.SERVICE_DESK, event.getEmitterId(), correlationId, emailProperties.getFordway(), true);
        notifyActionRecipients(account, errors, fields, ContactPoint.METS_REGULATORS, event.getEmitterId(), correlationId, recipient, false);
        notifyInfoRecipients(account, event.getEmitterId(), fields, correlationId, errors, recipient);
    }

    private void notifyActionRecipients(Account account, List<IntegrationEventErrorDetails> errors,
                                        Map<String, String> fields, ContactPoint contactPoint,
                                        String emitterId, String correlationId, String recipient, boolean isFordway) {

        List<IntegrationEventErrorDetails> actionMetsErrors = errors
            .stream()
            .filter(error -> error.getError().getActionRecipients().contains(contactPoint))
            .toList();

        if (!actionMetsErrors.isEmpty()) {
            notifyRegistryEmailService.notifyRegulator(
                NotifyRegistryEmailServiceParams.builder()
                    .account(account)
                    .emitterId(emitterId)
                    .correlationId(correlationId)
                    .errorsForMail(actionMetsErrors)
                    .recipient(recipient)
                    .isFordway(isFordway)
                    .templateName(MrtmNotificationTemplateName.REGISTRY_INTEGRATION_RESPONSE_ERROR_ACTION_TEMPLATE)
                    .integrationPoint(INTEGRATION_POINT_KEY)
                    .fields(fields)
                    .build());
        }
    }

    private void notifyInfoRecipients(Account account, String emitterId, Map<String, String> fields,
                                      String correlationId, List<IntegrationEventErrorDetails> errors, String recipient) {

        List<IntegrationEventErrorDetails> infoMetsErrors = errors
            .stream()
            .filter(error -> error.getError().getInformationRecipients().contains(ContactPoint.METS_REGULATORS))
            .toList();

        if (!infoMetsErrors.isEmpty()) {
            notifyRegistryEmailService.notifyRegulator(
                NotifyRegistryEmailServiceParams.builder()
                    .account(account)
                    .emitterId(emitterId)
                    .correlationId(correlationId)
                    .errorsForMail(infoMetsErrors)
                    .recipient(recipient)
                    .isFordway(false)
                    .templateName(MrtmNotificationTemplateName.REGISTRY_INTEGRATION_RESPONSE_ERROR_INFO_TEMPLATE)
                    .integrationPoint(INTEGRATION_POINT_KEY)
                    .fields(fields)
                    .build());
        }
    }



    private Map<String, String> getAccountFields(OperatorUpdateEvent event) {
        Map<String, String> fields = new LinkedHashMap<>();

        fields.put(PayloadFieldsUtils.EMITTER_ID, asStringOrEmpty(event.getEmitterId()));
        fields.put(PayloadFieldsUtils.OPERATOR_ID, asStringOrEmpty(event.getOperatorId()));

        return fields;
    }

    private void storeRegistryIdSearchKeyword(MrtmAccount account, Long operatorId) {
        accountSearchAdditionalKeywordService.storeKeywordsForAccount(
            account.getId(),
            Map.of(AccountSearchKey.REGISTRY_ID.name(), String.valueOf(operatorId)));
    }

    private void sendAccountExemptEvent(Long accountId) {
        List<AccountReportingStatus> reportingYears = accountReportingStatusRepository
            .findByAccountIdOrderByYearDesc(accountId);

        reportingYears.forEach(status -> {
            accountExemptEventListenerResolver.onAccountExemptEvent(AccountExemptEvent.builder()
                .accountId(accountId)
                .year(status.getYear())
                .isExempt(!status.getStatus().equals(MrtmAccountReportingStatus.REQUIRED_TO_REPORT))
                .build());
        });
    }
}
