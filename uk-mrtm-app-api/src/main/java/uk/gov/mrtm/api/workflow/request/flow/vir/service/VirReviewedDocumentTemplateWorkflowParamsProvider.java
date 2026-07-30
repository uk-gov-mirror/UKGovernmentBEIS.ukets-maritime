package uk.gov.mrtm.api.workflow.request.flow.vir.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirRequestPayload;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateSyncWorkflowParamsProvider;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class VirReviewedDocumentTemplateWorkflowParamsProvider implements DocumentTemplateSyncWorkflowParamsProvider<VirRequestPayload> {
    
    @Override
    public String getContextActionType() {
        return MrtmDocumentTemplateGenerationContextActionType.VIR_REVIEWED;
    }

    @Override
    public Map<String, Object> constructParams(VirRequestPayload payload) {

        return Map.of(
            "regulatorReviewResponse", payload.getRegulatorReviewResponse()
        );
    }
}
