package uk.gov.mrtm.api.workflow.request.flow.empnotification.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import uk.gov.mrtm.api.common.exception.MrtmErrorCode;
import uk.gov.mrtm.api.workflow.request.core.validation.WorkflowAttachmentsValidator;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmissionsMonitoringPlanNotificationContainer;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationViolation;
import uk.gov.netz.api.common.exception.BusinessException;

@Validated
@Service
@RequiredArgsConstructor
public class EmpNotificationApplicationSubmitValidatorService {

    private final WorkflowAttachmentsValidator workflowAttachmentsValidator;

    public void validateEmpNotification(@Valid EmissionsMonitoringPlanNotificationContainer emissionsMonitoringPlanNotificationContainer) {
        if (!workflowAttachmentsValidator.attachmentsExist(emissionsMonitoringPlanNotificationContainer
                .getEmissionsMonitoringPlanNotification().getAttachmentIds())) {
            throw new BusinessException(MrtmErrorCode.INVALID_EMP_NOTIFICATION,
                    EmpNotificationViolation.ATTACHMENT_NOT_FOUND.getMessage());
        }

        if (!workflowAttachmentsValidator.sectionAttachmentsReferencedInWorkflow(
                emissionsMonitoringPlanNotificationContainer.getEmissionsMonitoringPlanNotification().getAttachmentIds(),
                emissionsMonitoringPlanNotificationContainer.getEmpNotificationAttachments().keySet())) {
            throw new BusinessException(MrtmErrorCode.INVALID_EMP_NOTIFICATION,
                    EmpNotificationViolation.ATTACHMENT_NOT_REFERENCED.getMessage());
        }
    }
}
