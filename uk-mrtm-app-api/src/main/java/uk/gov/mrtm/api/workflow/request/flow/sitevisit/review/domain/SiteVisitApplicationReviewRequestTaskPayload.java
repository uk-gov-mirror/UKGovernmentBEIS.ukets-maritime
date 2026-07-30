package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.util.CollectionUtils;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitApplicationRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionRequiredChange;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SiteVisitApplicationReviewRequestTaskPayload extends SiteVisitApplicationRequestTaskPayload {

    private SiteVisitReviewDecision reviewDecision;

    @Builder.Default
    private Map<UUID, String> reviewAttachments = new HashMap<>();

    @Override
    public Map<UUID, String> getAttachments() {
        return Stream.of(super.getAttachments(), getReviewAttachments())
            .flatMap(map -> map.entrySet().stream())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    @Override
    public Set<UUID> getReferencedAttachmentIds() {
        Set<UUID> reviewAttachmentIds = new HashSet<>();
        if (SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED.equals(reviewDecision.getType())) {
            reviewAttachmentIds = (((ChangesRequiredDecisionDetails) reviewDecision.getDetails()).getRequiredChanges()
                .stream()
                .map(ReviewDecisionRequiredChange::getFiles))
                .flatMap(Set::stream)
                .collect(Collectors.toSet());
        }

        return Stream.of(super.getReferencedAttachmentIds(), reviewAttachmentIds)
            .flatMap(Set::stream)
            .collect(Collectors.toSet());
    }

    @Override
    public void removeAttachments(final Collection<UUID> uuids) {
        if (CollectionUtils.isEmpty(uuids)) {
            return;
        }
        getSiteVisitAttachments().keySet().removeIf(uuids::contains);
        getReviewAttachments().keySet().removeIf(uuids::contains);
    }
}
