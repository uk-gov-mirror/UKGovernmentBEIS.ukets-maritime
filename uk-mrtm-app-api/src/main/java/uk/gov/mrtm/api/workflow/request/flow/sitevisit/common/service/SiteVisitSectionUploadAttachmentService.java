package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitApplicationRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SiteVisitSectionUploadAttachmentService {

    private final RequestTaskService requestTaskService;

    @Transactional
    public void uploadAttachment(Long requestTaskId, String attachmentUuid, String filename) {
        RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);
        SiteVisitApplicationRequestTaskPayload requestTaskPayload = (SiteVisitApplicationRequestTaskPayload) requestTask.getPayload();

        requestTaskPayload.getSiteVisitAttachments().put(UUID.fromString(attachmentUuid), filename);
    }
}
