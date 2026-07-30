package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.service.EmpDocumentGenerateService;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

@Log4j2
@Component
@RequiredArgsConstructor
public class EmpIssuanceDocumentGenerateService implements EmpDocumentGenerateService {

	private final EmpIssuanceCreateEmpDocumentService empIssuanceCreateEmpDocumentService;
    private final EmpIssuanceOfficialNoticeService empIssuanceOfficialNoticeService;

    @Override
	public String generateDocument(RequestGeneratedFileType type, Long requestTaskId, DocumentTemplateStage stage,
			DecisionNotification decisionNotification) {
		String asyncJobId;

        switch (type) {
            case EMP -> asyncJobId = empIssuanceCreateEmpDocumentService.createAsyncConvert(requestTaskId, stage, decisionNotification);
            case OFFICIAL_NOTICE -> asyncJobId = empIssuanceOfficialNoticeService.generateOfficialNoticeAsyncConvert(requestTaskId, stage, decisionNotification);
            default -> throw new IllegalArgumentException("Unknown type: " + type);
        }
		
		return asyncJobId;
    }
    
    @Override
    public String getRequestType() {
    	return MrtmRequestType.EMP_ISSUANCE;
    }
}
