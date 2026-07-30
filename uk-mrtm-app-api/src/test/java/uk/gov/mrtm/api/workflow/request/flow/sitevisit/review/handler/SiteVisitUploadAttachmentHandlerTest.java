package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.SiteVisitReviewUploadAttachmentService;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

@ExtendWith(MockitoExtension.class)
class SiteVisitUploadAttachmentHandlerTest {

    @InjectMocks
    private SiteVisitUploadAttachmentHandler handler;

    @Mock
    private SiteVisitReviewUploadAttachmentService siteVisitReviewUploadAttachmentService;

    @Test
    void uploadAttachment() {
        Long requestTaskId = 1L;
        String filename = "filename";
        String attachmentUuid = UUID.randomUUID().toString();

        handler.uploadAttachment(requestTaskId, attachmentUuid, filename);

        verify(siteVisitReviewUploadAttachmentService)
            .uploadAttachment(requestTaskId, attachmentUuid, filename);
        verifyNoMoreInteractions(siteVisitReviewUploadAttachmentService);
    }

    @Test
    void getType() {
        assertEquals(MrtmRequestTaskActionType.SITE_VISIT_UPLOAD_REVIEW_GROUP_DECISION_ATTACHMENT, handler.getType());
    }
}
