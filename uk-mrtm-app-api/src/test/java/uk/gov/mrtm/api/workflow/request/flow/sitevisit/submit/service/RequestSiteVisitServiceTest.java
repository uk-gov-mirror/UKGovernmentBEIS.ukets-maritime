package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisit;
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

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_SUBMITTED_PAYLOAD;

@ExtendWith(MockitoExtension.class)
class RequestSiteVisitServiceTest {

    @InjectMocks
    private RequestSiteVisitService service;

    @Mock
    private SiteVisitValidatorService siteVisitValidatorService;
    @Mock
    private SiteVisitSubmitMapper siteVisitSubmitMapper;
    @Mock
    private RequestService requestService;

    @Test
    void applySavePayload() {
        SiteVisit siteVisit = mock(SiteVisit.class);
        Map<String, String> sectionsCompleted = Map.of("a", "b");
        SiteVisitApplicationSaveRequestTaskActionPayload actionPayload = SiteVisitApplicationSaveRequestTaskActionPayload.builder()
            .siteVisit(siteVisit)
            .sectionsCompleted(sectionsCompleted)
            .build();
        SiteVisitApplicationSubmitRequestTaskPayload requestTaskPayload = SiteVisitApplicationSubmitRequestTaskPayload
            .builder()
            .build();
        SiteVisitApplicationSubmitRequestTaskPayload expectedRequestTaskPayload = SiteVisitApplicationSubmitRequestTaskPayload
            .builder()
            .siteVisit(siteVisit)
            .sectionsCompleted(sectionsCompleted)
            .build();
        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .build();

        service.applySavePayload(actionPayload, requestTask);

        assertThat(requestTask.getPayload()).isEqualTo(expectedRequestTaskPayload);

        verifyNoMoreInteractions(requestService, siteVisitSubmitMapper, siteVisitValidatorService);
    }

    @Test
    void applySubmitAction() {
        String userId = "userId";
        AppUser appUser = AppUser.builder().userId(userId).build();
        Map<String, String> sectionsCompleted = Map.of("a", "b");
        Map<UUID, String> attachments = Map.of(UUID.randomUUID(), "filename.txt");
        SiteVisit siteVisit = mock(SiteVisit.class);
        SiteVisitApplicationSubmitRequestTaskPayload requestTaskPayload = SiteVisitApplicationSubmitRequestTaskPayload
            .builder()
            .siteVisit(siteVisit)
            .sectionsCompleted(sectionsCompleted)
            .siteVisitAttachments(attachments)
            .build();
        SiteVisitRequestPayload requestPayload = SiteVisitRequestPayload.builder().build();
        SiteVisitRequestPayload expectedRequestPayload = SiteVisitRequestPayload.builder()
            .siteVisit(siteVisit)
            .submitSectionsCompleted(sectionsCompleted)
            .siteVisitAttachments(attachments)
            .build();
        Request request = Request.builder()
            .payload(requestPayload)
            .build();
        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .request(request)
            .build();
        SiteVisitContainer siteVisitContainer = mock(SiteVisitContainer.class);
        SiteVisitApplicationSubmittedRequestActionPayload requestActionPayload = mock(SiteVisitApplicationSubmittedRequestActionPayload.class);

        when(siteVisitSubmitMapper.toSiteVisitContainer(requestTaskPayload)).thenReturn(siteVisitContainer);
        when(siteVisitSubmitMapper.toSiteVisitApplicationSubmittedRequestActionPayload(
            requestTaskPayload, SITE_VISIT_APPLICATION_SUBMITTED_PAYLOAD)).thenReturn(requestActionPayload);

        service.applySubmitAction(requestTask, appUser);

        assertThat(requestTask.getRequest().getPayload()).isEqualTo(expectedRequestPayload);

        verify(siteVisitSubmitMapper).toSiteVisitContainer(requestTaskPayload);
        verify(siteVisitValidatorService).validateSiteVisit(siteVisitContainer);
        verify(siteVisitSubmitMapper).toSiteVisitApplicationSubmittedRequestActionPayload(
            requestTaskPayload, SITE_VISIT_APPLICATION_SUBMITTED_PAYLOAD);
        verify(requestService).addActionToRequest(request,
            requestActionPayload, MrtmRequestActionType.SITE_VISIT_APPLICATION_SUBMITTED, userId);

        verifyNoMoreInteractions(siteVisitSubmitMapper, siteVisitValidatorService, requestService);
    }
}