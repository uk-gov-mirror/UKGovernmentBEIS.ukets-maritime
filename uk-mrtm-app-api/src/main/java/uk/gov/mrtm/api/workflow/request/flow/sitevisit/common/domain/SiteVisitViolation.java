package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain;

import lombok.Getter;

@Getter
public enum SiteVisitViolation {

    ATTACHMENT_NOT_FOUND("Attachment not found"),
    ATTACHMENT_NOT_REFERENCED("Attachment is not referenced in Site Visit");

    private final String message;

    SiteVisitViolation(String message) {
        this.message = message;
    }
    
}
