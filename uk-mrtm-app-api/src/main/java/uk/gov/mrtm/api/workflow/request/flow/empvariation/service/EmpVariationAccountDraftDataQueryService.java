package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.account.transform.RegisteredAddressStateMapper;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.EmpOperatorDetails;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationMapper;

@Service
@RequiredArgsConstructor
public class EmpVariationAccountDraftDataQueryService {
	
	private static final EmpVariationMapper EMP_VARIATION_MAPPER = Mappers.getMapper(EmpVariationMapper.class);
	private static final AddressStateMapper ADDRESS_STATE_MAPPER = Mappers.getMapper(AddressStateMapper.class);
	private static final RegisteredAddressStateMapper REGISTERED_ADDRESS_STATE_MAPPER = Mappers
			.getMapper(RegisteredAddressStateMapper.class);
	
	public EmpVariationAccountDraftData getAccountDraftData(EmpVariationApplicationSubmitRequestTaskPayload requestTaskPayload) {
		final EmissionsMonitoringPlanContainer empContainer = EMP_VARIATION_MAPPER
				.toEmissionsMonitoringPlanContainer(requestTaskPayload);
		return getAccountDraftData(empContainer);
	}

	public EmpVariationAccountDraftData getAccountDraftData(EmpVariationRequestPayload requestPayload) {
		final EmissionsMonitoringPlanContainer empContainer =
                EMP_VARIATION_MAPPER.toEmissionsMonitoringPlanContainer(
                        requestPayload);
		return getAccountDraftData(empContainer);
	}

	private EmpVariationAccountDraftData getAccountDraftData(final EmissionsMonitoringPlanContainer empContainer) {
		final EmpOperatorDetails empOperatorDetails = empContainer.getEmissionsMonitoringPlan().getOperatorDetails();
		
		return EmpVariationAccountDraftData.builder()
				.name(empOperatorDetails.getOperatorName())
				.address(ADDRESS_STATE_MAPPER.toAddressState(empOperatorDetails.getContactAddress()))
				.registeredAddress(REGISTERED_ADDRESS_STATE_MAPPER
						.toRegisteredAddressState(empOperatorDetails.getOrganisationStructure().getRegisteredAddress()))
				.build();
	}
	
}
