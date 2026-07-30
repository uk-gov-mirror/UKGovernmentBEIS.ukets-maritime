package uk.gov.mrtm.api.workflow.request.flow.doe.common.service;

import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.Doe;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeRequestPayload;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateSyncWorkflowParamsProvider;

import java.time.Year;
import java.util.HashMap;
import java.util.Map;

@Component
public class DoeSubmittedDocumentTemplateWorkflowParamsProvider
    implements DocumentTemplateSyncWorkflowParamsProvider<DoeRequestPayload> {

    @Override
    public String getContextActionType() {
        return MrtmDocumentTemplateGenerationContextActionType.DOE_SUBMIT;
    }

    @Override
    public Map<String, Object> constructParams(DoeRequestPayload requestPayload) {
        Doe doe = requestPayload.getDoe();
        Year reportingYear = requestPayload.getReportingYear();

        Map<String, Object> vars = new HashMap<>();

        vars.put("reportingYear", reportingYear);
        vars.put("totalEmissions", doe.getMaritimeEmissions().getTotalMaritimeEmissions().getTotalReportableEmissions());
        vars.put("noticeText",
                doe.getMaritimeEmissions().getDeterminationReason().getDetails().getType());
        vars.put("emissionsCalculationApproachDescription",
                doe.getMaritimeEmissions().getTotalMaritimeEmissions().getCalculationApproach());
        vars.put("surrenderEmissions",
            doe.getMaritimeEmissions().getTotalMaritimeEmissions().getSurrenderEmissions());
        vars.put("lessVoyagesInNorthernIrelandDeduction",
            doe.getMaritimeEmissions().getTotalMaritimeEmissions().getLessVoyagesInNorthernIrelandDeduction());

        return vars;
    }

}
