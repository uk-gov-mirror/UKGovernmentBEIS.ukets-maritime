package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitReviewDecisionDetails;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.SiteVisitOfficialNoticeService;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitApprovedOfficialLetterPreviewHandlerTest {

    @InjectMocks
    private SiteVisitApprovedOfficialLetterPreviewHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private SiteVisitOfficialNoticeService siteVisitOfficialNoticeService;

    @Captor
    private ArgumentCaptor<SiteVisitReviewDecision> reviewDecisionCaptor;

    @Test
    void generateDocument_usesTaskReviewDecisionWithoutMutatingRequestPayload() {
        final Long taskId = 1L;
        final DecisionNotification decisionNotification = DecisionNotification.builder().build();
        final SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().build();
        final Request request = Request.builder().payload(requestPayload).build();
        final SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder()
            .type(SiteVisitReviewDecisionType.ACCEPTED)
            .details(SiteVisitReviewDecisionDetails.builder().summary("Accepted summary").build())
            .build();
        final SiteVisitApplicationReviewRequestTaskPayload taskPayload = SiteVisitApplicationReviewRequestTaskPayload.builder()
            .reviewDecision(reviewDecision)
            .build();
        final RequestTask requestTask = RequestTask.builder()
            .request(request)
            .payload(taskPayload)
            .build();
        final FileDTO fileDTO = FileDTO.builder().fileName("Virtual_site_visit_letter.pdf").build();

        when(requestTaskService.findTaskById(taskId)).thenReturn(requestTask);
        when(siteVisitOfficialNoticeService.doGenerateOfficialNoticeWithoutSave(
            eq(request),
            reviewDecisionCaptor.capture(),
            eq(decisionNotification),
            eq(MrtmDocumentTemplateType.SITE_VISIT_APPROVED),
            eq("Virtual_site_visit_letter.pdf"))).thenReturn(fileDTO);

        final FileDTO result = handler.generateDocument(taskId, decisionNotification);

        assertEquals(fileDTO, result);
        assertThat(requestPayload.getReviewDecision()).isNull();
        assertThat(requestPayload.getDecisionNotification()).isNull();
        assertThat(reviewDecisionCaptor.getValue()).isEqualTo(reviewDecision);

        verify(requestTaskService).findTaskById(taskId);
        verify(siteVisitOfficialNoticeService).doGenerateOfficialNoticeWithoutSave(
            eq(request),
            eq(reviewDecision),
            eq(decisionNotification),
            eq(MrtmDocumentTemplateType.SITE_VISIT_APPROVED),
            eq("Virtual_site_visit_letter.pdf"));
        verifyNoMoreInteractions(requestTaskService, siteVisitOfficialNoticeService);
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes()).containsExactly(MrtmDocumentTemplateType.SITE_VISIT_APPROVED);
    }

    @Test
    void getTaskTypes() {
        assertThat(handler.getTaskTypes()).containsExactlyElementsOf(List.of(
            MrtmRequestTaskType.SITE_VISIT_APPLICATION_REVIEW,
            MrtmRequestTaskType.SITE_VISIT_APPLICATION_PEER_REVIEW,
            MrtmRequestTaskType.SITE_VISIT_WAIT_FOR_PEER_REVIEW
        ));
    }
}
