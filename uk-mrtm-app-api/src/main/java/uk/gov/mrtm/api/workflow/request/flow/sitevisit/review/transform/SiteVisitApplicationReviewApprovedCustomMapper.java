package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform;

import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.netz.api.common.constants.RoleTypeConstants;

import java.util.Set;

@Service
public class SiteVisitApplicationReviewApprovedCustomMapper extends SiteVisitApplicationReviewSubmittedCustomMapper {

    @Override
    public String getRequestActionType() {
        return MrtmRequestActionType.SITE_VISIT_APPLICATION_APPROVED;
    }

    @Override
    public Set<String> getUserRoleTypes() {
        return Set.of(RoleTypeConstants.OPERATOR, RoleTypeConstants.VERIFIER);
    }
}
