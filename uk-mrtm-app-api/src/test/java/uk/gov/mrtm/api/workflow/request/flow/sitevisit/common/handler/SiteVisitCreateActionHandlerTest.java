package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestMetadataType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestCreateActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.netz.api.authorization.core.domain.AppAuthority;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.workflow.request.StartProcessRequestService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestParams;

import java.time.Year;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitCreateActionHandlerTest {

    @InjectMocks
    private SiteVisitCreateActionHandler handler;

    @Mock
    private StartProcessRequestService startProcessRequestService;

    @Test
    void getRequestType() {
        assertThat(handler.getRequestType()).isEqualTo(MrtmRequestType.SITE_VISIT);
    }

    @Test
    void process() {
        final Long accountId = 1L;
        final Year year = Year.now();
        final SiteVisitRequestCreateActionPayload payload =
            SiteVisitRequestCreateActionPayload.builder().year(year).build();
        final AppUser appUser = AppUser.builder().userId("userId")
            .authorities(List.of(AppAuthority.builder().accountId(accountId).build()))
            .build();

        RequestParams expectedRequestParams = RequestParams.builder()
            .type(MrtmRequestType.SITE_VISIT)
            .requestResources(Map.of(ResourceType.ACCOUNT, accountId.toString()))
            .requestMetadata(SiteVisitRequestMetadata.builder()
                .type(MrtmRequestMetadataType.SITE_VISIT)
                .year(payload.getYear())
                .build())
            .requestPayload(SiteVisitRequestPayload.builder()
                .payloadType(MrtmRequestPayloadType.SITE_VISIT_REQUEST_PAYLOAD)
                .operatorAssignee(appUser.getUserId())
                .year(payload.getYear())
                .build())
            .build();

        when(startProcessRequestService.startProcess(expectedRequestParams))
            .thenReturn(Request.builder().id("requestId").build());


        final String requestId = handler.process(accountId, payload, appUser);
        assertEquals("requestId", requestId);

        verify(startProcessRequestService, times(1)).startProcess(expectedRequestParams);
        verifyNoMoreInteractions(startProcessRequestService);
    }
}
