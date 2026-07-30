package uk.gov.mrtm.api.workflow.request.flow.common.emp.event;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpReviewDocumentGenerateDto {

	private RequestGeneratedFileType type;
	private Long requestTaskId;
	private DocumentTemplateStage stage;
	
	@Nullable
	private DecisionNotification decisionNotification;
	
}
