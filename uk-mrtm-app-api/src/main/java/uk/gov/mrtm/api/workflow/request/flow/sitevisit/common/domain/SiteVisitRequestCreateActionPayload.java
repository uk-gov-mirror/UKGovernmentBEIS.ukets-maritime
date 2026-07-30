package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.workflow.request.core.domain.RequestCreateActionPayload;

import java.time.Year;


@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SiteVisitRequestCreateActionPayload extends RequestCreateActionPayload {

    private Year year;
}
