package uk.gov.mrtm.api.emissionsmonitoringplan.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.files.documents.service.storage.FileDocumentStorageService;
import uk.gov.netz.api.token.FileToken;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static uk.gov.netz.api.common.exception.ErrorCode.RESOURCE_NOT_FOUND;

@ExtendWith(MockitoExtension.class)
class EmpDocumentServiceTest {
    private static final String EMP_ID = "empId";
    private static final UUID DOCUMENT_UUID = UUID.randomUUID();

    @InjectMocks
    private EmpDocumentService empDocumentService;

    @Mock
    private EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;

    @Mock
    private FileDocumentStorageService fileDocumentStorageService;

    @Test
    void generateGetFileDocumentToken() {
        FileToken fileToken = mock(FileToken.class);

        when(emissionsMonitoringPlanQueryService
            .existsContainerByIdAndFileDocumentUuid(EMP_ID, DOCUMENT_UUID.toString())).thenReturn(true);
        when(fileDocumentStorageService.generateGetFileDocumentToken(DOCUMENT_UUID.toString())).thenReturn(fileToken);

        FileToken actual = empDocumentService.generateGetFileDocumentToken(EMP_ID, DOCUMENT_UUID);

        assertThat(actual).isEqualTo(fileToken);
        verifyNoMoreInteractions(emissionsMonitoringPlanQueryService, fileDocumentStorageService);
    }

    @Test
    void generateGetFileDocumentToken_throws_exception() {
        when(emissionsMonitoringPlanQueryService
            .existsContainerByIdAndFileDocumentUuid(EMP_ID, DOCUMENT_UUID.toString())).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class,
            () -> empDocumentService.generateGetFileDocumentToken(EMP_ID, DOCUMENT_UUID));

        assertEquals(RESOURCE_NOT_FOUND, exception.getErrorCode());

        verifyNoMoreInteractions(emissionsMonitoringPlanQueryService);
        verifyNoInteractions(fileDocumentStorageService);
    }
}