package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitReviewDecisionDetails;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestAction;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestActionDTO;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionRequiredChange;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class SiteVisitApplicationReviewApprovedCustomMapperTest {

    @InjectMocks
    private SiteVisitApplicationReviewApprovedCustomMapper cut;

    @ParameterizedTest
    @EnumSource(value = SiteVisitReviewDecisionType.class, names = {"ACCEPTED", "REJECTED"}, mode = EnumSource.Mode.INCLUDE)
    void toRequestActionDTO_accept_or_reject(SiteVisitReviewDecisionType type) {
        RequestAction requestAction = RequestAction.builder()
            .request(Request.builder().build())
            .payload(SiteVisitApplicationReviewSubmittedRequestActionPayload.builder()
                .officialNotice(FileInfoDTO.builder().uuid(UUID.randomUUID().toString()).name("name").build())
                .reviewDecision(SiteVisitReviewDecision.builder()
                    .type(type)
                    .details(SiteVisitReviewDecisionDetails.builder().summary("summary").notes("summary").build())
                    .build())
                .build())
            .build();
        SiteVisitReviewDecision expectedReviewDecision = SiteVisitReviewDecision.builder()
            .type(type)
            .details(SiteVisitReviewDecisionDetails.builder().summary("summary").build())
            .build();

        RequestActionDTO result = cut.toRequestActionDTO(requestAction);

        assertThat(result).isNotNull();
        assertThat(result.getType()).isEqualTo(requestAction.getType());
        assertThat(result.getPayload()).isInstanceOf(SiteVisitApplicationReviewSubmittedRequestActionPayload.class);

        SiteVisitApplicationReviewSubmittedRequestActionPayload resultPayload = (SiteVisitApplicationReviewSubmittedRequestActionPayload) result.getPayload();
        assertThat(resultPayload.getReviewDecision()).isEqualTo(expectedReviewDecision);
    }


    @Test
    void toRequestActionDTO_amends() {
        UUID fileUUID = UUID.randomUUID();
        RequestAction requestAction = RequestAction.builder()
            .request(Request.builder().build())
            .payload(SiteVisitApplicationReviewSubmittedRequestActionPayload.builder()
                .officialNotice(FileInfoDTO.builder().uuid(UUID.randomUUID().toString()).name("name").build())
                .reviewDecision(SiteVisitReviewDecision.builder()
                    .type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED)
                    .details(ChangesRequiredDecisionDetails.builder()
                        .notes("summary")
                        .requiredChanges(List.of(ReviewDecisionRequiredChange.builder().files(Set.of(fileUUID)).reason("reason").build()))
                        .build()).build())
                .build())
            .build();

        SiteVisitReviewDecision expectedReviewDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED)
            .details(ChangesRequiredDecisionDetails.builder()
                .requiredChanges(List.of(ReviewDecisionRequiredChange.builder().files(Set.of(fileUUID)).reason("reason").build()))
                .build()).build();

        RequestActionDTO result = cut.toRequestActionDTO(requestAction);

        assertThat(result).isNotNull();
        assertThat(result.getType()).isEqualTo(requestAction.getType());
        assertThat(result.getPayload()).isInstanceOf(SiteVisitApplicationReviewSubmittedRequestActionPayload.class);

        SiteVisitApplicationReviewSubmittedRequestActionPayload resultPayload = (SiteVisitApplicationReviewSubmittedRequestActionPayload) result.getPayload();
        assertThat(resultPayload.getReviewDecision()).isEqualTo(expectedReviewDecision);
    }

    @Test
    void getUserRoleTypes() {
        assertThat(cut.getUserRoleTypes()).containsExactlyInAnyOrder(RoleTypeConstants.OPERATOR, RoleTypeConstants.VERIFIER);
    }

    @Test
    void getRequestActionType() {
        assertThat(cut.getRequestActionType()).isEqualTo(MrtmRequestActionType.SITE_VISIT_APPLICATION_APPROVED);
    }

}