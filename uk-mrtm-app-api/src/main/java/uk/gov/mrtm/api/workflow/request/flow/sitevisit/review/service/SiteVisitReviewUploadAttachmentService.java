package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SiteVisitReviewUploadAttachmentService {

    private final RequestTaskService requestTaskService;

    @Transactional
    public void uploadAttachment(Long requestTaskId, String attachmentUuid, String filename) {
        RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);
        SiteVisitApplicationReviewRequestTaskPayload requestTaskPayload =
                (SiteVisitApplicationReviewRequestTaskPayload) requestTask.getPayload();

        requestTaskPayload.getReviewAttachments().put(UUID.fromString(attachmentUuid), filename);
    }
}
