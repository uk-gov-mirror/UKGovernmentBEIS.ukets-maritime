package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.validation.EmpValidatorService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationMapper;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationSubmitMapper;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.validator.EmpVariationDetailsValidator;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestService;

@Service
@RequiredArgsConstructor
public class EmpVariationSubmitService {

	private final RequestService requestService;
	private final EmpValidatorService empValidatorService;
	private final EmpVariationDetailsValidator empVariationDetailsValidator;
	private final MrtmAccountQueryService accountQueryService;

	private static final EmpVariationMapper EMP_VARIATION_MAPPER = Mappers.getMapper(EmpVariationMapper.class);
	private static final EmpVariationSubmitMapper EMP_VARIATION_SUBMIT_MAPPER = Mappers.getMapper(EmpVariationSubmitMapper.class);

	private static final AddressStateMapper addressStateMapper = Mappers.getMapper(AddressStateMapper.class);

	@Transactional
	public void saveEmpVariation(
		EmpVariationSaveApplicationRequestTaskActionPayload taskActionPayload, RequestTask requestTask) {
		EmpVariationApplicationSubmitRequestTaskPayload taskPayload =
			(EmpVariationApplicationSubmitRequestTaskPayload) requestTask.getPayload();
		taskPayload.setEmissionsMonitoringPlan(taskActionPayload.getEmissionsMonitoringPlan());
		taskPayload.setEmpVariationDetails(taskActionPayload.getEmpVariationDetails());
		taskPayload.setEmpVariationDetailsCompleted(taskActionPayload.getEmpVariationDetailsCompleted());
		taskPayload.setEmpSectionsCompleted(taskActionPayload.getEmpSectionsCompleted());
		taskPayload.setUpdatedSubtasks(taskActionPayload.getUpdatedSubtasks());
	}

	@Transactional
	public void submitEmpVariation(RequestTask requestTask, AppUser appUser) {
		EmpVariationApplicationSubmitRequestTaskPayload taskPayload = (EmpVariationApplicationSubmitRequestTaskPayload) requestTask
				.getPayload();
		Request request = requestTask.getRequest();

		EmissionsMonitoringPlanContainer empContainer =
				EMP_VARIATION_MAPPER.toEmissionsMonitoringPlanContainer(taskPayload);

		//validate EMP
		empValidatorService.validateEmissionsMonitoringPlan(empContainer, request.getAccountId());
		//validate EMP variation details
		empVariationDetailsValidator.validate(taskPayload.getEmpVariationDetails());

		//save EMP to request payload
		EmpVariationRequestPayload requestPayload = (EmpVariationRequestPayload) request.getPayload();
		requestPayload.setEmissionsMonitoringPlan(taskPayload.getEmissionsMonitoringPlan());
		requestPayload.setEmpVariationDetails(taskPayload.getEmpVariationDetails());
		requestPayload.setEmpVariationDetailsCompleted(taskPayload.getEmpVariationDetailsCompleted());
		requestPayload.setEmpAttachments(taskPayload.getEmpAttachments());
		requestPayload.setEmpSectionsCompleted(taskPayload.getEmpSectionsCompleted());
		requestPayload.setUpdatedSubtasks(taskPayload.getUpdatedSubtasks());

		//add request action
		addEmpVariationApplicationSubmittedRequestAction(appUser, taskPayload, request);
	}

	private void addEmpVariationApplicationSubmittedRequestAction(AppUser appUser,
																	   EmpVariationApplicationSubmitRequestTaskPayload taskPayload, Request request) {

		final MrtmAccount mrtmAccount = accountQueryService.getAccountById(request.getAccountId());

		EmpVariationApplicationSubmittedRequestActionPayload actionPayload = EMP_VARIATION_SUBMIT_MAPPER
				.toEmpVariationApplicationSubmittedRequestActionPayload(taskPayload, mrtmAccount.getName(),
						addressStateMapper.toAddressStateDTO(mrtmAccount.getAddress()));

		requestService.addActionToRequest(request, actionPayload, MrtmRequestActionType.EMP_VARIATION_APPLICATION_SUBMITTED, appUser.getUserId());
	}
}
