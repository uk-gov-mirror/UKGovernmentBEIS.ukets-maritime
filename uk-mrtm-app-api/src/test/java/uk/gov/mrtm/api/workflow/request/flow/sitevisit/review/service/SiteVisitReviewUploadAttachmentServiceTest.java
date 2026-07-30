package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitReviewUploadAttachmentServiceTest {

    @InjectMocks
    private SiteVisitReviewUploadAttachmentService service;

    @Mock
    private RequestTaskService requestTaskService;

    @Test
    void uploadAttachment() {
        Long requestTaskId = 1L;
        String fileName = "name";
        RequestTask requestTask = RequestTask.builder()
            .id(requestTaskId)
            .payload(SiteVisitApplicationReviewRequestTaskPayload.builder().build())
            .build();
        String attachmentUuid = UUID.randomUUID().toString();
        when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);

        service.uploadAttachment(requestTaskId, attachmentUuid, fileName);

        verify(requestTaskService).findTaskById(requestTaskId);
        assertThat(requestTask.getPayload().getAttachments()).containsEntry(UUID.fromString(attachmentUuid), fileName);
        verifyNoMoreInteractions(requestTaskService);
    }
}