package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisit;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationAmendsSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitReviewDecisionDetails;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitSaveApplicationAmendRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionRequiredChange;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class RequestSiteVisitReviewServiceTest {

    @InjectMocks
    private RequestSiteVisitReviewService service;

    @Test
    void saveReviewDecision() {
        SiteVisitReviewDecision reviewDecision = mock(SiteVisitReviewDecision.class);
        Map<String, String> sectionsCompleted = Map.of("s1", "a");
        SiteVisitApplicationReviewRequestTaskPayload requestTaskPayload = SiteVisitApplicationReviewRequestTaskPayload.builder()
            .build();
        SiteVisitApplicationReviewRequestTaskPayload expectedRequestTaskPayload = SiteVisitApplicationReviewRequestTaskPayload.builder()
            .reviewDecision(reviewDecision)
            .sectionsCompleted(sectionsCompleted)
            .build();
        SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload taskActionPayload = SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload.builder()
            .reviewDecision(reviewDecision)
            .sectionsCompleted(sectionsCompleted)
            .build();
        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .build();

        service.saveReviewDecision(taskActionPayload, requestTask);

        assertThat(requestTask.getPayload()).isEqualTo(expectedRequestTaskPayload);
    }

    @Test
    void saveRequestPeerReviewAction() {
        SiteVisitReviewDecision reviewDecision = mock(SiteVisitReviewDecision.class);
        Map<String, String> sectionsCompleted = Map.of("s1", "a");
        String selectedPeerReview = "selectedPeerReview";
        Map<UUID, String> reviewAttachments = Map.of(UUID.randomUUID(), "filename.txt");
        String userId = "userId";
        AppUser appUser = AppUser.builder().userId(userId).build();

        SiteVisitApplicationReviewRequestTaskPayload requestTaskPayload = SiteVisitApplicationReviewRequestTaskPayload.builder()
            .reviewDecision(reviewDecision)
            .sectionsCompleted(sectionsCompleted)
            .reviewAttachments(reviewAttachments)
            .build();
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder()
            .build();
        SiteVisitRequestPayload expectedRequestPayload = SiteVisitRequestPayload.builder()
            .reviewDecision(reviewDecision)
            .reviewSectionsCompleted(sectionsCompleted)
            .reviewAttachments(reviewAttachments)
            .regulatorPeerReviewer(selectedPeerReview)
            .regulatorReviewer(userId)
            .build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();
        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .request(request)
            .build();

        service.saveRequestPeerReviewAction(requestTask, selectedPeerReview, appUser);

        assertThat(requestTask.getRequest().getPayload()).isEqualTo(expectedRequestPayload);
    }

    @Test
    void saveRequestReturnForAmends() {
        SiteVisitReviewDecision reviewDecision = mock(SiteVisitReviewDecision.class);
        Map<String, String> sectionsCompleted = Map.of("s1", "a");
        Map<UUID, String> reviewAttachments = Map.of(UUID.randomUUID(), "filename.txt");
        String userId = "userId";
        AppUser appUser = AppUser.builder().userId(userId).build();

        SiteVisitApplicationReviewRequestTaskPayload requestTaskPayload = SiteVisitApplicationReviewRequestTaskPayload.builder()
            .reviewDecision(reviewDecision)
            .sectionsCompleted(sectionsCompleted)
            .reviewAttachments(reviewAttachments)
            .build();
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder()
            .build();
        SiteVisitRequestPayload expectedRequestPayload = SiteVisitRequestPayload.builder()
            .reviewDecision(reviewDecision)
            .reviewSectionsCompleted(sectionsCompleted)
            .amendsSectionsCompleted(sectionsCompleted)
            .reviewAttachments(reviewAttachments)
            .regulatorReviewer(userId)
            .build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();
        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .request(request)
            .build();

        service.saveRequestReturnForAmends(requestTask, appUser);

        assertThat(requestTask.getRequest().getPayload()).isEqualTo(expectedRequestPayload);
    }

    @Test
    void submit() {
        SiteVisitReviewDecision reviewDecision = mock(SiteVisitReviewDecision.class);
        Map<String, String> sectionsCompleted = Map.of("s1", "a");
        Map<UUID, String> reviewAttachments = Map.of(UUID.randomUUID(), "filename.txt");
        String userId = "userId";
        AppUser appUser = AppUser.builder().userId(userId).build();
        DecisionNotification decisionNotification = mock(DecisionNotification.class);

        SiteVisitApplicationReviewRequestTaskPayload requestTaskPayload = SiteVisitApplicationReviewRequestTaskPayload.builder()
            .reviewDecision(reviewDecision)
            .sectionsCompleted(sectionsCompleted)
            .reviewAttachments(reviewAttachments)
            .build();
        NotifyOperatorForDecisionRequestTaskActionPayload taskActionPayload = NotifyOperatorForDecisionRequestTaskActionPayload.builder()
            .decisionNotification(decisionNotification)
            .build();
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder()
            .build();
        SiteVisitRequestPayload expectedRequestPayload = SiteVisitRequestPayload.builder()
            .reviewDecision(reviewDecision)
            .reviewSectionsCompleted(sectionsCompleted)
            .reviewAttachments(reviewAttachments)
            .decisionNotification(decisionNotification)
            .regulatorReviewer(userId)
            .build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();
        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .request(request)
            .build();

        service.submit(requestTask, taskActionPayload, appUser);

        assertThat(requestTask.getRequest().getPayload()).isEqualTo(expectedRequestPayload);
    }

    @Test
    void saveAmend() {
        SiteVisit siteVisit = mock(SiteVisit.class);
        Map<String, String> sectionsCompleted = Map.of("s1", "a");
        SiteVisitApplicationAmendsSubmitRequestTaskPayload requestTaskPayload = SiteVisitApplicationAmendsSubmitRequestTaskPayload.builder()
            .build();
        SiteVisitApplicationAmendsSubmitRequestTaskPayload expectedRequestTaskPayload = SiteVisitApplicationAmendsSubmitRequestTaskPayload.builder()
            .siteVisit(siteVisit)
            .sectionsCompleted(sectionsCompleted)
            .updatedSubtask(true)
            .build();
        SiteVisitSaveApplicationAmendRequestTaskActionPayload taskActionPayload = SiteVisitSaveApplicationAmendRequestTaskActionPayload.builder()
            .siteVisit(siteVisit)
            .sectionsCompleted(sectionsCompleted)
            .updatedSubtask(true)
            .build();
        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .build();

        service.saveAmend(taskActionPayload, requestTask);

        assertThat(requestTask.getPayload()).isEqualTo(expectedRequestTaskPayload);
    }

    @ParameterizedTest
    @MethodSource
    void submitAmend(boolean updatedSubtask, SiteVisitReviewDecision decision, SiteVisitReviewDecision expectedDecision) {
        SiteVisit siteVisit = mock(SiteVisit.class);
        Map<String, String> sectionsCompleted = Map.of("s1", "a");
        Map<UUID, String> reviewAttachments = Map.of(UUID.randomUUID(), "filename.txt");

        SiteVisitApplicationAmendsSubmitRequestTaskPayload requestTaskPayload = SiteVisitApplicationAmendsSubmitRequestTaskPayload.builder()
            .siteVisit(siteVisit)
            .updatedSubtask(updatedSubtask)
            .sectionsCompleted(sectionsCompleted)
            .siteVisitAttachments(reviewAttachments)
            .build();
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder()
            .reviewDecision(decision)
            .build();
        SiteVisitRequestPayload expectedRequestPayload = SiteVisitRequestPayload.builder()
            .reviewDecision(expectedDecision)
            .amendsSectionsCompleted(sectionsCompleted)
            .siteVisitAttachments(reviewAttachments)
            .siteVisit(siteVisit)
            .build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();
        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .request(request)
            .build();

        service.submitAmend(requestTask);

        assertThat(requestTask.getRequest().getPayload()).isEqualTo(expectedRequestPayload);
    }

    public static Stream<Arguments> submitAmend() {
        SiteVisitReviewDecision amendsDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED)
            .details(ChangesRequiredDecisionDetails.builder()
                .requiredChanges(List.of(ReviewDecisionRequiredChange.builder().reason("reason").files(Set.of(UUID.randomUUID())).build()))
                .notes("notes")
                .build())
            .build();
        SiteVisitReviewDecision amendsExpectedDecision = SiteVisitReviewDecision.builder()
            .details(ChangesRequiredDecisionDetails.builder()
                .requiredChanges(null)
                .notes("notes")
                .build())
            .build();

        SiteVisitReviewDecision acceptedDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.ACCEPTED)
            .details(SiteVisitReviewDecisionDetails.builder()
                .summary("summary")
                .notes("notes")
                .build())
            .build();
        SiteVisitReviewDecision acceptedExpectedDecision = SiteVisitReviewDecision.builder()
            .details(SiteVisitReviewDecisionDetails.builder()
                .summary("summary")
                .notes("notes")
                .build())
            .build();

        SiteVisitReviewDecision rejectedDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.REJECTED)
            .details(SiteVisitReviewDecisionDetails.builder()
                .summary("summary")
                .notes("notes")
                .build())
            .build();
        SiteVisitReviewDecision rejectedExpectedDecision = SiteVisitReviewDecision.builder()
            .details(SiteVisitReviewDecisionDetails.builder()
                .summary("summary")
                .notes("notes")
                .build())
            .build();

        return Stream.of(
            Arguments.of(true, amendsDecision, amendsExpectedDecision),
            Arguments.of(false, amendsDecision, amendsDecision),
            Arguments.of(true, acceptedDecision, acceptedExpectedDecision),
            Arguments.of(false, acceptedDecision, acceptedDecision),
            Arguments.of(true, rejectedDecision, rejectedExpectedDecision),
            Arguments.of(false, rejectedDecision, rejectedDecision)
        );
    }
}