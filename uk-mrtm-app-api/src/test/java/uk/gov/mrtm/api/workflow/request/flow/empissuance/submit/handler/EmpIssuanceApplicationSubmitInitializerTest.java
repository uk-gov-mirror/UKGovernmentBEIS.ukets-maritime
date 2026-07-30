package uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.account.domain.MrtmEmissionTradingScheme;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.common.domain.AddressState;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceApplicationSubmitRequestTaskPayload;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceApplicationSubmitInitializerTest {

    @InjectMocks
    private EmpIssuanceApplicationSubmitInitializer initializer;

    @Mock
    private MrtmAccountQueryService mrtmAccountQueryService;

    @Spy 
    private AddressStateMapper addressStateMapper = Mappers.getMapper(AddressStateMapper.class);

    @Test
    void initializePayload() {
        Long accountId = 1L;
        Request request = Request.builder().requestResources(List.of(RequestResource.builder().resourceId(String.valueOf(accountId)).resourceType(ResourceType.ACCOUNT).build())).build();

        when(addressStateMapper.toAddressStateDTO(createAddress("line1", "line2", "city", "GR", "state", "postcode"))).thenReturn(createAddressDTO("line1", "line2", "city", "GR", "state", "postcode"));
        when(mrtmAccountQueryService.getAccountById(accountId)).thenReturn(createMrtmAccount());

        EmpIssuanceApplicationSubmitRequestTaskPayload requestTaskPayload =
                (EmpIssuanceApplicationSubmitRequestTaskPayload) initializer.initializePayload(request);

        assertEquals(MrtmRequestTaskPayloadType.EMP_ISSUANCE_APPLICATION_SUBMIT_PAYLOAD, requestTaskPayload.getPayloadType());
        assertNotNull(requestTaskPayload.getEmissionsMonitoringPlan());
        assertEquals(requestTaskPayload.getEmissionsMonitoringPlan().getOperatorDetails().getImoNumber(), createMrtmAccount().getImoNumber());
        assertEquals(requestTaskPayload.getEmissionsMonitoringPlan().getOperatorDetails().getOperatorName(), createMrtmAccount().getName());
        assertEquals(requestTaskPayload.getEmissionsMonitoringPlan().getOperatorDetails().getContactAddress(), addressStateMapper.toAddressStateDTO(createMrtmAccount().getAddress()));

        verify(addressStateMapper, atLeast(2)).toAddressStateDTO(createAddress("line1", "line2", "city", "GR", "state", "postcode"));
        verify(mrtmAccountQueryService).getAccountById(accountId);
        verifyNoMoreInteractions(addressStateMapper, mrtmAccountQueryService);
    }

    @Test
    void getRequestTaskTypes() {
        assertThat(initializer.getRequestTaskTypes()).containsOnly(MrtmRequestTaskType.EMP_ISSUANCE_APPLICATION_SUBMIT);
    }

    private MrtmAccount createMrtmAccount() {
        return MrtmAccount.builder()
                .imoNumber("1234567")
                .status(MrtmAccountStatus.NEW)
                .emissionTradingScheme(MrtmEmissionTradingScheme.UK_MARITIME_EMISSION_TRADING_SCHEME)
                .address(createAddress("line1", "line2", "city", "GR", "state", "postcode"))
                .firstMaritimeActivityDate(LocalDate.now())
                .build();
    }

    private AddressState createAddress(String line1, String line2, String city, String country, String state, String postcode) {
        return AddressState.builder()
                .line1(line1)
                .line2(line2)
                .city(city)
                .country(country)
                .state(state)
                .postcode(postcode)
                .build();
    }

    private AddressStateDTO createAddressDTO(String line1, String line2, String city, String country, String state, String postcode) {
        return AddressStateDTO.builder()
                .line1(line1)
                .line2(line2)
                .city(city)
                .country(country)
                .state(state)
                .postcode(postcode)
                .build();
    }
}
