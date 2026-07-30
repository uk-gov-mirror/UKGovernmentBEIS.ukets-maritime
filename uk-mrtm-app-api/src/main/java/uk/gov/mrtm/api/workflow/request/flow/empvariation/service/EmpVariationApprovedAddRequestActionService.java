package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;


import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationApprovedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationReviewMapper;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestActionUserInfo;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestActionUserInfoResolver;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmpVariationApprovedAddRequestActionService {

    private final RequestService requestService;
    private static final EmpVariationReviewMapper EMP_VARIATION_MAPPER = Mappers.getMapper(EmpVariationReviewMapper.class);
    private static final AddressStateMapper addressStateMapper = Mappers.getMapper(AddressStateMapper.class);
    private final MrtmAccountQueryService accountQueryService;
    private final RequestActionUserInfoResolver requestActionUserInfoResolver;

    @Transactional
    public void addRequestAction(final String requestId) {
        Request request = requestService.findRequestById(requestId);
        EmpVariationRequestPayload requestPayload = (EmpVariationRequestPayload) request.getPayload();

        final MrtmAccount mrtmAccount = accountQueryService.getAccountById(request.getAccountId());

        // get users' information
        DecisionNotification notification = requestPayload.getDecisionNotification();
        Map<String, RequestActionUserInfo> usersInfo =
                requestActionUserInfoResolver.getUsersInfo(notification.getOperators(), notification.getSignatory(), request);

        EmpVariationApplicationApprovedRequestActionPayload requestActionPayload =
                EMP_VARIATION_MAPPER.toEmpVariationApplicationApprovedRequestActionPayload(requestPayload, usersInfo, mrtmAccount.getName(),
                        addressStateMapper.toAddressStateDTO(mrtmAccount.getAddress()), MrtmRequestActionPayloadType.EMP_VARIATION_APPLICATION_APPROVED_PAYLOAD);

        requestService.addActionToRequest(request,
                requestActionPayload,
                MrtmRequestActionType.EMP_VARIATION_APPLICATION_APPROVED,
                requestPayload.getRegulatorReviewer());
    }
}
