package uk.gov.mrtm.api.workflow.request.flow.empnotification.service;

import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationAcceptedDecisionDetails;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationRequestPayload;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateSyncWorkflowParamsProvider;

import java.util.Map;

@Component
public class EmpNotificationGrantedOfficialNoticeDocumentTemplateWorkflowParamsProvider implements
        DocumentTemplateSyncWorkflowParamsProvider<EmpNotificationRequestPayload> {

    @Override
    public String getContextActionType() {
        return MrtmDocumentTemplateGenerationContextActionType.EMP_NOTIFICATION_GRANTED;
    }

    @Override
    public Map<String, Object> constructParams(EmpNotificationRequestPayload payload) {
        return Map.of(
            "officialNotice",
            ((EmpNotificationAcceptedDecisionDetails) (payload.getReviewDecision().getDetails())).getOfficialNotice()
        );
    }
}
