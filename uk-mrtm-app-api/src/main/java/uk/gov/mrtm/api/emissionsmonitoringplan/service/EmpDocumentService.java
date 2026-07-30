package uk.gov.mrtm.api.emissionsmonitoringplan.service;

import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.stereotype.Service;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.files.documents.service.storage.FileDocumentStorageService;
import uk.gov.netz.api.token.FileToken;


@Service
@RequiredArgsConstructor
public class EmpDocumentService {

    private final EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;
    private final FileDocumentStorageService fileDocumentStorageService;

    public FileToken generateGetFileDocumentToken(final String empId, final UUID documentUuid) {
		boolean exists = emissionsMonitoringPlanQueryService.existsContainerByIdAndFileDocumentUuid(empId,
				documentUuid.toString());

        if (!exists) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        
        return fileDocumentStorageService.generateGetFileDocumentToken(documentUuid.toString());
    }
}
