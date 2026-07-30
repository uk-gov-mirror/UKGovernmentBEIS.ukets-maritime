package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.account.transform.RegisteredAddressStateMapper;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.EmpOperatorDetails;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.LimitedCompanyOrganisation;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;

@ExtendWith(MockitoExtension.class)
class EmpVariationAccountDraftDataQueryServiceTest {

	@InjectMocks
    private EmpVariationAccountDraftDataQueryService cut;
	
	@Test
    void getAccountDraftData_by_request_task_payload() {
    	EmissionsMonitoringPlan emp = EmissionsMonitoringPlan.builder()
				.operatorDetails(EmpOperatorDetails.builder()
						.contactAddress(AddressStateDTO.builder()
								.city("city")
								.build())
						.organisationStructure(LimitedCompanyOrganisation.builder()
								.registeredAddress(AddressStateDTO.builder()
										.city("city2")
										.build())
								.build())
						.build())
				.build();
    	EmpVariationApplicationSubmitRequestTaskPayload requestTaskPayload = EmpVariationApplicationSubmitRequestTaskPayload.builder()
    			.emissionsMonitoringPlan(emp)
    			.build();
    	
    	var result = cut.getAccountDraftData(requestTaskPayload);
    	
		assertThat(result).isEqualTo(EmpVariationAccountDraftData.builder()
				.name(emp.getOperatorDetails().getOperatorName())
				.registeredAddress(Mappers.getMapper(RegisteredAddressStateMapper.class).toRegisteredAddressState(
						emp.getOperatorDetails().getOrganisationStructure().getRegisteredAddress()))
				.address(Mappers.getMapper(AddressStateMapper.class)
						.toAddressState(emp.getOperatorDetails().getContactAddress()))
				.build());
    }

    @Test
    void getAccountDraftData_by_request_payload() {
    	EmissionsMonitoringPlan emp = EmissionsMonitoringPlan.builder()
				.operatorDetails(EmpOperatorDetails.builder()
						.contactAddress(AddressStateDTO.builder()
								.city("city")
								.build())
						.organisationStructure(LimitedCompanyOrganisation.builder()
								.registeredAddress(AddressStateDTO.builder()
										.city("city2")
										.build())
								.build())
						.build())
				.build();
    	EmpVariationRequestPayload requestPayload = EmpVariationRequestPayload.builder()
    			.emissionsMonitoringPlan(emp)
    			.build();
    	
    	var result = cut.getAccountDraftData(requestPayload);
    	
		assertThat(result).isEqualTo(EmpVariationAccountDraftData.builder()
				.name(emp.getOperatorDetails().getOperatorName())
				.registeredAddress(Mappers.getMapper(RegisteredAddressStateMapper.class).toRegisteredAddressState(
						emp.getOperatorDetails().getOrganisationStructure().getRegisteredAddress()))
				.address(Mappers.getMapper(AddressStateMapper.class)
						.toAddressState(emp.getOperatorDetails().getContactAddress()))
				.build());
    }
}
