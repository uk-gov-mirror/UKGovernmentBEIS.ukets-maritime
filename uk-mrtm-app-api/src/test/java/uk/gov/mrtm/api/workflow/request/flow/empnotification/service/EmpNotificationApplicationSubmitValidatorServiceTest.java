package uk.gov.mrtm.api.workflow.request.flow.empnotification.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.common.exception.MrtmErrorCode;
import uk.gov.mrtm.api.workflow.request.core.validation.WorkflowAttachmentsValidator;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.DateOfNonSignificantChange;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmissionsMonitoringPlanNotification;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmissionsMonitoringPlanNotificationContainer;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationDetailsOfChange;
import uk.gov.netz.api.common.exception.BusinessException;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpNotificationApplicationSubmitValidatorServiceTest {
    private static final UUID RANDOM_UUID = UUID.randomUUID();

    @InjectMocks
    private EmpNotificationApplicationSubmitValidatorService service;

    @Mock
    private WorkflowAttachmentsValidator workflowAttachmentsValidator;

    @Test
    void validateEmpNotification() {
        EmissionsMonitoringPlanNotificationContainer emissionsMonitoringPlanNotificationContainer =
                createEmissionsMonitoringPlanNotificationContainer();

        when(workflowAttachmentsValidator.attachmentsExist(Set.of(RANDOM_UUID))).thenReturn(true);
        when(workflowAttachmentsValidator.sectionAttachmentsReferencedInWorkflow(
                Set.of(RANDOM_UUID), Set.of(RANDOM_UUID))).thenReturn(true);

        // Invoke
        service.validateEmpNotification(emissionsMonitoringPlanNotificationContainer);

        // Verify
        verify(workflowAttachmentsValidator).attachmentsExist(Set.of(RANDOM_UUID));
        verify(workflowAttachmentsValidator)
                .sectionAttachmentsReferencedInWorkflow(Set.of(RANDOM_UUID), Set.of(RANDOM_UUID));
    }

    @Test
    void validateEmpNotification_attachment_not_found_exception() {
        EmissionsMonitoringPlanNotificationContainer emissionsMonitoringPlanNotificationContainer =
                createEmissionsMonitoringPlanNotificationContainer();

        when(workflowAttachmentsValidator.attachmentsExist(Set.of(RANDOM_UUID))).thenReturn(false);

        // Invoke
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.validateEmpNotification(emissionsMonitoringPlanNotificationContainer));

        // Verify
        assertThat(ex.getErrorCode()).isEqualTo(MrtmErrorCode.INVALID_EMP_NOTIFICATION);
        assertThat(ex.getData()).isEqualTo(new Object[] {"Attachment not found"});

        verify(workflowAttachmentsValidator).attachmentsExist(Set.of(RANDOM_UUID));
        verifyNoMoreInteractions(workflowAttachmentsValidator);
    }

    @Test
    void validateEmpNotification_attachment_not_referenced_exception() {
        EmissionsMonitoringPlanNotificationContainer emissionsMonitoringPlanNotificationContainer =
                createEmissionsMonitoringPlanNotificationContainer();

        when(workflowAttachmentsValidator.attachmentsExist(Set.of(RANDOM_UUID))).thenReturn(true);
        when(workflowAttachmentsValidator.sectionAttachmentsReferencedInWorkflow(
                Set.of(RANDOM_UUID), Set.of(RANDOM_UUID))).thenReturn(false);

        // Invoke
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.validateEmpNotification(emissionsMonitoringPlanNotificationContainer));

        // Verify
        assertThat(ex.getErrorCode()).isEqualTo(MrtmErrorCode.INVALID_EMP_NOTIFICATION);
        assertThat(ex.getData()).isEqualTo(new Object[] {"Attachment is not referenced in EMP notification"});

        verify(workflowAttachmentsValidator).attachmentsExist(Set.of(RANDOM_UUID));
        verify(workflowAttachmentsValidator)
                .sectionAttachmentsReferencedInWorkflow(Set.of(RANDOM_UUID), Set.of(RANDOM_UUID));
    }

    private EmissionsMonitoringPlanNotificationContainer createEmissionsMonitoringPlanNotificationContainer() {
        return EmissionsMonitoringPlanNotificationContainer.builder()
                .emissionsMonitoringPlanNotification(EmissionsMonitoringPlanNotification.builder()
                        .detailsOfChange(EmpNotificationDetailsOfChange.builder()
                                .description("description")
                                .justification("justification")
                                .documents(Set.of(RANDOM_UUID))
                                .dateOfNonSignificantChange(DateOfNonSignificantChange.builder()
                                        .startDate(LocalDate.now())
                                        .endDate(LocalDate.now().plusDays(1))
                                        .build())
                                .build())
                        .build())
                .empNotificationAttachments(Map.of(RANDOM_UUID, "name1"))
                .build();
    }
}
