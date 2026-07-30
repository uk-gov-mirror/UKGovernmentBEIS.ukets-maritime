package uk.gov.mrtm.api.sitevisit.domain;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisit;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SiteVisitContainer {

    @Valid
    @NotNull
    private SiteVisit siteVisit;

    @Builder.Default
    private Map<UUID, String> siteVisitAttachments = new HashMap<>();
}
