package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform;

import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewSubmittedRequestActionPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestAction;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestActionDTO;
import uk.gov.netz.api.workflow.request.core.transform.RequestActionCustomMapper;
import uk.gov.netz.api.workflow.request.core.transform.RequestActionMapper;

@Service
public abstract class SiteVisitApplicationReviewSubmittedCustomMapper implements RequestActionCustomMapper {

    private final RequestActionMapper requestActionMapper = Mappers.getMapper(RequestActionMapper.class);

    private final SiteVisitReviewMapper requestActionPayloadMapper = Mappers.getMapper(SiteVisitReviewMapper.class);

    @Override
    public RequestActionDTO toRequestActionDTO(RequestAction requestAction) {

        final SiteVisitApplicationReviewSubmittedRequestActionPayload actionPayload =
            (SiteVisitApplicationReviewSubmittedRequestActionPayload) requestAction.getPayload();

        final RequestActionDTO requestActionDTO = requestActionMapper.toRequestActionDTOIgnorePayload(requestAction);

        final SiteVisitApplicationReviewSubmittedRequestActionPayload dtoPayload =
            requestActionPayloadMapper.cloneReviewSubmittedPayloadIgnoreNotes(actionPayload);

        requestActionDTO.setPayload(dtoPayload);

        return requestActionDTO;
    }

}
