package uk.gov.mrtm.api.workflow.request.flow.common.service.docgen.async;

import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;

public interface DocumentGenerationFinalCompletedService {

	void completed(RequestTask requestTask, RequestGeneratedFileType fileType, FileInfoDTO fileInfoDTO);
	
	String getRequestType();
	
}
