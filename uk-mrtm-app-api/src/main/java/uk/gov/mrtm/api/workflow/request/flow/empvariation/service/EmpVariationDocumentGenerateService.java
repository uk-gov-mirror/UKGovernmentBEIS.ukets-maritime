package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.service.EmpDocumentGenerateService;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

@Log4j2
@Component
@RequiredArgsConstructor
public class EmpVariationDocumentGenerateService implements EmpDocumentGenerateService {

	private final EmpVariationCreateEmpDocumentService empVariationCreateEmpDocumentService;
    private final EmpVariationOfficialNoticeService empVariationOfficialNoticeService;

    @Override
	public String generateDocument(RequestGeneratedFileType type, Long requestTaskId, DocumentTemplateStage stage,
			DecisionNotification decisionNotification) {
		String asyncJobId = null;
		switch (type) {
		case EMP:{
			asyncJobId = empVariationCreateEmpDocumentService.createAsyncConvert(requestTaskId, stage, decisionNotification);
			break;
		}
		case OFFICIAL_NOTICE:{
			asyncJobId = empVariationOfficialNoticeService.generateOfficialNoticeAsyncConvert(requestTaskId, stage, decisionNotification);
			break;
		}
		default:
			throw new IllegalArgumentException("Unknown type: " + type);
		}
		
		return asyncJobId;
    }
    
    @Override
    public String getRequestType() {
    	return MrtmRequestType.EMP_VARIATION;
    }
}
