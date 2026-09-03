package uk.gov.mrtm.api.integration.registry.setoperator.request;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
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
import uk.gov.netz.api.account.service.AccountSearchAdditionalKeywordService;
import uk.gov.netz.integration.model.IntegrationEventOutcome;
import uk.gov.netz.integration.model.error.IntegrationEventError;
import uk.gov.netz.integration.model.error.IntegrationEventErrorDetails;
import uk.gov.netz.integration.model.operator.OperatorUpdateEvent;
import uk.gov.netz.integration.model.operator.OperatorUpdateEventOutcome;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SetOperatorResponseHandlerTest {
    private static final String CORRELATION_ID = "B";
    private static final String PARENT_CORRELATION_ID = "O";
    private static final long OPERATOR_ID = 1L;
    private static final String EMITTER_ID = "emitterId";
    private static final String EMAIL = "email@email";
    private static final String FORDWAY_EMAIL = "fordwayEmail@email";
    private static final String INTEGRATION_POINT_KEY = "Set Operator ID";
    private static final String ACCOUNT_NAME = "account-name";
    private static final RegistryCompetentAuthorityEnum REGULATOR = RegistryCompetentAuthorityEnum.EA;

    @InjectMocks
    private SetOperatorResponseHandler handler;

    @Mock
    private SetOperatorSendToRegistryProducer setOperatorSendToRegistryProducer;
    @Mock
    private RegistryIntegrationEmailProperties emailProperties;
    @Mock
    private KafkaTemplate<String, OperatorUpdateEventOutcome> setOperatorKafkaTemplate;
    @Mock
    private SetOperatorRequestValidator validator;
    @Mock
    private MrtmAccountRepository mrtmAccountRepository;
    @Mock
    private EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;
    @Mock
    private MaritimeAccountUpdatedEventListenerResolver accountUpdatedRegistryListener;
    @Mock
    private NotifyRegistryEmailService notifyRegistryEmailService;
    @Mock
    private AccountReportingStatusRepository accountReportingStatusRepository;
    @Mock
    private MaritimeAccountContactsEventListenerResolver accountContactsEventListenerResolver;
    @Mock
    private MaritimeAccountExemptEventListenerResolver accountExemptEventListenerResolver;
    @Mock
    private AccountSearchAdditionalKeywordService accountSearchAdditionalKeywordService;
    @Mock
    private MrtmAccountUpdateService mrtmAccountUpdateService;

    @Test
    void handleResponse_with_errors() {
        MrtmAccount mrtmAccount = MrtmAccount.builder().name(ACCOUNT_NAME).build();
        OperatorUpdateEvent event = OperatorUpdateEvent.builder()
            .operatorId(OPERATOR_ID)
            .emitterId(EMITTER_ID)
            .regulator(REGULATOR.name())
            .build();

        IntegrationEventErrorDetails error201 = IntegrationEventErrorDetails.builder().error(IntegrationEventError.ERROR_0201).build();
        IntegrationEventErrorDetails error202 = IntegrationEventErrorDetails.builder().error(IntegrationEventError.ERROR_0202).build();
        IntegrationEventErrorDetails error203 = IntegrationEventErrorDetails.builder().error(IntegrationEventError.ERROR_0203).build();
        List<IntegrationEventErrorDetails> errorDetails = List.of(error201, error202, error203);
        OperatorUpdateEventOutcome outcome = OperatorUpdateEventOutcome.builder()
            .event(event)
            .outcome(IntegrationEventOutcome.ERROR)
            .errors(errorDetails)
            .build();
        Map<String, String> fields = Map.of(PayloadFieldsUtils.EMITTER_ID, EMITTER_ID, PayloadFieldsUtils.OPERATOR_ID, String.valueOf(OPERATOR_ID));
        NotifyRegistryEmailServiceParams actionFordwayEmailParams = NotifyRegistryEmailServiceParams.builder()
            .account(mrtmAccount)
            .emitterId(EMITTER_ID)
            .correlationId(CORRELATION_ID)
            .errorsForMail(List.of(error201))
            .recipient(FORDWAY_EMAIL)
            .isFordway(true)
            .templateName(MrtmNotificationTemplateName.REGISTRY_INTEGRATION_RESPONSE_ERROR_ACTION_TEMPLATE)
            .integrationPoint(INTEGRATION_POINT_KEY)
            .fields(fields)
            .build();
        NotifyRegistryEmailServiceParams actionEmailParams = NotifyRegistryEmailServiceParams.builder()
            .account(mrtmAccount)
            .emitterId(EMITTER_ID)
            .correlationId(CORRELATION_ID)
            .errorsForMail(List.of(error203))
            .recipient(EMAIL)
            .isFordway(false)
            .templateName(MrtmNotificationTemplateName.REGISTRY_INTEGRATION_RESPONSE_ERROR_ACTION_TEMPLATE)
            .integrationPoint(INTEGRATION_POINT_KEY)
            .fields(fields)
            .build();
        NotifyRegistryEmailServiceParams infoEmailParams = NotifyRegistryEmailServiceParams.builder()
            .account(mrtmAccount)
            .emitterId(EMITTER_ID)
            .correlationId(CORRELATION_ID)
            .errorsForMail(List.of(error201, error202))
            .recipient(EMAIL)
            .isFordway(false)
            .templateName(MrtmNotificationTemplateName.REGISTRY_INTEGRATION_RESPONSE_ERROR_INFO_TEMPLATE)
            .integrationPoint(INTEGRATION_POINT_KEY)
            .fields(fields)
            .build();

        when(emailProperties.getEmail()).thenReturn(Map.of(REGULATOR.name(), EMAIL));
        when(emailProperties.getFordway()).thenReturn(FORDWAY_EMAIL);
        when(validator.validate(event)).thenReturn(errorDetails);
        when(mrtmAccountRepository.findByBusinessId(EMITTER_ID)).thenReturn(mrtmAccount);

        handler.handleResponse(event, CORRELATION_ID, PARENT_CORRELATION_ID);


        verify(notifyRegistryEmailService).notifyRegulator(actionFordwayEmailParams);
        verify(notifyRegistryEmailService).notifyRegulator(actionEmailParams);
        verify(notifyRegistryEmailService).notifyRegulator(infoEmailParams);

        verify(emailProperties).getEmail();
        verify(emailProperties).getFordway();
        verify(validator).validate(event);
        verify(mrtmAccountRepository).findByBusinessId(EMITTER_ID);
        verify(setOperatorSendToRegistryProducer).produce(outcome, setOperatorKafkaTemplate,
                CORRELATION_ID, PARENT_CORRELATION_ID);

        verifyNoMoreInteractions(notifyRegistryEmailService, emailProperties, validator, mrtmAccountRepository, setOperatorSendToRegistryProducer);
        verifyNoInteractions(setOperatorKafkaTemplate, emissionsMonitoringPlanQueryService, accountUpdatedRegistryListener,
            accountContactsEventListenerResolver, accountExemptEventListenerResolver, accountReportingStatusRepository,
            accountSearchAdditionalKeywordService);
    }

    @ParameterizedTest
    @MethodSource
    void handleResponse_with_no_errors(MrtmAccountReportingStatus reportingStatus, boolean isExempt) {
        Long accountId = 123L;
        MrtmAccount mrtmAccount = mock(MrtmAccount.class);
        OperatorUpdateEvent event = OperatorUpdateEvent.builder()
            .operatorId(OPERATOR_ID)
            .emitterId(EMITTER_ID)
            .regulator(REGULATOR.name())
            .build();

        OperatorUpdateEventOutcome outcome = OperatorUpdateEventOutcome.builder()
            .event(event)
            .outcome(IntegrationEventOutcome.SUCCESS)
            .errors(new ArrayList<>())
            .build();

        EmissionsMonitoringPlan emissionsMonitoringPlan = mock(EmissionsMonitoringPlan.class);
        AccountUpdatedRegistryEvent updatedRegistryEvent = AccountUpdatedRegistryEvent.builder()
            .accountId(accountId)
            .emissionsMonitoringPlan(emissionsMonitoringPlan)
            .build();
        AccountExemptEvent accountExemptEvent = AccountExemptEvent.builder()
            .accountId(accountId)
            .year(Year.now())
            .isExempt(isExempt)
            .build();
        AccountReportingStatus accountReportingStatus = AccountReportingStatus.builder()
            .status(reportingStatus)
            .year(Year.now())
            .build();

        when(mrtmAccount.getId()).thenReturn(accountId);
        when(validator.validate(event)).thenReturn(new ArrayList<>());
        when(mrtmAccountRepository.findByBusinessId(EMITTER_ID)).thenReturn(mrtmAccount);
        when(emissionsMonitoringPlanQueryService.getLastestEmissionsMonitoringPlan(accountId)).thenReturn(emissionsMonitoringPlan);
        when(accountReportingStatusRepository.findByAccountIdOrderByYearDesc(accountId)).thenReturn(List.of(accountReportingStatus));

        handler.handleResponse(event, CORRELATION_ID, PARENT_CORRELATION_ID);

        verify(validator).validate(event);
        verify(mrtmAccountRepository).findByBusinessId(EMITTER_ID);
        verify(mrtmAccountUpdateService).updateAccountRegistryId(accountId, (int) OPERATOR_ID);
        verify(accountSearchAdditionalKeywordService).storeKeywordsForAccount(accountId,
            Map.of(AccountSearchKey.REGISTRY_ID.name(), String.valueOf(OPERATOR_ID)));
        verify(setOperatorSendToRegistryProducer).produce(outcome, setOperatorKafkaTemplate,
            CORRELATION_ID, PARENT_CORRELATION_ID);
        verify(emissionsMonitoringPlanQueryService).getLastestEmissionsMonitoringPlan(accountId);
        verify(accountUpdatedRegistryListener).onAccountUpdatedEvent(updatedRegistryEvent);
        verify(accountContactsEventListenerResolver).onAccountContactsEvent(AccountContactsRegistryEvent.builder().accountIds(Set.of(accountId)).build());
        verify(accountExemptEventListenerResolver).onAccountExemptEvent(accountExemptEvent);
        verify(accountReportingStatusRepository).findByAccountIdOrderByYearDesc(accountId);

        verifyNoMoreInteractions(mrtmAccount, validator,
            mrtmAccountRepository, setOperatorSendToRegistryProducer, emissionsMonitoringPlanQueryService,
            accountUpdatedRegistryListener, accountContactsEventListenerResolver, accountExemptEventListenerResolver,
            accountReportingStatusRepository, accountSearchAdditionalKeywordService, mrtmAccountUpdateService);
        verifyNoInteractions(setOperatorKafkaTemplate, notifyRegistryEmailService, emailProperties);
    }


    private static Stream<Arguments> handleResponse_with_no_errors() {
        return Stream.of(
            Arguments.of(MrtmAccountReportingStatus.REQUIRED_TO_REPORT, false),
            Arguments.of(MrtmAccountReportingStatus.EXEMPT, true)
        );
    }

    @Test
    void handleResponse_forwards_null_parent_when_inbound_parent_missing() {
        Long accountId = 123L;
        MrtmAccount mrtmAccount = mock(MrtmAccount.class);
        OperatorUpdateEvent event = OperatorUpdateEvent.builder()
            .operatorId(OPERATOR_ID)
            .emitterId(EMITTER_ID)
            .regulator(REGULATOR.name())
            .build();

        OperatorUpdateEventOutcome outcome = OperatorUpdateEventOutcome.builder()
            .event(event)
            .outcome(IntegrationEventOutcome.SUCCESS)
            .errors(new ArrayList<>())
            .build();

        when(mrtmAccount.getId()).thenReturn(accountId);
        when(validator.validate(event)).thenReturn(new ArrayList<>());
        when(mrtmAccountRepository.findByBusinessId(EMITTER_ID)).thenReturn(mrtmAccount);
        when(emissionsMonitoringPlanQueryService.getLastestEmissionsMonitoringPlan(accountId)).thenReturn(mock(EmissionsMonitoringPlan.class));
        when(accountReportingStatusRepository.findByAccountIdOrderByYearDesc(accountId)).thenReturn(new ArrayList<>());

        handler.handleResponse(event, CORRELATION_ID, null);

        verify(setOperatorSendToRegistryProducer).produce(outcome, setOperatorKafkaTemplate,
            CORRELATION_ID, null);
    }
}