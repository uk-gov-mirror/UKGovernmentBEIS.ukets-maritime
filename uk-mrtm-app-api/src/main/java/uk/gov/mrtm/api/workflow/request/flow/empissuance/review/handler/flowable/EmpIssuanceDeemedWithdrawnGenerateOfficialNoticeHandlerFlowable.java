package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.handler.flowable;


import lombok.RequiredArgsConstructor;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmpIssuanceDeemedWithdrawnGenerateOfficialNoticeHandlerFlowable implements JavaDelegate {

    /**
     * DO NOT REMOVE THIS HANDLER.
     * Refer to <a href="https://trasys.atlassian.net/browse/MRTM-3770">MRTM-3770</a> for information.
     * This handler is kept for backward compatibility with EMP workflow
     * instances created using previous workflow versions. Removing it <b>WILL</b>
     * cause those existing workflow instances to fail during execution.
     */
    @Override
    public void execute(DelegateExecution execution) {
    }
}