package uk.gov.mrtm.api.workflow.request.flow.common.domain;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//TODO - move into netz libraries
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentGenerationCompletedEventContainer {
	
	private DocumentGenerationEventOutcome outcome;
	private DocumentGenerationCompletedEvent event;
	
	@Builder.Default
	private List<String> errors = new ArrayList<>();
    
}
