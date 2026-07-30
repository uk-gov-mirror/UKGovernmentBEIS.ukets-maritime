package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRequestTaskPayload;
import uk.gov.netz.api.workflow.request.application.taskview.RequestTaskActionEligibilityEvaluator;

import java.util.List;

@Component
public class EmpVariationImportThetisXmlEligibilityEvaluator
        implements RequestTaskActionEligibilityEvaluator<EmpVariationApplicationSubmitRequestTaskPayload> {

    @Value("${feature-flag.mrtm.thetis-import.enabled}")
    private boolean thetisImportEnabled;

    @Override
    public boolean isEligible(EmpVariationApplicationSubmitRequestTaskPayload requestTaskPayload) {
        return thetisImportEnabled;
    }

    @Override
    public String getRequestTaskType() {
        return MrtmRequestTaskType.EMP_VARIATION_APPLICATION_SUBMIT;
    }

    @Override
    public List<String> getRequestTaskActionTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_VARIATION_IMPORT_THETIS_XML);
    }
}
