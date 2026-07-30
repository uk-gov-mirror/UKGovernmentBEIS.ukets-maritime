package uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.EmpOperatorDetails;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestInfo;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.netz.api.common.config.MapperConfig;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.workflow.request.core.domain.Request;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring", config = MapperConfig.class)
public interface EmpVariationMapper {

	EmissionsMonitoringPlanContainer toEmissionsMonitoringPlanContainer(
			EmpVariationApplicationSubmitRequestTaskPayload taskPayload);
	
	@Mapping(target = "payloadType", source = "payloadType")
	EmpVariationApplicationSubmitRequestTaskPayload toEmpVariationApplicationSubmitRequestTaskPayload(
		EmpVariationRequestPayload requestPayload, String payloadType);

	@Mapping(target = "operatorDetails.attachmentIds", ignore = true)
	@Mapping(target = "operatorDetails.aerRelatedAttachmentIds", ignore = true)
	@Mapping(target = "empSectionAttachmentIds", ignore = true)
	@Mapping(target = "emissions.attachmentIds", ignore = true)
	EmissionsMonitoringPlan cloneEmissionsMonitoringPlan(EmissionsMonitoringPlan source,
														 String operatorName,
														 AddressStateDTO contactAddress);

	@AfterMapping
	default void setOperatorDetails(@MappingTarget EmissionsMonitoringPlan emissionsMonitoringPlan,
									String operatorName, AddressStateDTO contactAddress) {
		EmpOperatorDetails operatorDetails = emissionsMonitoringPlan.getOperatorDetails();
		operatorDetails.setOperatorName(operatorName);
		operatorDetails.setContactAddress(contactAddress);
	}

	@Mapping(target = "emissionsMonitoringPlan.operatorDetails.attachmentIds", ignore = true)
	@Mapping(target = "emissionsMonitoringPlan.operatorDetails.aerRelatedAttachmentIds", ignore = true)
	@Mapping(target = "emissionsMonitoringPlan.empSectionAttachmentIds", ignore = true)
	EmissionsMonitoringPlanContainer toEmissionsMonitoringPlanContainer(
			EmpVariationRequestPayload requestPayload);
	
	@Deprecated
	@Mapping(target = "endDate", source = "endDate")
	EmpVariationRequestInfo toEmpVariationRequestInfo(Request request, LocalDateTime endDate);

	EmpVariationRequestInfo toEmpVariationRequestInfo(Request request);

	@AfterMapping
	default void setMetadata(@MappingTarget EmpVariationRequestInfo empVariationRequestInfo, Request request) {
		EmpVariationRequestMetadata requestMetadata = (EmpVariationRequestMetadata) request.getMetadata();
		empVariationRequestInfo.setMetadata(requestMetadata);

		// In case of regulator led variation the submission date is the date the request was created
		if (RoleTypeConstants.REGULATOR.equals(requestMetadata.getInitiatorRoleType())) {
			empVariationRequestInfo.setSubmissionDate(request.getCreationDate());
		}
	}
	
}
