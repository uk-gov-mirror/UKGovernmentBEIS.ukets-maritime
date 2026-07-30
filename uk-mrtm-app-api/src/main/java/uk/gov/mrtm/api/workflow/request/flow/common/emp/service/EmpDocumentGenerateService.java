package uk.gov.mrtm.api.workflow.request.flow.common.emp.service;

import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

public interface EmpDocumentGenerateService {

	String generateDocument(RequestGeneratedFileType type, Long requestTaskId, DocumentTemplateStage stage,
			DecisionNotification decisionNotification);
	
	String getRequestType();
	
}
