package uk.gov.mrtm.api.emissionsmonitoringplan.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.files.attachments.service.storage.FileAttachmentStorageService;
import uk.gov.netz.api.token.FileToken;

import java.util.Map;
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
class EmpAttachmentServiceTest {
    private static final String EMP_ID = "empId";
    private static final UUID FILE_UUID = UUID.randomUUID();

    @InjectMocks
    private EmpAttachmentService empAttachmentService;

    @Mock
    private EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;

    @Mock
    private FileAttachmentStorageService fileAttachmentStorageService;

    @Test
    void generateGetFileAttachmentToken() {
        FileToken fileToken = mock(FileToken.class);
        EmissionsMonitoringPlanContainer empContainer = EmissionsMonitoringPlanContainer
            .builder()
            .empAttachments(Map.of(FILE_UUID, "file"))
            .build();

        when(emissionsMonitoringPlanQueryService.getEmpContainerById(EMP_ID)).thenReturn(empContainer);
        when(fileAttachmentStorageService.generateGetFileAttachmentToken(FILE_UUID.toString())).thenReturn(fileToken);

        FileToken actual = empAttachmentService.generateGetFileAttachmentToken(EMP_ID, FILE_UUID);

        assertThat(actual).isEqualTo(fileToken);
        verifyNoMoreInteractions(emissionsMonitoringPlanQueryService, fileAttachmentStorageService);
    }

    @Test
    void generateGetFileAttachmentToken_throws_exception() {
        UUID fileUUID2 = UUID.randomUUID();
        EmissionsMonitoringPlanContainer empContainer = EmissionsMonitoringPlanContainer
            .builder()
            .empAttachments(Map.of(FILE_UUID, "file"))
            .build();

        when(emissionsMonitoringPlanQueryService.getEmpContainerById(EMP_ID)).thenReturn(empContainer);


        BusinessException exception = assertThrows(BusinessException.class,
            () -> empAttachmentService.generateGetFileAttachmentToken(EMP_ID, fileUUID2));

        assertEquals(RESOURCE_NOT_FOUND, exception.getErrorCode());

        verifyNoMoreInteractions(emissionsMonitoringPlanQueryService);
        verifyNoInteractions(fileAttachmentStorageService);
    }
}