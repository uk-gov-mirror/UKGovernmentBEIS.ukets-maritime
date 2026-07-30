package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.workflow.request.core.domain.RequestMetadata;
import uk.gov.netz.api.workflow.request.core.domain.RequestMetadataReportable;

import java.time.Year;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SiteVisitRequestMetadata extends RequestMetadata implements RequestMetadataReportable {

    @NotNull
    private Year year;
}
