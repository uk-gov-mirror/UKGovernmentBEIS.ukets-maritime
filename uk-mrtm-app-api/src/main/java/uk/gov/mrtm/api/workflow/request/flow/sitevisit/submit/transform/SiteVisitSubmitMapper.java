package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.transform;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitApplicationRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmittedRequestActionPayload;
import uk.gov.netz.api.common.config.MapperConfig;

@Mapper(componentModel = "spring", config = MapperConfig.class)
public interface SiteVisitSubmitMapper {

    SiteVisitContainer toSiteVisitContainer(SiteVisitApplicationRequestTaskPayload taskPayload);

    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "payloadType", source = "payloadType")
    SiteVisitApplicationSubmittedRequestActionPayload toSiteVisitApplicationSubmittedRequestActionPayload(SiteVisitApplicationSubmitRequestTaskPayload requestTaskPayload, String payloadType);

    @Mapping(target = "payloadType", source = "payloadType")
    @Mapping(target = "sectionsCompleted", source = "requestPayload.submitSectionsCompleted")
    SiteVisitApplicationSubmitRequestTaskPayload toSiteVisitApplicationSubmitRequestTaskPayload(
        SiteVisitRequestPayload requestPayload, String payloadType);
}
