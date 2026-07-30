package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.SiteVisitOfficialNoticeService;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.workflow.request.application.filedocument.preview.service.PreviewDocumentAbstractHandler;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

import java.util.List;

@Service
public class SiteVisitRejectedOfficialLetterPreviewHandler extends PreviewDocumentAbstractHandler {

    private final SiteVisitOfficialNoticeService siteVisitOfficialNoticeService;

    public SiteVisitRejectedOfficialLetterPreviewHandler(final RequestTaskService requestTaskService,
                                                         final SiteVisitOfficialNoticeService siteVisitOfficialNoticeService) {
        super(requestTaskService);
        this.siteVisitOfficialNoticeService = siteVisitOfficialNoticeService;
    }

    @Override
    protected FileDTO generateDocument(final Long taskId, final DecisionNotification decisionNotification) {
        final RequestTask requestTask = requestTaskService.findTaskById(taskId);
        final Request request = requestTask.getRequest();
        final SiteVisitApplicationReviewRequestTaskPayload taskPayload =
            (SiteVisitApplicationReviewRequestTaskPayload) requestTask.getPayload();

        return siteVisitOfficialNoticeService.doGenerateOfficialNoticeWithoutSave(
            request,
            taskPayload.getReviewDecision(),
            decisionNotification,
            MrtmDocumentTemplateType.SITE_VISIT_REJECTED,
            "Virtual_site_visit_letter.pdf");
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmDocumentTemplateType.SITE_VISIT_REJECTED);
    }

    @Override
    protected List<String> getTaskTypes() {
        return List.of(
            MrtmRequestTaskType.SITE_VISIT_APPLICATION_REVIEW,
            MrtmRequestTaskType.SITE_VISIT_APPLICATION_PEER_REVIEW,
            MrtmRequestTaskType.SITE_VISIT_WAIT_FOR_PEER_REVIEW
        );
    }
}
