package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationMapper;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.InitializeRequestTaskHandler;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class EmpVariationApplicationSubmitInitializer implements InitializeRequestTaskHandler {

	private final MrtmAccountQueryService mrtmAccountQueryService;
	private final EmissionsMonitoringPlanQueryService empQueryService;
	private final EmpVariationMapper empVariationMapper = Mappers.getMapper(EmpVariationMapper.class);
	private static final AddressStateMapper addressStateMapper = Mappers.getMapper(AddressStateMapper.class);

	@Override
	public RequestTaskPayload initializePayload(Request request) {

		EmissionsMonitoringPlanContainer empContainer =
			empQueryService.getEmissionsMonitoringPlanDTOByAccountId(request.getAccountId())
				.map(EmissionsMonitoringPlanDTO::getEmpContainer)
				.orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));;

		final MrtmAccount mrtmAccount = mrtmAccountQueryService.getAccountById(request.getAccountId());
		
		final EmissionsMonitoringPlan emp = empVariationMapper.cloneEmissionsMonitoringPlan(
			empContainer.getEmissionsMonitoringPlan(), mrtmAccount.getName(),
			addressStateMapper.toAddressStateDTO(mrtmAccount.getAddress()));
		
		return EmpVariationApplicationSubmitRequestTaskPayload.builder()
                .payloadType(MrtmRequestTaskPayloadType.EMP_VARIATION_APPLICATION_SUBMIT_PAYLOAD)
                .emissionsMonitoringPlan(emp)
                .empAttachments(empContainer.getEmpAttachments())
                .build();
	}

	@Override
	public Set<String> getRequestTaskTypes() {
		return Set.of(MrtmRequestTaskType.EMP_VARIATION_APPLICATION_SUBMIT);
	}
}
