package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.SiteVisitReviewUploadAttachmentService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskUploadAttachmentActionHandler;

@Component
@RequiredArgsConstructor
public class SiteVisitUploadAttachmentHandler extends RequestTaskUploadAttachmentActionHandler {

    private final SiteVisitReviewUploadAttachmentService siteVisitReviewUploadAttachmentService;

    @Override
    public void uploadAttachment(Long requestTaskId, String attachmentUuid, String filename) {
        siteVisitReviewUploadAttachmentService.uploadAttachment(requestTaskId, attachmentUuid, filename);
    }

    @Override
    public String getType() {
        return MrtmRequestTaskActionType.SITE_VISIT_UPLOAD_REVIEW_GROUP_DECISION_ATTACHMENT;
    }
}
