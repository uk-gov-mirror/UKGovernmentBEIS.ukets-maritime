package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.util.ObjectUtils;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteVisit {

    @Valid
    @NotNull
    private SiteVisitApplicationDetails applicationDetails;


    @JsonIgnore
    public Set<UUID> getSiteVisitSectionAttachmentIds() {
        Set<UUID> attachments = new HashSet<>();
        if (applicationDetails != null && !ObjectUtils.isEmpty(applicationDetails.getFiles())) {
            attachments.addAll(applicationDetails.getFiles());
        }
        return Collections.unmodifiableSet(attachments);
    }
}
