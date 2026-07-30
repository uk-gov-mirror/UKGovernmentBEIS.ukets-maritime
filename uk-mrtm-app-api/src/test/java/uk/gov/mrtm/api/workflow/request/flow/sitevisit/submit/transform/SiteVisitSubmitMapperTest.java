package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.transform;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisit;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitApplicationRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmittedRequestActionPayload;

import java.time.Year;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class SiteVisitSubmitMapperTest {

    private final SiteVisitSubmitMapper mapper = Mappers.getMapper(SiteVisitSubmitMapper.class);

    @Test
    void toSiteVisitContainer() {
        Map<UUID, String> attachments = Map.of(UUID.randomUUID(), "filename.txt");
        SiteVisit siteVisit = mock(SiteVisit.class);
        TestSiteVisitApplicationRequestTaskPayload taskPayload =
            TestSiteVisitApplicationRequestTaskPayload.builder()
                .siteVisit(siteVisit)
                .siteVisitAttachments(attachments)
                .build();
        SiteVisitContainer expectedSiteVisitContainer = SiteVisitContainer.builder()
            .siteVisit(siteVisit)
            .siteVisitAttachments(attachments)
            .build();

        SiteVisitContainer siteVisitContainer = mapper.toSiteVisitContainer(taskPayload);

        assertThat(siteVisitContainer).isEqualTo(expectedSiteVisitContainer);
    }

    @Test
    void toSiteVisitApplicationSubmittedRequestActionPayload() {
        Map<UUID, String> attachments = Map.of(UUID.randomUUID(), "filename.txt");
        SiteVisit siteVisit = mock(SiteVisit.class);
        String payloadType = "payloadType";
        Map<String, String> sectionsCompleted = Map.of("section", "COMPLETED");
        SiteVisitApplicationSubmitRequestTaskPayload taskPayload =
            SiteVisitApplicationSubmitRequestTaskPayload.builder()
                .siteVisit(siteVisit)
                .siteVisitAttachments(attachments)
                .sectionsCompleted(sectionsCompleted)
                .build();
        SiteVisitApplicationSubmittedRequestActionPayload expected = SiteVisitApplicationSubmittedRequestActionPayload.builder()
            .siteVisit(siteVisit)
            .siteVisitAttachments(attachments)
            .payloadType(payloadType)
            .sectionsCompleted(sectionsCompleted)
            .build();

        SiteVisitApplicationSubmittedRequestActionPayload actual = mapper
            .toSiteVisitApplicationSubmittedRequestActionPayload(taskPayload, payloadType);

        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void toSiteVisitApplicationSubmitRequestTaskPayload() {
        Map<UUID, String> attachments = Map.of(UUID.randomUUID(), "filename.txt");
        SiteVisit siteVisit = mock(SiteVisit.class);
        String payloadType = "payloadType";
        Map<String, String> sectionsCompleted = Map.of("section", "COMPLETED");
        Year year = Year.now();
        SiteVisitRequestPayload requestPayload =
            SiteVisitRequestPayload.builder()
                .siteVisit(siteVisit)
                .year(year)
                .siteVisitAttachments(attachments)
                .submitSectionsCompleted(sectionsCompleted)
                .build();
        SiteVisitApplicationSubmitRequestTaskPayload expected = SiteVisitApplicationSubmitRequestTaskPayload.builder()
            .siteVisit(siteVisit)
            .siteVisitAttachments(attachments)
            .payloadType(payloadType)
            .sectionsCompleted(sectionsCompleted)
            .year(year)
            .build();

        SiteVisitApplicationSubmitRequestTaskPayload actual = mapper
            .toSiteVisitApplicationSubmitRequestTaskPayload(requestPayload, payloadType);

        assertThat(actual).isEqualTo(expected);
    }

    @EqualsAndHashCode(callSuper = true)
    @SuperBuilder
    @AllArgsConstructor
    @Data
    public static class TestSiteVisitApplicationRequestTaskPayload extends SiteVisitApplicationRequestTaskPayload {
    }
}