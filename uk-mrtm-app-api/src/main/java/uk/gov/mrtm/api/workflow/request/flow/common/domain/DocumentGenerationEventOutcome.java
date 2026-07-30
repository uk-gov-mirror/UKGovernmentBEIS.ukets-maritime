package uk.gov.mrtm.api.workflow.request.flow.common.domain;

//TODO - move into netz libraries
public enum DocumentGenerationEventOutcome {
	
	COMPLETE,
    FAILED,
    
    PROCESSING,
    QUEUED,
    SUBMISSION_FAILED,
    PENDING,
    NOT_FOUND
	
}
