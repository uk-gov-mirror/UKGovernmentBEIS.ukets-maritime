package uk.gov.mrtm.api.workflow.request.flow.aer.submit.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.dto.AccountReportingStatusDTO;
import uk.gov.mrtm.api.account.enumeration.MrtmAccountReportingStatus;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.account.service.reportingstatus.AccountReportingStatusQueryService;
import uk.gov.mrtm.api.common.domain.AddressState;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;
import uk.gov.mrtm.api.reporting.domain.Aer;
import uk.gov.mrtm.api.reporting.domain.AerOperatorDetails;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerMonitoringPlanVersion;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.EmpOriginatedData;
import uk.gov.mrtm.api.workflow.request.flow.aer.submit.domain.AerApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.submit.handler.AerApplicationSubmitInitializer;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;

import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AerApplicationSubmitInitializerTest {

    @InjectMocks
    private AerApplicationSubmitInitializer cut;

    @Mock
    private MrtmAccountQueryService mrtmAccountQueryService;

    @Mock
    private AccountReportingStatusQueryService accountReportingStatusQueryService;

    @Test
    void initializeTaskPayload_aer_does_not_exist() {
        Map<String, String> sectionsCompleted = Map.of("Section A", "completed");
        Map<UUID, String> aerAttachments = Map.of(UUID.randomUUID(), "attachment");
        long accountId = 1L;
        Year year = Year.now();
        AerRequestMetadata requestMetadata = AerRequestMetadata.builder().year(year).build();
        EmpOriginatedData empOriginatedData = mock(EmpOriginatedData.class);
        AerMonitoringPlanVersion aerMonitoringPlanVersion = mock(AerMonitoringPlanVersion.class);
        Request request = Request.builder()
            .payload(AerRequestPayload.builder()
                .empOriginatedData(empOriginatedData)
                .aerSubmitSectionsCompleted(sectionsCompleted)
                .aerMonitoringPlanVersion(aerMonitoringPlanVersion)
                .aerAttachments(aerAttachments)
                .build()
            )
            .metadata(AerRequestMetadata.builder().year(year).build())
            .id("1").requestResources(List.of(
            RequestResource
                .builder()
                .resourceId(String.valueOf(accountId))
                .resourceType(ResourceType.ACCOUNT)
                .build()))
            .build();

        when(mrtmAccountQueryService.getAccountById(accountId)).thenReturn(MrtmAccount.builder().id(accountId).build());
        when(accountReportingStatusQueryService.getReportingStatusByYear(accountId, requestMetadata.getYear()))
                .thenReturn(AccountReportingStatusDTO.builder().status(MrtmAccountReportingStatus.REQUIRED_TO_REPORT).build());

        AerApplicationSubmitRequestTaskPayload expectedTaskPayload = AerApplicationSubmitRequestTaskPayload.builder()
            .payloadType(MrtmRequestTaskPayloadType.AER_APPLICATION_SUBMIT_PAYLOAD)
            .sendEmailNotification(true)
            .reportingYear(year)
            .aerAttachments(aerAttachments)
            .aerSectionsCompleted(sectionsCompleted)
            .empOriginatedData(empOriginatedData)
            .aerMonitoringPlanVersion(aerMonitoringPlanVersion)
            .build();

        AerApplicationSubmitRequestTaskPayload actualTaskPayload = (AerApplicationSubmitRequestTaskPayload) cut.initializePayload(request);

        assertEquals(expectedTaskPayload, actualTaskPayload);
        verify(mrtmAccountQueryService).getAccountById(accountId);
        verifyNoMoreInteractions(mrtmAccountQueryService);
    }

    @Test
    void initializeTaskPayload_aer_exists() {
        Map<String, String> sectionsCompleted = Map.of("Section A", "completed");
        Map<UUID, String> aerAttachments = Map.of(UUID.randomUUID(), "attachment");
        long accountId = 1L;
        Year year = Year.now();
        EmpOriginatedData empOriginatedData = mock(EmpOriginatedData.class);
        AerMonitoringPlanVersion aerMonitoringPlanVersion = mock(AerMonitoringPlanVersion.class);
        AddressState newAddress = AddressState.builder()
            .line1("line1")
            .line2("line2")
            .country("country")
            .city("city")
            .postcode("postcode")
            .state("state")
            .build();

        AddressStateDTO oldAddressDto = mock(AddressStateDTO.class);
        AddressStateDTO newAddressDto = mock(AddressStateDTO.class);
        Aer aer = Aer.builder()
            .operatorDetails(
                AerOperatorDetails
                    .builder()
                    .operatorName("old name")
                    .contactAddress(oldAddressDto)
                    .build())
            .build();

        Request request = Request.builder()
            .payload(AerRequestPayload.builder()
                .empOriginatedData(empOriginatedData)
                .aer(aer)
                .aerSubmitSectionsCompleted(sectionsCompleted)
                .aerMonitoringPlanVersion(aerMonitoringPlanVersion)
                .aerAttachments(aerAttachments)
                .build()
            )
            .metadata(AerRequestMetadata.builder().year(year).build())
            .id("1").requestResources(List.of(
                RequestResource
                    .builder()
                    .resourceId(String.valueOf(accountId))
                    .resourceType(ResourceType.ACCOUNT)
                    .build()))
            .build();

        when(mrtmAccountQueryService.getAccountById(accountId)).thenReturn(MrtmAccount.builder().id(accountId).address(newAddress).build());
        when(accountReportingStatusQueryService.getReportingStatusByYear(accountId, year)).thenReturn(AccountReportingStatusDTO.builder().accountId(accountId).build());

        RequestTaskPayload expectedTaskPayload = AerApplicationSubmitRequestTaskPayload.builder()
            .payloadType(MrtmRequestTaskPayloadType.AER_APPLICATION_SUBMIT_PAYLOAD)
            .sendEmailNotification(true)
            .reportingYear(year)
            .aer(aer)
            .aerAttachments(aerAttachments)
            .aerSectionsCompleted(sectionsCompleted)
            .empOriginatedData(empOriginatedData)
            .aerMonitoringPlanVersion(aerMonitoringPlanVersion)
            .build();

        RequestTaskPayload actualTaskPayload = cut.initializePayload(request);

        assertEquals(expectedTaskPayload, actualTaskPayload);
        verify(mrtmAccountQueryService).getAccountById(accountId);
        verifyNoMoreInteractions(mrtmAccountQueryService);
    }

    @Test
    void getRequestTaskTypes() {
        assertThat(cut.getRequestTaskTypes()).containsOnly(MrtmRequestTaskType.AER_APPLICATION_SUBMIT);
    }
}
