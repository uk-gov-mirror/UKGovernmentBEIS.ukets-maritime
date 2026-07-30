package uk.gov.mrtm.api.workflow.request.flow.common.domain;

import java.util.Map;

import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileInfoDTO;

public interface RequestTaskDocumentAsyncGeneratedDataPayload {
    
    void setFinalDocumentsGenerationInProgress(Boolean finalDocumentsGenerationInProgress);
    
    void setFinalDocumentsGenerationSuccessful(Boolean finalDocumentsGenerationSuccessful);
    
    Map<RequestGeneratedFileType, RequestTaskPreviewFileInfoDTO> getPreviewFiles();
    
    boolean canPreviewOfficialDocument();
    
}
