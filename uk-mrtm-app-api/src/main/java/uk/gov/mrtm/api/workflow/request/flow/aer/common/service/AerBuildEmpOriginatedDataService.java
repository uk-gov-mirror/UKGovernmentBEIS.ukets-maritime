package uk.gov.mrtm.api.workflow.request.flow.aer.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.EmpOperatorDetails;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.EmpOriginatedData;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AerBuildEmpOriginatedDataService {
	
	private final EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;
	private final MrtmAccountQueryService mrtmAccountQueryService;
	private final AddressStateMapper addressStateMapper;

	public EmpOriginatedData build(Long accountId) {
		final Optional<EmissionsMonitoringPlanDTO> empOpt =
                emissionsMonitoringPlanQueryService.getEmissionsMonitoringPlanDTOByAccountId(accountId);

		final MrtmAccount accountInfo = mrtmAccountQueryService.getAccountById(accountId);

		
		final EmpOperatorDetails empOperatorDetail = empOpt
                .map(EmissionsMonitoringPlanDTO::getEmpContainer)
                .map(EmissionsMonitoringPlanContainer::getEmissionsMonitoringPlan)
                .map(EmissionsMonitoringPlan::getOperatorDetails).orElse(EmpOperatorDetails.builder().build());

		empOperatorDetail.setOperatorName(accountInfo.getName());
		empOperatorDetail.setImoNumber(accountInfo.getImoNumber());
		empOperatorDetail.setContactAddress(addressStateMapper.toAddressStateDTO(accountInfo.getAddress()));

		final EmpOriginatedData empOriginatedData = EmpOriginatedData.builder()
				.operatorDetails(empOperatorDetail)
				.build();

		if(empOpt.isPresent()) {
			final EmissionsMonitoringPlanContainer empContainer = empOpt.get().getEmpContainer();
			final Map<UUID, String> empOriginatedOperatorDetailsAttachments = new HashMap<>(
					empContainer.getEmpAttachments());
			empOriginatedOperatorDetailsAttachments.keySet()
					.retainAll(empContainer.getEmissionsMonitoringPlan().getOperatorDetails().getAerRelatedAttachmentIds());
			empOriginatedData.setOperatorDetailsAttachments(empOriginatedOperatorDetailsAttachments);
		}

		return empOriginatedData;
	}
	
}
