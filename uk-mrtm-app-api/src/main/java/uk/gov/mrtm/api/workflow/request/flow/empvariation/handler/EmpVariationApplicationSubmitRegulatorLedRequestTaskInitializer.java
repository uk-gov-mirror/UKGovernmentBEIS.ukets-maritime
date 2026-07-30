package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;


import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationMapper;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationSubmitRegulatorLedMapper;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.InitializeRequestTaskHandler;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class EmpVariationApplicationSubmitRegulatorLedRequestTaskInitializer implements InitializeRequestTaskHandler {

    private final EmissionsMonitoringPlanQueryService empQueryService;
    private final MrtmAccountQueryService accountQueryService;
    private final EmpVariationMapper empVariationMapper = Mappers.getMapper(EmpVariationMapper.class);
    private final EmpVariationSubmitRegulatorLedMapper empVariationRegulatorLedMapper = Mappers.getMapper(EmpVariationSubmitRegulatorLedMapper.class);
    private static final AddressStateMapper addressStateMapper = Mappers.getMapper(AddressStateMapper.class);

    @Override
    @SuppressWarnings("java:S3252")
    public RequestTaskPayload initializePayload(Request request) {
        final EmpVariationRequestPayload requestPayload = (EmpVariationRequestPayload) request.getPayload();

        final EmissionsMonitoringPlanContainer originalEmpContainer =
                empQueryService.getEmissionsMonitoringPlanDTOByAccountId(request.getAccountId())
                        .map(EmissionsMonitoringPlanDTO::getEmpContainer)
                        .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        final EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload requestTaskPayload;

        if(isAlreadyDetermined(requestPayload)) {
            requestTaskPayload = empVariationRegulatorLedMapper
                    .toEmpVariationApplicationSubmitRegulatorLedRequestTaskPayload(requestPayload,
                            MrtmRequestTaskPayloadType.EMP_VARIATION_APPLICATION_SUBMIT_REGULATOR_LED_PAYLOAD);
        } else {
            final MrtmAccount accountInfo = accountQueryService.getAccountById(request.getAccountId());
            final EmissionsMonitoringPlan emp = empVariationMapper.cloneEmissionsMonitoringPlan(
                    originalEmpContainer.getEmissionsMonitoringPlan(), accountInfo.getName(),
                    addressStateMapper.toAddressStateDTO(accountInfo.getAddress()));

            requestTaskPayload = EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload.builder()
                    .payloadType(MrtmRequestTaskPayloadType.EMP_VARIATION_APPLICATION_SUBMIT_REGULATOR_LED_PAYLOAD)
                    .originalEmpContainer(originalEmpContainer)
                    .emissionsMonitoringPlan(emp)
                    .empAttachments(originalEmpContainer.getEmpAttachments())
                    .build();
        }

        return requestTaskPayload;
    }

    @Override
    public Set<String> getRequestTaskTypes() {
        return Set.of(MrtmRequestTaskType.EMP_VARIATION_REGULATOR_LED_APPLICATION_SUBMIT);
    }

    private boolean isAlreadyDetermined(EmpVariationRequestPayload requestPayload) {
        return requestPayload.getReasonRegulatorLed() != null;
    }
}
