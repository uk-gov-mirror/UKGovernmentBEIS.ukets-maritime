package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;


import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.account.transform.AddressStateMapper;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationApprovedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.mapper.EmpReviewMapper;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestActionUserInfo;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestActionUserInfoResolver;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmpIssuanceApprovedAddRequestActionService {

    private final RequestService requestService;
    private final RequestActionUserInfoResolver requestActionUserInfoResolver;
    private final MrtmAccountQueryService accountQueryService;
    private static final EmpReviewMapper EMP_REVIEW_MAPPER = Mappers.getMapper(EmpReviewMapper.class);
    private static final AddressStateMapper addressStateMapper = Mappers.getMapper(AddressStateMapper.class);

    public void addRequestAction(final String requestId) {
        Request request = requestService.findRequestById(requestId);
        EmpIssuanceRequestPayload requestPayload = (EmpIssuanceRequestPayload) request.getPayload();

        //get account info
        final MrtmAccount accountInfo = accountQueryService.getAccountById(request.getAccountId());

        // get users' information
        DecisionNotification notification = requestPayload.getDecisionNotification();
        Map<String, RequestActionUserInfo> usersInfo =
                requestActionUserInfoResolver.getUsersInfo(notification.getOperators(), notification.getSignatory(), request);

        EmpIssuanceApplicationApprovedRequestActionPayload requestActionPayload =
                EMP_REVIEW_MAPPER.toEmpIssuanceApplicationApprovedRequestActionPayload(requestPayload, accountInfo.getName(),
                        usersInfo, addressStateMapper.toAddressStateDTO(accountInfo.getAddress()),
                        MrtmRequestActionPayloadType.EMP_ISSUANCE_APPLICATION_APPROVED_PAYLOAD);

        requestService.addActionToRequest(request,
                requestActionPayload,
                MrtmRequestActionType.EMP_ISSUANCE_APPLICATION_APPROVED,
                requestPayload.getRegulatorReviewer());
    }
}
