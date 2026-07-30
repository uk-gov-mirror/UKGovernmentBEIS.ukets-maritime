package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSaveRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.transform.SiteVisitSubmitMapper;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestService;

import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_SUBMITTED_PAYLOAD;

@Service
@RequiredArgsConstructor
public class RequestSiteVisitService {

    private final SiteVisitValidatorService siteVisitValidatorService;
    private final SiteVisitSubmitMapper siteVisitSubmitMapper;
    private final RequestService requestService;

    @Transactional
    public void applySavePayload(SiteVisitApplicationSaveRequestTaskActionPayload actionPayload,
                                 RequestTask requestTask) {
        SiteVisitApplicationSubmitRequestTaskPayload taskPayload = (SiteVisitApplicationSubmitRequestTaskPayload) requestTask.getPayload();

        taskPayload.setSiteVisit(actionPayload.getSiteVisit());
        taskPayload.setSectionsCompleted(actionPayload.getSectionsCompleted());
    }

    @Transactional
    public void applySubmitAction(RequestTask requestTask, AppUser appUser) {
        //validate
        SiteVisitApplicationSubmitRequestTaskPayload requestTaskPayload =
            (SiteVisitApplicationSubmitRequestTaskPayload) requestTask.getPayload();

        SiteVisitContainer siteVisitContainer = siteVisitSubmitMapper.toSiteVisitContainer(requestTaskPayload);
        siteVisitValidatorService.validateSiteVisit(siteVisitContainer);

        //update request payload
        Request request = requestTask.getRequest();
        SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();
        requestPayload.setSiteVisit(requestTaskPayload.getSiteVisit());
        requestPayload.setSiteVisitAttachments(requestTaskPayload.getSiteVisitAttachments());
        requestPayload.setSubmitSectionsCompleted(requestTaskPayload.getSectionsCompleted());

        //add request action
        addApplicationSubmittedRequestAction(requestTaskPayload, request, appUser);
    }

    private void addApplicationSubmittedRequestAction(SiteVisitApplicationSubmitRequestTaskPayload requestTaskPayload,
                                                     Request request, AppUser appUser) {

        SiteVisitApplicationSubmittedRequestActionPayload requestActionPayload =
            siteVisitSubmitMapper.toSiteVisitApplicationSubmittedRequestActionPayload(requestTaskPayload, SITE_VISIT_APPLICATION_SUBMITTED_PAYLOAD);

        requestService.addActionToRequest(request,
            requestActionPayload,
            MrtmRequestActionType.SITE_VISIT_APPLICATION_SUBMITTED,
            appUser.getUserId());
    }
}