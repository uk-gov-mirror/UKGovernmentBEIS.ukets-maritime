package uk.gov.mrtm.api.workflow.request.flow.aer.common.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.common.domain.AddressState;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.EmpOperatorDetails;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.OrganisationStructure;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.EmpOriginatedData;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AerBuildEmpOriginatedDataServiceTest {

    @InjectMocks
    private AerBuildEmpOriginatedDataService cut;

    @Mock
    private EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;

    @Mock
    private MrtmAccountQueryService mrtmAccountQueryService;

    @Mock
    private AddressStateMapper addressStateMapper;

    @Test
    void build_emp_exists() {
        Long accountId = 1L;

        UUID uuid = UUID.randomUUID();
        UUID uuid2 = UUID.randomUUID();
        Map<UUID,String> empAttachments = Map.of(
            uuid, "fileName",
            uuid2, "fileName2",
            UUID.randomUUID(), "anotherFileName");

        OrganisationStructure organisationStructure = mock(OrganisationStructure.class);
        when(organisationStructure.getAttachmentIds()).thenReturn(Set.of(uuid2));

        EmissionsMonitoringPlanDTO emp = EmissionsMonitoringPlanDTO.builder()
            .empContainer(EmissionsMonitoringPlanContainer.builder()
                .emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
                    .operatorDetails(EmpOperatorDetails.builder()
                        .operatorName("operatorName")
                        .imoNumber("7654321")
                        .contactAddress(mock(AddressStateDTO.class))
                        .organisationStructure(organisationStructure)
                        .activityDescription("activityDescription")
                        .build())
                    .build())
                .empAttachments(empAttachments)
                .build())
            .build();

        AddressState addressState = AddressState.builder()
            .line1("line1")
            .line2("line2")
            .country("country")
            .city("city")
            .postcode("postcode")
            .state("state")
            .build();

        AddressStateDTO addressStateDTO = mock(AddressStateDTO.class);
        MrtmAccount mrtmAccount = MrtmAccount
            .builder()
            .name("newName")
            .imoNumber("1234567")
            .address(addressState)
            .build();

        when(emissionsMonitoringPlanQueryService.getEmissionsMonitoringPlanDTOByAccountId(accountId))
            .thenReturn(Optional.of(emp));
        when(mrtmAccountQueryService.getAccountById(accountId))
            .thenReturn(mrtmAccount);
        when(addressStateMapper.toAddressStateDTO(addressState)).thenReturn(addressStateDTO);

        EmpOriginatedData expectedResult = EmpOriginatedData.builder()
            .operatorDetails(EmpOperatorDetails.builder()
                .operatorName("newName")
                .imoNumber("1234567")
                .contactAddress(addressStateDTO)
                .organisationStructure(organisationStructure)
                .activityDescription("activityDescription")
                .build())
            .operatorDetailsAttachments(Map.of(uuid2, "fileName2"))
            .build();

        EmpOriginatedData actualResult = cut.build(accountId);

        assertThat(expectedResult).isEqualTo(actualResult);

        verify(emissionsMonitoringPlanQueryService).getEmissionsMonitoringPlanDTOByAccountId(accountId);
        verify(addressStateMapper).toAddressStateDTO(addressState);
        verify(mrtmAccountQueryService).getAccountById(accountId);
        verifyNoMoreInteractions(emissionsMonitoringPlanQueryService, addressStateMapper, mrtmAccountQueryService);
    }

    @Test
    void build_no_emp_found() {
        Long accountId = 1L;

        AddressState addressState = AddressState.builder()
            .line1("line1")
            .line2("line2")
            .country("country")
            .city("city")
            .postcode("postcode")
            .state("state")
            .build();

        AddressStateDTO addressStateDTO = mock(AddressStateDTO.class);
        MrtmAccount mrtmAccount = MrtmAccount
            .builder()
            .name("newName")
            .imoNumber("1234567")
            .address(addressState)
            .build();

        when(emissionsMonitoringPlanQueryService.getEmissionsMonitoringPlanDTOByAccountId(accountId))
            .thenReturn(Optional.empty());
        when(mrtmAccountQueryService.getAccountById(accountId))
            .thenReturn(mrtmAccount);
        when(addressStateMapper.toAddressStateDTO(addressState)).thenReturn(addressStateDTO);

        EmpOriginatedData expectedResult = EmpOriginatedData.builder()
            .operatorDetails(EmpOperatorDetails.builder()
                .operatorName("newName")
                .imoNumber("1234567")
                .contactAddress(addressStateDTO)
                .build())
            .build();

        EmpOriginatedData actualResult = cut.build(accountId);

        assertThat(expectedResult).isEqualTo(actualResult);

        verify(emissionsMonitoringPlanQueryService).getEmissionsMonitoringPlanDTOByAccountId(accountId);
        verify(addressStateMapper).toAddressStateDTO(addressState);
        verify(mrtmAccountQueryService).getAccountById(accountId);
        verifyNoMoreInteractions(emissionsMonitoringPlanQueryService, addressStateMapper, mrtmAccountQueryService);
    }


}
