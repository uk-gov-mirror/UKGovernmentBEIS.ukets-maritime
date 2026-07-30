package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;

import java.time.Year;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class SiteVisitApplicationRequestTaskPayload extends RequestTaskPayload {

    private SiteVisit siteVisit;

    @NotNull
    private Year year;

    @Builder.Default
    private Map<UUID, String> siteVisitAttachments = new HashMap<>();

    @Builder.Default
    private Map<String, String> sectionsCompleted = new HashMap<>();

    @JsonIgnore
    @Override
    public Map<UUID, String> getAttachments() {
        return this.getSiteVisitAttachments();
    }

    @Override
    public Set<UUID> getReferencedAttachmentIds() {
        return this.getSiteVisit() != null ?
            this.getSiteVisit().getSiteVisitSectionAttachmentIds() :
            Collections.emptySet();
    }
}
