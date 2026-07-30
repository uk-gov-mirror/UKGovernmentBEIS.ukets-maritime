package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationAmendsSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationAmendsSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitReviewDecisionDetails;
import uk.gov.netz.api.common.config.MapperConfig;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestActionUserInfo;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionRequiredChange;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", config = MapperConfig.class)
public interface SiteVisitReviewMapper {

    SiteVisitContainer toSiteVisitContainer(SiteVisitRequestPayload requestPayload);

    @Mapping(target = "payloadType", source = "payloadType")
    @Mapping(target = "sectionsCompleted", source = "sectionsCompleted")
    SiteVisitApplicationReviewRequestTaskPayload toApplicationReviewRequestTaskPayload(
        SiteVisitRequestPayload requestPayload, String payloadType, Map<String, String> sectionsCompleted);

    @Mapping(target = "payloadType", source = "payloadType")
    SiteVisitApplicationReturnedForAmendsRequestActionPayload toSiteVisitApplicationReturnedForAmendsRequestActionPayload(
        SiteVisitApplicationReviewRequestTaskPayload payload, String payloadType);

    @Mapping(target = "payloadType", source = "payloadType")
    @Mapping(target = "reviewDecision", source = "requestPayload.reviewDecision", qualifiedByName = "reviewGroupDecisionsForOperatorAmend")
    @Mapping(target = "sectionsCompleted", source = "sectionsCompleted")
    SiteVisitApplicationAmendsSubmitRequestTaskPayload toSiteVisitApplicationAmendsSubmitRequestTaskPayload(
        SiteVisitRequestPayload requestPayload, String payloadType, Map<String, String> sectionsCompleted);

    @Mapping(target = "payloadType", source = "payloadType")
    SiteVisitApplicationAmendsSubmittedRequestActionPayload toSiteVisitApplicationAmendsSubmittedRequestActionPayload(
        SiteVisitApplicationAmendsSubmitRequestTaskPayload requestPayload, String payloadType);

    @Mapping(target = "payloadType", source = "payloadType")
    @Mapping(target = "sectionsCompleted", source = "requestPayload.reviewSectionsCompleted")
    SiteVisitApplicationReviewSubmittedRequestActionPayload toApplicationReviewSubmittedRequestTaskPayload(
        SiteVisitRequestPayload requestPayload, String payloadType, Map<String, RequestActionUserInfo> usersInfo);

    @Mapping(target = "reviewDecision", source = "payload.reviewDecision", qualifiedByName = "reviewDecisionWithoutNotes")
    SiteVisitApplicationReturnedForAmendsRequestActionPayload cloneReturnedForAmendsPayloadIgnoreNotes(
        SiteVisitApplicationReturnedForAmendsRequestActionPayload payload);

    @Mapping(target = "reviewDecision", source = "payload.reviewDecision", qualifiedByName = "reviewDecisionWithoutNotes")
    SiteVisitApplicationReviewSubmittedRequestActionPayload cloneReviewSubmittedPayloadIgnoreNotes(
        SiteVisitApplicationReviewSubmittedRequestActionPayload payload);

    @Named("reviewDecisionWithoutNotes")
    @SuppressWarnings("java:S3252")
    default SiteVisitReviewDecision setReviewDecision(SiteVisitReviewDecision sourceReviewDecision) {
        ReviewDecisionDetails details;
        SiteVisitReviewDecisionType type = sourceReviewDecision.getType();

        if (type == SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED) {
            ChangesRequiredDecisionDetails sourceDetails = (ChangesRequiredDecisionDetails) sourceReviewDecision.getDetails();
            details = ChangesRequiredDecisionDetails.builder()
                .requiredChanges(sourceDetails.getRequiredChanges())
                .build();
        }
        else {
            SiteVisitReviewDecisionDetails sourceDetails = (SiteVisitReviewDecisionDetails)sourceReviewDecision.getDetails();
            details = SiteVisitReviewDecisionDetails.builder()
                .summary(sourceDetails.getSummary())
                .build();
        }
        return SiteVisitReviewDecision.builder()
            .details(details)
            .type(type)
            .build();
    }
    @AfterMapping
    default void setAmendReviewAttachments(@MappingTarget SiteVisitApplicationReturnedForAmendsRequestActionPayload actionPayload,
                                           SiteVisitApplicationReviewRequestTaskPayload payload) {

        final Set<UUID> amendFiles =
            ((ChangesRequiredDecisionDetails) actionPayload.getReviewDecision().getDetails())
                .getRequiredChanges().stream()
                .map(ReviewDecisionRequiredChange::getFiles)
                .flatMap(Collection::stream)
                .collect(Collectors.toSet());

        Map<UUID, String> reviewFiles = payload.getReviewAttachments().entrySet().stream()
            .filter(entry -> amendFiles.contains(entry.getKey()))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        actionPayload.setReviewAttachments(reviewFiles);
    }

    @Named("reviewGroupDecisionsForOperatorAmend")
    default SiteVisitReviewDecision setReviewGroupDecisionsForOperatorAmend(SiteVisitReviewDecision reviewDecision) {
        return SiteVisitReviewDecision.builder()
            .type(reviewDecision.getType())
            .details(ChangesRequiredDecisionDetails.builder()
                .requiredChanges(((ChangesRequiredDecisionDetails) reviewDecision.getDetails()).getRequiredChanges()).build())
            .build();
    }
}
