package uk.gov.mrtm.api.workflow.request.flow.common.emp.handler;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.event.EmpReviewDocumentGenerateDto;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.service.EmpDocumentGenerateService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

@Log4j2
@Component
@RequiredArgsConstructor
public class EmpReviewDocumentGenerateService {
	
	private final RequestTaskService requestTaskService;
    private final List<EmpDocumentGenerateService> services;

	@Transactional
	public String generate(EmpReviewDocumentGenerateDto dto) {
		final Long requestTaskId = dto.getRequestTaskId();
		final String requestType = requestTaskService.findTaskById(requestTaskId).getRequest().getType().getCode();
		
		final EmpDocumentGenerateService service = services.stream().filter(s -> requestType.equals(s.getRequestType()))
			.findFirst()
			.orElseThrow(() -> new IllegalArgumentException("Document generate service not found for request type: " + requestType));
		
		final String asyncJobId = service.generateDocument(dto.getType(), dto.getRequestTaskId(),
				dto.getStage(), dto.getDecisionNotification());
		
		log.info("File with process id {} is being generated asynchronously for request task id {} and type {}",
				asyncJobId, requestTaskId, dto.getType());
		
		return asyncJobId;
	}
}
