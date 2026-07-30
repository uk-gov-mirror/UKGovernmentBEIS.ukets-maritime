package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform;

import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.workflow.request.core.domain.RequestAction;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestActionDTO;
import uk.gov.netz.api.workflow.request.core.transform.RequestActionCustomMapper;
import uk.gov.netz.api.workflow.request.core.transform.RequestActionMapper;

import java.util.Set;

@Service
public class SiteVisitApplicationReturnedForAmendsCustomMapper implements RequestActionCustomMapper {

    private final RequestActionMapper requestActionMapper = Mappers.getMapper(RequestActionMapper.class);

    private final SiteVisitReviewMapper requestActionPayloadMapper = Mappers.getMapper(SiteVisitReviewMapper.class);

    @Override
    public RequestActionDTO toRequestActionDTO(RequestAction requestAction) {

        final SiteVisitApplicationReturnedForAmendsRequestActionPayload actionPayload =
            (SiteVisitApplicationReturnedForAmendsRequestActionPayload) requestAction.getPayload();

        final RequestActionDTO requestActionDTO = requestActionMapper.toRequestActionDTOIgnorePayload(requestAction);

        final SiteVisitApplicationReturnedForAmendsRequestActionPayload dtoPayload =
            requestActionPayloadMapper.cloneReturnedForAmendsPayloadIgnoreNotes(actionPayload);

        requestActionDTO.setPayload(dtoPayload);

        return requestActionDTO;
    }

    @Override
    public String getRequestActionType() {
        return MrtmRequestActionType.SITE_VISIT_APPLICATION_RETURNED_FOR_AMENDS;
    }

    @Override
    public Set<String> getUserRoleTypes() {
        return Set.of(RoleTypeConstants.OPERATOR, RoleTypeConstants.VERIFIER);
    }
}
