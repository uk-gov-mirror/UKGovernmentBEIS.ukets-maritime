package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.account.transform.RegisteredAddressStateMapper;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.EmpOperatorDetails;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.mapper.EmpReviewMapper;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;

@Service
@RequiredArgsConstructor
public class EmpIssuanceAccountDraftDataQueryService {
	
	private static final EmpReviewMapper EMP_MAPPER = Mappers.getMapper(EmpReviewMapper.class);
	private static final AddressStateMapper ADDRESS_STATE_MAPPER = Mappers.getMapper(AddressStateMapper.class);
	private static final RegisteredAddressStateMapper REGISTERED_ADDRESS_STATE_MAPPER = Mappers
			.getMapper(RegisteredAddressStateMapper.class);
	
	public EmpIssuanceAccountDraftData getAccountDraftData(EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload) {
		final EmissionsMonitoringPlanContainer empContainer = EMP_MAPPER
				.toEmissionsMonitoringPlanContainer(requestTaskPayload);

		return getAccountDraftData(empContainer);
	}

	public EmpIssuanceAccountDraftData getAccountDraftData(EmpIssuanceRequestPayload requestPayload) {
		final EmissionsMonitoringPlanContainer empContainer = EMP_MAPPER
			.toEmissionsMonitoringPlanContainer(requestPayload);

		return getAccountDraftData(empContainer);
	}

	private EmpIssuanceAccountDraftData getAccountDraftData(final EmissionsMonitoringPlanContainer empContainer) {
		final EmpOperatorDetails empOperatorDetails = empContainer.getEmissionsMonitoringPlan().getOperatorDetails();
		
		return EmpIssuanceAccountDraftData.builder()
				.name(empOperatorDetails.getOperatorName())
				.address(ADDRESS_STATE_MAPPER.toAddressState(empOperatorDetails.getContactAddress()))
				.registeredAddress(REGISTERED_ADDRESS_STATE_MAPPER
						.toRegisteredAddressState(empOperatorDetails.getOrganisationStructure().getRegisteredAddress()))
				.build();
	}
	
}
