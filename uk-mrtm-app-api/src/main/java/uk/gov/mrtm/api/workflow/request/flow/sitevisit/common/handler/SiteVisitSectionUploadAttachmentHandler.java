package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.service.SiteVisitSectionUploadAttachmentService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskUploadAttachmentActionHandler;

@Component
@RequiredArgsConstructor
public class SiteVisitSectionUploadAttachmentHandler extends RequestTaskUploadAttachmentActionHandler {

    private final SiteVisitSectionUploadAttachmentService siteVisitSectionUploadAttachmentService;

    @Override
    public void uploadAttachment(Long requestTaskId, String attachmentUuid, String filename) {
        siteVisitSectionUploadAttachmentService.uploadAttachment(requestTaskId, attachmentUuid, filename);
    }

    @Override
    public String getType() {
        return MrtmRequestTaskActionType.SITE_VISIT_UPLOAD_ATTACHMENT;
    }
}
