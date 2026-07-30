package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler.flowable;

import lombok.RequiredArgsConstructor;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmpVariationApprovedPopulateRequestMetadataHandlerFlowable implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) {
    	//empty for backward compatibilty
    }
}