package uk.gov.mrtm.api.workflow.request.flow.empnotification.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationReviewDecisionDetails;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;


@ExtendWith(MockitoExtension.class)
class EmpNotificationRejectedOfficialNoticeDocumentTemplateWorkflowParamsProviderTest {

    @InjectMocks
    private EmpNotificationRejectedOfficialNoticeDocumentTemplateWorkflowParamsProvider provider;

    @Test
    void getContextActionType() {
        assertThat(provider.getContextActionType())
            .isEqualTo(MrtmDocumentTemplateGenerationContextActionType.EMP_NOTIFICATION_REJECTED);
    }

    @Test
    void constructParams() {
        String officialNotice = "test";

        EmpNotificationRequestPayload payload = EmpNotificationRequestPayload.builder()
            .reviewDecision(EmpNotificationReviewDecision.builder().details(
                EmpNotificationReviewDecisionDetails
                    .builder()
                    .officialNotice(officialNotice)
                    .build())
                .build())
            .build();

        Map<String, Object> params = provider.constructParams(payload);
        assertThat(params.size()).isEqualTo(1);
        assertThat(params).containsEntry("officialNotice", officialNotice);
    }
}