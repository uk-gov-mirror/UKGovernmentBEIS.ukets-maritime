package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationDeterminationType;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class EmpVariationRejectedDocumentTemplateWorkflowParamsProviderTest {

    @InjectMocks
    private EmpVariationRejectedDocumentTemplateWorkflowParamsProvider provider;

    @Test
    void getContextActionType() {
        assertThat(provider.getContextActionType()).isEqualTo(
                MrtmDocumentTemplateGenerationContextActionType.EMP_VARIATION_REJECTED);
    }

    @Test
    void constructParams() {
        String reason = "Rejection reason";
        String summary = "Summary";
        EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = EmpVariationApplicationReviewRequestTaskPayload.builder()
                .determination(EmpVariationDetermination.builder()
                        .type(EmpVariationDeterminationType.REJECTED)
                        .reason(reason)
                        .summary(summary)
                        .build())
                .build();
        
        RequestTask requestTask = RequestTask.builder().payload(requestTaskPayload).build();

        Map<String, Object> result = provider.constructParams(requestTask);

        Assertions.assertEquals(result, Map.of("rejectionReason", reason, "summary", summary));
    }
}
