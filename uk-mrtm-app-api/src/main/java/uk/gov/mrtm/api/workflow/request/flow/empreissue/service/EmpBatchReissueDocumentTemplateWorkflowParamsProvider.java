package uk.gov.mrtm.api.workflow.request.flow.empreissue.service;

import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpReissueRequestPayload;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateSyncWorkflowParamsProvider;

import java.util.Map;
@Component
public class EmpBatchReissueDocumentTemplateWorkflowParamsProvider implements DocumentTemplateSyncWorkflowParamsProvider<EmpReissueRequestPayload> {

    @Override
    public String getContextActionType() {
        return MrtmDocumentTemplateGenerationContextActionType.EMP_REISSUE;
    }

    @Override
    public Map<String, Object> constructParams(EmpReissueRequestPayload payload) {

        return Map.of(
                "empConsolidationNumber", payload.getConsolidationNumber(),
                "summary", payload.getSummary()
        );
    }
}
