package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.RequestPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

import java.time.Year;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class SiteVisitRequestPayload extends RequestPayload {

    private SiteVisit siteVisit;

    private Year year;

    @Builder.Default
    private Map<String, String> submitSectionsCompleted = new HashMap<>();

    @Builder.Default
    private Map<String, String> reviewSectionsCompleted = new HashMap<>();

    @Builder.Default
    private Map<String, String> amendsSectionsCompleted = new HashMap<>();

    @Builder.Default
    private Map<UUID, String> siteVisitAttachments = new HashMap<>();

    private SiteVisitReviewDecision reviewDecision;

    @Builder.Default
    private Map<UUID, String> reviewAttachments = new HashMap<>();

    private DecisionNotification decisionNotification;

    private FileInfoDTO officialNotice;
}
