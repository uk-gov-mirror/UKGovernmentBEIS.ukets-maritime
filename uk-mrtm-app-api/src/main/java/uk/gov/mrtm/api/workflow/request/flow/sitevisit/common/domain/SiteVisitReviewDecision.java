package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.swagger.v3.oas.annotations.media.DiscriminatorMapping;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitReviewDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionDetails;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(
    discriminatorMapping = {
        @DiscriminatorMapping(schema = SiteVisitReviewDecisionDetails.class, value = "ACCEPTED"),
        @DiscriminatorMapping(schema = SiteVisitReviewDecisionDetails.class, value = "REJECTED"),
        @DiscriminatorMapping(schema = ChangesRequiredDecisionDetails.class, value = "OPERATOR_AMENDS_NEEDED")
    },
    discriminatorProperty = "type")
public class SiteVisitReviewDecision {

    @NotNull
    private SiteVisitReviewDecisionType type;

    @Valid
    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type", visible = true,
        defaultImpl =  SiteVisitReviewDecisionDetails.class)
    @JsonSubTypes({
        @JsonSubTypes.Type(value = SiteVisitReviewDecisionDetails.class, name = "ACCEPTED"),
        @JsonSubTypes.Type(value = SiteVisitReviewDecisionDetails.class, name = "REJECTED"),
        @JsonSubTypes.Type(value = ChangesRequiredDecisionDetails.class, name = "OPERATOR_AMENDS_NEEDED")
    })
    private ReviewDecisionDetails details;
}
