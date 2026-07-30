package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisit;
import uk.gov.netz.api.workflow.request.core.domain.RequestActionPayload;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SiteVisitApplicationSubmittedRequestActionPayload extends RequestActionPayload {

    @Valid
    @NotNull
    private SiteVisit siteVisit;

    @Builder.Default
    private Map<String, String> sectionsCompleted = new HashMap<>();

    @Builder.Default
    private Map<UUID, String> siteVisitAttachments = new HashMap<>();

    @Override
    public Map<UUID, String> getAttachments() {
        return this.getSiteVisitAttachments();
    }

}
