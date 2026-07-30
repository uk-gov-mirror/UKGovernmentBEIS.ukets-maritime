package uk.gov.mrtm.api.workflow.request.flow.empvariation.domain;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestTaskDocumentAsyncGeneratedDataPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileInfoDTO;

import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload
		extends EmpVariationApplicationSubmitRequestTaskPayload implements RequestTaskDocumentAsyncGeneratedDataPayload {

    private EmissionsMonitoringPlanContainer originalEmpContainer;

    @Valid
    @NotNull
    private EmpVariationRegulatorLedReason reasonRegulatorLed;

    @Builder.Default
    private Map<EmpReviewGroup, EmpAcceptedVariationDecisionDetails> reviewGroupDecisions = new EnumMap<>(EmpReviewGroup.class);
    
    private Boolean finalDocumentsGenerationInProgress;
    private Boolean finalDocumentsGenerationSuccessful;
    
    @Builder.Default
    private Map<RequestGeneratedFileType, RequestTaskPreviewFileInfoDTO> previewFiles = new HashMap<>();
    
    @Override
    public boolean canPreviewOfficialDocument() {
    	return reasonRegulatorLed != null;
    }
    
    @Override
	public Map<UUID, String> getAttachments() {
		return Stream
				.of(getEmpAttachments(), getPreviewFileAttachments())
				.flatMap(map -> map.entrySet().stream())
	            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
	}
    
    private Map<UUID, String> getPreviewFileAttachments(){
    	return getPreviewFiles().values().stream()
				.filter(file -> file.getFile() != null && file.getFile().getUuid() != null)
				.collect(Collectors.toMap(file -> UUID.fromString(file.getFile().getUuid()),
						file -> file.getFile().getName()));
    }

}
