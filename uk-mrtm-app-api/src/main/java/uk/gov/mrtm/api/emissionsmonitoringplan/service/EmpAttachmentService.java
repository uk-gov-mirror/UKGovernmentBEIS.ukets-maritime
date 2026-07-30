package uk.gov.mrtm.api.emissionsmonitoringplan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.files.attachments.service.storage.FileAttachmentStorageService;
import uk.gov.netz.api.token.FileToken;

import java.util.UUID;

@RequiredArgsConstructor
@Service
public class EmpAttachmentService {

    private final EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;
    private final FileAttachmentStorageService fileAttachmentStorageService;

    public FileToken generateGetFileAttachmentToken(String empId, UUID attachmentUuid) {
        EmissionsMonitoringPlanContainer empContainer = emissionsMonitoringPlanQueryService.getEmpContainerById(empId);

        //validate
        if (!empContainer.getEmpAttachments().containsKey(attachmentUuid)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, attachmentUuid);
        }

        return fileAttachmentStorageService.generateGetFileAttachmentToken(attachmentUuid.toString());
    }

}
