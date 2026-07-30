package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestMetadataType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestCreateActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.workflow.request.StartProcessRequestService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestAccountCreateActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestParams;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class SiteVisitCreateActionHandler implements RequestAccountCreateActionHandler<SiteVisitRequestCreateActionPayload> {

    private final StartProcessRequestService startProcessRequestService;

    @Override
    public String process(Long accountId, SiteVisitRequestCreateActionPayload payload, AppUser appUser) {
        final RequestParams requestParams = RequestParams.builder()
                .type(MrtmRequestType.SITE_VISIT)
                .requestResources(Map.of(ResourceType.ACCOUNT, accountId.toString()))
                .requestMetadata(SiteVisitRequestMetadata.builder()
                        .type(MrtmRequestMetadataType.SITE_VISIT)
                        .year(payload.getYear())
                        .build())
                .requestPayload(SiteVisitRequestPayload.builder()
                        .payloadType(MrtmRequestPayloadType.SITE_VISIT_REQUEST_PAYLOAD)
                        .operatorAssignee(appUser.getUserId())
                        .year(payload.getYear())
                        .build())
                .build();

        final Request request = startProcessRequestService.startProcess(requestParams);

        return request.getId();
    }

    @Override
    public String getRequestType() {
        return MrtmRequestType.SITE_VISIT;
    }
}
