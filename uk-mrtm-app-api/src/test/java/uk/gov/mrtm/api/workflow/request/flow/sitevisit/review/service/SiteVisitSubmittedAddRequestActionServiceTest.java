package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
import java.util.Set;
import java.util.stream.Stream;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitSubmittedAddRequestActionServiceTest {

    @InjectMocks
    private SiteVisitSubmittedAddRequestActionService service;

    @Mock
    private RequestService requestService;
    @Mock
    private RequestActionUserInfoResolver requestActionUserInfoResolver;
    @Mock
    private SiteVisitReviewMapper mapper;

    @ParameterizedTest
    @MethodSource
    void addRequestAction(SiteVisitDeterminationType determinationType, String requestActionType) {
        String requestId = "requestId";
        String signatory = "signatory";
        Set<String> operators = Set.of("operator1");
        Map<String, RequestActionUserInfo> usersInfo = Map.of("user-id", mock(RequestActionUserInfo.class));
        SiteVisitApplicationReviewSubmittedRequestActionPayload requestActionPayload =
            mock(SiteVisitApplicationReviewSubmittedRequestActionPayload.class);
        DecisionNotification decisionNotification = DecisionNotification.builder()
            .signatory(signatory)
            .operators(operators)
            .build();
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder()
            .decisionNotification(decisionNotification)
            .build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(requestActionUserInfoResolver.getUsersInfo(operators, signatory, request)).thenReturn(usersInfo);
        when(mapper.toApplicationReviewSubmittedRequestTaskPayload(requestPayload,
            MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_REVIEW_SUBMITTED_PAYLOAD, usersInfo))
            .thenReturn(requestActionPayload);

        service.addRequestAction(requestId, determinationType);

        verify(requestService).findRequestById(requestId);
        verify(requestActionUserInfoResolver).getUsersInfo(operators, signatory, request);
        verify(mapper).toApplicationReviewSubmittedRequestTaskPayload(requestPayload,
            MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_REVIEW_SUBMITTED_PAYLOAD, usersInfo);
        verify(requestService).addActionToRequest(request,
            requestActionPayload,
            requestActionType,
            requestPayload.getRegulatorReviewer());

        verifyNoMoreInteractions(requestService, requestActionUserInfoResolver, mapper);
    }

    private static Stream<Arguments> addRequestAction() {
        return Stream.of(
            Arguments.of(SiteVisitDeterminationType.APPROVED, MrtmRequestActionType.SITE_VISIT_APPLICATION_APPROVED),
            Arguments.of(SiteVisitDeterminationType.REJECTED, MrtmRequestActionType.SITE_VISIT_APPLICATION_REJECTED)
        );
    }
}