package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mapstruct.factory.Mappers;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisit;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationAmendsSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationAmendsSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitReviewDecisionDetails;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestActionUserInfo;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionRequiredChange;

import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class SiteVisitReviewMapperTest {

    private final SiteVisitReviewMapper mapper = Mappers.getMapper(SiteVisitReviewMapper.class);

    @Test
    void toSiteVisitContainer() {
        Map<UUID, String> attachments = Map.of(UUID.randomUUID(), "filename.txt");
        SiteVisit siteVisit = mock(SiteVisit.class);
        SiteVisitRequestPayload requestPayload =
            SiteVisitRequestPayload.builder()
                .siteVisit(siteVisit)
                .siteVisitAttachments(attachments)
                .build();
        SiteVisitContainer expectedSiteVisitContainer = SiteVisitContainer.builder()
            .siteVisit(siteVisit)
            .siteVisitAttachments(attachments)
            .build();

        SiteVisitContainer siteVisitContainer = mapper.toSiteVisitContainer(requestPayload);

        assertThat(siteVisitContainer).isEqualTo(expectedSiteVisitContainer);
    }

    @Test
    void toApplicationReviewRequestTaskPayload() {
        Map<UUID, String> siteVisitAttachments = Map.of(UUID.randomUUID(), "filename.txt");
        Map<UUID, String> reviewAttachments = Map.of(UUID.randomUUID(), "filename2.txt");
        Map<String, String> sectionsCompleted = Map.of("section", "COMPLETED");
        String payloadType = "payloadType";
        SiteVisit siteVisit = mock(SiteVisit.class);
        SiteVisitReviewDecision reviewDecision = mock(SiteVisitReviewDecision.class);
        Year year = Year.now();
        SiteVisitRequestPayload requestPayload =
            SiteVisitRequestPayload.builder()
                .siteVisit(siteVisit)
                .year(year)
                .siteVisitAttachments(siteVisitAttachments)
                .reviewDecision(reviewDecision)
                .reviewAttachments(reviewAttachments)
                .build();
        SiteVisitApplicationReviewRequestTaskPayload expected = SiteVisitApplicationReviewRequestTaskPayload.builder()
            .siteVisit(siteVisit)
            .year(year)
            .siteVisitAttachments(siteVisitAttachments)
            .reviewDecision(reviewDecision)
            .reviewAttachments(reviewAttachments)
            .sectionsCompleted(sectionsCompleted)
            .payloadType(payloadType)
            .build();

        SiteVisitApplicationReviewRequestTaskPayload actual = mapper.toApplicationReviewRequestTaskPayload(
            requestPayload, payloadType, sectionsCompleted);

        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void toSiteVisitApplicationReturnedForAmendsRequestActionPayload() {
        UUID file1 = UUID.randomUUID();
        UUID file2 = UUID.randomUUID();
        Map<UUID, String> reviewAttachments = Map.of(file1, "filename1.txt", file2, "filename2.txt");
        Map<UUID, String> expectedReviewAttachments = Map.of(file1, "filename1.txt");
        Map<String, String> sectionsCompleted = Map.of("section", "COMPLETED");
        String payloadType = "payloadType";
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED)
            .details(ChangesRequiredDecisionDetails.builder()
                .notes("notes")
                .requiredChanges(List.of(
                    ReviewDecisionRequiredChange.builder().files(Set.of(file1))
                        .reason("reason")
                        .build()))
                .build())
            .build();
        SiteVisitApplicationReviewRequestTaskPayload requestTaskPayload =
            SiteVisitApplicationReviewRequestTaskPayload.builder()
                .reviewDecision(reviewDecision)
                .sectionsCompleted(sectionsCompleted)
                .reviewAttachments(reviewAttachments)
                .build();
        SiteVisitApplicationReturnedForAmendsRequestActionPayload expected = SiteVisitApplicationReturnedForAmendsRequestActionPayload.builder()
            .reviewDecision(reviewDecision)
            .sectionsCompleted(sectionsCompleted)
            .reviewAttachments(expectedReviewAttachments)
            .payloadType(payloadType)
            .build();

        SiteVisitApplicationReturnedForAmendsRequestActionPayload actual = mapper.toSiteVisitApplicationReturnedForAmendsRequestActionPayload(
            requestTaskPayload, payloadType);

        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void toSiteVisitApplicationAmendsSubmitRequestTaskPayload() {
        Map<UUID, String> siteVisitAttachments = Map.of(UUID.randomUUID(), "filename.txt");
        Map<UUID, String> reviewAttachments = Map.of(UUID.randomUUID(), "filename2.txt");
        Map<String, String> sectionsCompleted = Map.of("section", "COMPLETED");
        String payloadType = "payloadType";
        UUID reviewDecisionFile = UUID.randomUUID();
        SiteVisit siteVisit = mock(SiteVisit.class);
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED)
            .details(ChangesRequiredDecisionDetails.builder()
                .notes("notes")
                .requiredChanges(List.of(
                    ReviewDecisionRequiredChange.builder().files(Set.of(reviewDecisionFile))
                        .reason("reason")
                        .build()))
                .build())
            .build();
        SiteVisitReviewDecision expectedReviewDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED)
            .details(ChangesRequiredDecisionDetails.builder()
                .requiredChanges(List.of(
                    ReviewDecisionRequiredChange.builder().files(Set.of(reviewDecisionFile))
                        .reason("reason")
                        .build()))
                .build())
            .build();

        Year year = Year.now();
        SiteVisitRequestPayload requestPayload =
            SiteVisitRequestPayload.builder()
                .siteVisit(siteVisit)
                .year(year)
                .siteVisitAttachments(siteVisitAttachments)
                .reviewDecision(reviewDecision)
                .reviewAttachments(reviewAttachments)
                .build();
        SiteVisitApplicationAmendsSubmitRequestTaskPayload expected = SiteVisitApplicationAmendsSubmitRequestTaskPayload.builder()
            .siteVisit(siteVisit)
            .year(year)
            .siteVisitAttachments(siteVisitAttachments)
            .reviewDecision(expectedReviewDecision)
            .reviewAttachments(reviewAttachments)
            .sectionsCompleted(sectionsCompleted)
            .updatedSubtask(false)
            .payloadType(payloadType)
            .build();

        SiteVisitApplicationAmendsSubmitRequestTaskPayload actual = mapper.toSiteVisitApplicationAmendsSubmitRequestTaskPayload(
            requestPayload, payloadType, sectionsCompleted);

        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void toSiteVisitApplicationAmendsSubmittedRequestActionPayload() {
        UUID file1 = UUID.randomUUID();
        Map<UUID, String> attachments = Map.of(file1, "filename1.txt");
        Map<String, String> sectionsCompleted = Map.of("section", "COMPLETED");
        String payloadType = "payloadType";
        SiteVisit siteVisit = mock(SiteVisit.class);
        SiteVisitApplicationAmendsSubmitRequestTaskPayload requestTaskPayload =
            SiteVisitApplicationAmendsSubmitRequestTaskPayload.builder()
                .siteVisit(siteVisit)
                .sectionsCompleted(sectionsCompleted)
                .siteVisitAttachments(attachments)
                .build();
        SiteVisitApplicationAmendsSubmittedRequestActionPayload expected = SiteVisitApplicationAmendsSubmittedRequestActionPayload.builder()
            .siteVisit(siteVisit)
            .sectionsCompleted(sectionsCompleted)
            .siteVisitAttachments(attachments)
            .payloadType(payloadType)
            .build();

        SiteVisitApplicationAmendsSubmittedRequestActionPayload actual = mapper.toSiteVisitApplicationAmendsSubmittedRequestActionPayload(
            requestTaskPayload, payloadType);

        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void toApplicationReviewSubmittedRequestTaskPayload() {
        Map<UUID, String> attachments = Map.of(UUID.randomUUID(), "filename1.txt");
        Map<UUID, String> reviewAttachments = Map.of(UUID.randomUUID(), "filename2.txt");
        Map<String, String> sectionsCompleted = Map.of("section", "COMPLETED");
        Map<String, RequestActionUserInfo> usersInfo = Map.of("user-id", mock(RequestActionUserInfo.class));
        String payloadType = "payloadType";
        SiteVisitReviewDecision reviewDecision = mock(SiteVisitReviewDecision.class);
        DecisionNotification decisionNotification = mock(DecisionNotification.class);
        FileInfoDTO officialNotice = mock(FileInfoDTO.class);
        SiteVisit siteVisit = mock(SiteVisit.class);
        SiteVisitRequestPayload requestTaskPayload =
            SiteVisitRequestPayload.builder()
                .reviewDecision(reviewDecision)
                .decisionNotification(decisionNotification)
                .reviewAttachments(reviewAttachments)
                .officialNotice(officialNotice)
                .siteVisit(siteVisit)
                .reviewSectionsCompleted(sectionsCompleted)
                .siteVisitAttachments(attachments)
                .payloadType(payloadType)
                .build();
        SiteVisitApplicationReviewSubmittedRequestActionPayload expected = SiteVisitApplicationReviewSubmittedRequestActionPayload.builder()
            .reviewDecision(reviewDecision)
            .decisionNotification(decisionNotification)
            .reviewAttachments(reviewAttachments)
            .usersInfo(usersInfo)
            .officialNotice(officialNotice)
            .siteVisit(siteVisit)
            .sectionsCompleted(sectionsCompleted)
            .siteVisitAttachments(attachments)
            .payloadType(payloadType)
            .build();

        SiteVisitApplicationReviewSubmittedRequestActionPayload actual = mapper.toApplicationReviewSubmittedRequestTaskPayload(
            requestTaskPayload, payloadType, usersInfo);

        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void cloneReturnedForAmendsPayloadIgnoreNotes_operator_amends_needed() {
        UUID reviewDecisionFile = UUID.randomUUID();
        Map<UUID, String> reviewAttachments = Map.of(UUID.randomUUID(), "filename1.txt");
        Map<String, String> sectionsCompleted = Map.of("section", "COMPLETED");
        String payloadType = "payloadType";
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED)
            .details(ChangesRequiredDecisionDetails.builder()
                .notes("notes")
                .requiredChanges(List.of(
                    ReviewDecisionRequiredChange.builder().files(Set.of(reviewDecisionFile))
                        .reason("reason")
                        .build()))
                .build())
            .build();
        SiteVisitReviewDecision expectedReviewDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED)
            .details(ChangesRequiredDecisionDetails.builder()
                .requiredChanges(List.of(
                    ReviewDecisionRequiredChange.builder().files(Set.of(reviewDecisionFile))
                        .reason("reason")
                        .build()))
                .build())
            .build();
        SiteVisitApplicationReturnedForAmendsRequestActionPayload requestActionPayload =
            SiteVisitApplicationReturnedForAmendsRequestActionPayload.builder()
                .reviewDecision(reviewDecision)
                .sectionsCompleted(sectionsCompleted)
                .reviewAttachments(reviewAttachments)
                .payloadType(payloadType)
                .build();
        SiteVisitApplicationReturnedForAmendsRequestActionPayload expected = SiteVisitApplicationReturnedForAmendsRequestActionPayload.builder()
            .reviewDecision(expectedReviewDecision)
            .sectionsCompleted(sectionsCompleted)
            .reviewAttachments(reviewAttachments)
            .payloadType(payloadType)
            .build();

        SiteVisitApplicationReturnedForAmendsRequestActionPayload actual = mapper.cloneReturnedForAmendsPayloadIgnoreNotes(
            requestActionPayload);

        assertThat(actual).isEqualTo(expected);
    }

    @ParameterizedTest
    @EnumSource(value = SiteVisitReviewDecisionType.class, names = {"ACCEPTED", "REJECTED"}, mode = EnumSource.Mode.INCLUDE)
    void cloneReturnedForAmendsPayloadIgnoreNotes_accept_or_reject(SiteVisitReviewDecisionType type) {
        Map<UUID, String> reviewAttachments = Map.of(UUID.randomUUID(), "filename1.txt");
        Map<String, String> sectionsCompleted = Map.of("section", "COMPLETED");
        String payloadType = "payloadType";
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder()
            .type(type)
            .details(SiteVisitReviewDecisionDetails.builder()
                .notes("notes")
                .summary("summary")
                .build())
            .build();
        SiteVisitReviewDecision expectedReviewDecision = SiteVisitReviewDecision.builder()
            .type(type)
            .details(SiteVisitReviewDecisionDetails.builder()
                .summary("summary")
                .build())
            .build();
        SiteVisitApplicationReturnedForAmendsRequestActionPayload requestActionPayload =
            SiteVisitApplicationReturnedForAmendsRequestActionPayload.builder()
                .reviewDecision(reviewDecision)
                .sectionsCompleted(sectionsCompleted)
                .reviewAttachments(reviewAttachments)
                .payloadType(payloadType)
                .build();
        SiteVisitApplicationReturnedForAmendsRequestActionPayload expected = SiteVisitApplicationReturnedForAmendsRequestActionPayload.builder()
            .reviewDecision(expectedReviewDecision)
            .sectionsCompleted(sectionsCompleted)
            .reviewAttachments(reviewAttachments)
            .payloadType(payloadType)
            .build();

        SiteVisitApplicationReturnedForAmendsRequestActionPayload actual = mapper.cloneReturnedForAmendsPayloadIgnoreNotes(
            requestActionPayload);

        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void cloneReviewSubmittedPayloadIgnoreNotes_operator_amends_needed() {
        UUID reviewDecisionFile = UUID.randomUUID();
        Map<UUID, String> reviewAttachments = Map.of(UUID.randomUUID(), "filename1.txt");
        Map<UUID, String> attachments = Map.of(UUID.randomUUID(), "filename1.txt");
        Map<String, String> sectionsCompleted = Map.of("section", "COMPLETED");
        String payloadType = "payloadType";
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED)
            .details(ChangesRequiredDecisionDetails.builder()
                .notes("notes")
                .requiredChanges(List.of(
                    ReviewDecisionRequiredChange.builder().files(Set.of(reviewDecisionFile))
                        .reason("reason")
                        .build()))
                .build())
            .build();
        SiteVisitReviewDecision expectedReviewDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED)
            .details(ChangesRequiredDecisionDetails.builder()
                .requiredChanges(List.of(
                    ReviewDecisionRequiredChange.builder().files(Set.of(reviewDecisionFile))
                        .reason("reason")
                        .build()))
                .build())
            .build();
        Map<String, RequestActionUserInfo> usersInfo = Map.of("user-id", mock(RequestActionUserInfo.class));
        DecisionNotification decisionNotification = mock(DecisionNotification.class);
        FileInfoDTO officialNotice = FileInfoDTO.builder().name("name").uuid(UUID.randomUUID().toString()).build();
        SiteVisit siteVisit = mock(SiteVisit.class);
        SiteVisitApplicationReviewSubmittedRequestActionPayload requestActionPayload =
            SiteVisitApplicationReviewSubmittedRequestActionPayload.builder()
                .siteVisit(siteVisit)
                .siteVisitAttachments(attachments)
                .reviewDecision(reviewDecision)
                .sectionsCompleted(sectionsCompleted)
                .reviewAttachments(reviewAttachments)
                .decisionNotification(decisionNotification)
                .usersInfo(usersInfo)
                .officialNotice(officialNotice)
                .payloadType(payloadType)
                .build();
        SiteVisitApplicationReviewSubmittedRequestActionPayload expected = SiteVisitApplicationReviewSubmittedRequestActionPayload.builder()
            .siteVisit(siteVisit)
            .siteVisitAttachments(attachments)
            .reviewDecision(expectedReviewDecision)
            .sectionsCompleted(sectionsCompleted)
            .reviewAttachments(reviewAttachments)
            .decisionNotification(decisionNotification)
            .usersInfo(usersInfo)
            .officialNotice(officialNotice)
            .payloadType(payloadType)
            .build();


        SiteVisitApplicationReviewSubmittedRequestActionPayload actual = mapper.cloneReviewSubmittedPayloadIgnoreNotes(
            requestActionPayload);

        assertThat(actual).isEqualTo(expected);
    }

    @ParameterizedTest
    @EnumSource(value = SiteVisitReviewDecisionType.class, names = {"ACCEPTED", "REJECTED"}, mode = EnumSource.Mode.INCLUDE)
    void cloneReviewSubmittedPayloadIgnoreNotes_accept_or_reject(SiteVisitReviewDecisionType type) {
        Map<UUID, String> reviewAttachments = Map.of(UUID.randomUUID(), "filename1.txt");
        Map<UUID, String> attachments = Map.of(UUID.randomUUID(), "filename1.txt");
        Map<String, String> sectionsCompleted = Map.of("section", "COMPLETED");
        String payloadType = "payloadType";
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder()
            .type(type)
            .details(SiteVisitReviewDecisionDetails.builder()
                .notes("notes")
                .summary("summary")
                .build())
            .build();
        SiteVisitReviewDecision expectedReviewDecision = SiteVisitReviewDecision.builder()
            .type(type)
            .details(SiteVisitReviewDecisionDetails.builder()
                .summary("summary")
                .build())
            .build();
        Map<String, RequestActionUserInfo> usersInfo = Map.of("user-id", mock(RequestActionUserInfo.class));
        DecisionNotification decisionNotification = mock(DecisionNotification.class);
        FileInfoDTO officialNotice = FileInfoDTO.builder().name("name").uuid(UUID.randomUUID().toString()).build();
        SiteVisit siteVisit = mock(SiteVisit.class);
        SiteVisitApplicationReviewSubmittedRequestActionPayload requestActionPayload =
            SiteVisitApplicationReviewSubmittedRequestActionPayload.builder()
                .siteVisit(siteVisit)
                .siteVisitAttachments(attachments)
                .reviewDecision(reviewDecision)
                .sectionsCompleted(sectionsCompleted)
                .reviewAttachments(reviewAttachments)
                .decisionNotification(decisionNotification)
                .usersInfo(usersInfo)
                .officialNotice(officialNotice)
                .payloadType(payloadType)
                .build();
        SiteVisitApplicationReviewSubmittedRequestActionPayload expected = SiteVisitApplicationReviewSubmittedRequestActionPayload.builder()
            .siteVisit(siteVisit)
            .siteVisitAttachments(attachments)
            .reviewDecision(expectedReviewDecision)
            .sectionsCompleted(sectionsCompleted)
            .reviewAttachments(reviewAttachments)
            .decisionNotification(decisionNotification)
            .usersInfo(usersInfo)
            .officialNotice(officialNotice)
            .payloadType(payloadType)
            .build();

        SiteVisitApplicationReviewSubmittedRequestActionPayload actual = mapper.cloneReviewSubmittedPayloadIgnoreNotes(
            requestActionPayload);

        assertThat(actual).isEqualTo(expected);
    }
}