package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateAsyncWorkflowParamsProvider;

import java.util.Map;

@Component
public class EmpVariationRejectedDocumentTemplateWorkflowParamsProvider
		implements DocumentTemplateAsyncWorkflowParamsProvider {

    @Override
    public String getContextActionType() {
        return MrtmDocumentTemplateGenerationContextActionType.EMP_VARIATION_REJECTED;
    }

    @Override
    public Map<String, Object> constructParams(RequestTask requestTask) {
		final EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload = (EmpVariationApplicationReviewRequestTaskPayload) requestTask
				.getPayload();
        final String rejectionReason = requestTaskPayload.getDetermination().getReason();
        final String summary = requestTaskPayload.getDetermination().getSummary();

        return Map.of(
                "rejectionReason", rejectionReason,
                "summary", summary
        );
    }
}
