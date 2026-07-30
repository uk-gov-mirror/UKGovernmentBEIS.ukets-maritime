package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.service.SiteVisitSectionUploadAttachmentService;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SiteVisitSectionUploadAttachmentHandlerTest {

    @InjectMocks
    private SiteVisitSectionUploadAttachmentHandler siteVisitSectionUploadAttachmentHandler;

    @Mock
    private SiteVisitSectionUploadAttachmentService siteVisitSectionUploadAttachmentService;

    @Test
    void uploadAttachment() {
        Long requestTaskId = 1L;
        String filename = "filename";
        String attachmentUuid = UUID.randomUUID().toString();

        siteVisitSectionUploadAttachmentHandler.uploadAttachment(requestTaskId, attachmentUuid, filename);

        verify(siteVisitSectionUploadAttachmentService, times(1))
            .uploadAttachment(requestTaskId, attachmentUuid, filename);
    }

    @Test
    void getType() {
        assertEquals(MrtmRequestTaskActionType.SITE_VISIT_UPLOAD_ATTACHMENT, siteVisitSectionUploadAttachmentHandler.getType());
    }
}