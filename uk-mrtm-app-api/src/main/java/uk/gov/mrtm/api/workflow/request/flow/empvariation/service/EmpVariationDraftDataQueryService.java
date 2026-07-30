package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import java.util.Objects;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestInfo;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.common.utils.DateService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;

@Service
@RequiredArgsConstructor
public class EmpVariationDraftDataQueryService {
	
	private final DateService dateService;
	
	public EmpVariationRequestInfo getEmpVariationDraftData(RequestTask requestTask, int nextConsolidationNumber) {
		final Request request = requestTask.getRequest();
		final EmpVariationRequestMetadata requestMetadata = (EmpVariationRequestMetadata) request.getMetadata();
		
		return EmpVariationRequestInfo.builder()
				.id(request.getId())
				.submissionDate(RoleTypeConstants.REGULATOR.equals(requestMetadata.getInitiatorRoleType())
						? request.getCreationDate()
						: request.getSubmissionDate())
				.endDate(dateService.getLocalDateTime())
				.metadata(EmpVariationRequestMetadata.builder()
        				.empConsolidationNumber(nextConsolidationNumber)
        				.type(requestMetadata.getType())
        				.initiatorRoleType(requestMetadata.getInitiatorRoleType())
						.summary(RoleTypeConstants.REGULATOR.equals(requestMetadata.getInitiatorRoleType())
								? getEmpVariationDeterminationRegulatorLedSummary(
										(EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload) requestTask
												.getPayload())
								: getEmpVariationDeterminationSummary(
										(EmpVariationApplicationReviewRequestTaskPayload) requestTask.getPayload()))
        				.build())
				.build();
	}
	
	public String getEmpVariationDeterminationRegulatorLedSummary(
			EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload requestTaskPayload) {
		return requestTaskPayload.getReasonRegulatorLed() != null
				? Objects.requireNonNullElse(requestTaskPayload.getReasonRegulatorLed().getSummary(), "")
				: "";
	}
	
	public String getEmpVariationDeterminationSummary(
			EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload) {
		return requestTaskPayload.getDetermination() != null
				? Objects.requireNonNullElse(requestTaskPayload.getDetermination().getSummary(), "")
				: "";
	}
	
	public String getEmpVariationDeterminationSummary(Request request) {
		EmpVariationRequestPayload requestPayload = (EmpVariationRequestPayload) request.getPayload();
		EmpVariationRequestMetadata requestMetadata = (EmpVariationRequestMetadata) request.getMetadata();
		return RoleTypeConstants.REGULATOR.equals(requestMetadata.getInitiatorRoleType())
				? (requestPayload.getReasonRegulatorLed() != null
						? Objects.requireNonNullElse(requestPayload.getReasonRegulatorLed().getSummary(), "")
						: "")
				: (requestPayload.getDetermination() != null
						? Objects.requireNonNullElse(requestPayload.getDetermination().getSummary(), "")
						: "");
	}
	
}
