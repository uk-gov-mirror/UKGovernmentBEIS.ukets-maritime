package uk.gov.mrtm.api.sitevisit.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteVisitAvailableRequestsResponse {

    @Builder.Default
    private List<Year> years = new ArrayList<>();
}
