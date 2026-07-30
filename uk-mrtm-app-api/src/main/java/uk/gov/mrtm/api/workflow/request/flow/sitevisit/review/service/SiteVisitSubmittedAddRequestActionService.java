package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform.SiteVisitReviewMapper;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestActionUserInfo;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestActionUserInfoResolver;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class SiteVisitSubmittedAddRequestActionService {

    private final RequestService requestService;
    private final RequestActionUserInfoResolver requestActionUserInfoResolver;
    private final SiteVisitReviewMapper mapper;

    public void addRequestAction(final String requestId, SiteVisitDeterminationType determinationType) {
        Request request = requestService.findRequestById(requestId);
        SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();

        DecisionNotification decisionNotification = requestPayload.getDecisionNotification();
        Map<String, RequestActionUserInfo> usersInfo =
            requestActionUserInfoResolver.getUsersInfo(decisionNotification.getOperators(), decisionNotification.getSignatory(), request);

        String type = determinationType == SiteVisitDeterminationType.APPROVED ?
            MrtmRequestActionType.SITE_VISIT_APPLICATION_APPROVED :
            MrtmRequestActionType.SITE_VISIT_APPLICATION_REJECTED;

        SiteVisitApplicationReviewSubmittedRequestActionPayload requestActionPayload = mapper
            .toApplicationReviewSubmittedRequestTaskPayload(requestPayload,
                MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_REVIEW_SUBMITTED_PAYLOAD, usersInfo);

        requestService.addActionToRequest(request,
            requestActionPayload,
            type,
            requestPayload.getRegulatorReviewer());
    }
}
