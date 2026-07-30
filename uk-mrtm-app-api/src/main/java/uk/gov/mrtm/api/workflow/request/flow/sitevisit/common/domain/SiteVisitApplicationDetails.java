package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteVisitApplicationDetails {

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Builder.Default
    @NotEmpty
    private Set<UUID> files = new HashSet<>();

    @Size(max=10000)
    private String clarification;
}
