package uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.EmpOperatorDetails;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceApplicationSubmitRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.InitializeRequestTaskHandler;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class EmpIssuanceApplicationSubmitInitializer implements InitializeRequestTaskHandler {

    private final MrtmAccountQueryService mrtmAccountQueryService;
    private final AddressStateMapper addressStateMapper;
    @Override
    public RequestTaskPayload initializePayload(Request request) {
        MrtmAccount mrtmAccount = mrtmAccountQueryService.getAccountById(request.getAccountId());
        return EmpIssuanceApplicationSubmitRequestTaskPayload.builder()
                .payloadType(MrtmRequestTaskPayloadType.EMP_ISSUANCE_APPLICATION_SUBMIT_PAYLOAD)
               .emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
                        .operatorDetails(EmpOperatorDetails.builder()
                                .operatorName(mrtmAccount.getName())
                                .imoNumber(mrtmAccount.getImoNumber())
                                .contactAddress(addressStateMapper.toAddressStateDTO(mrtmAccount.getAddress()))
                       .build())
                   .build())
                .build();
    }

    @Override
    public Set<String> getRequestTaskTypes() {
        return Set.of(MrtmRequestTaskType.EMP_ISSUANCE_APPLICATION_SUBMIT);
    }
}
