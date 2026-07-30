package uk.gov.mrtm.api.workflow.request.flow.common.domain;

import java.util.HashMap;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//TODO - move into netz libraries
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentGenerationCompletedEvent {

	private String processId;
	private String outputFileName;
	
	@Builder.Default
    private Map<String, Object> metadata = new HashMap<>(); 
	
}
