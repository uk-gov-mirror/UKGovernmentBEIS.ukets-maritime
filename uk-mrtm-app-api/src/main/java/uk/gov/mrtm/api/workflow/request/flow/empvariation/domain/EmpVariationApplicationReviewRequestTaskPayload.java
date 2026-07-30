package uk.gov.mrtm.api.workflow.request.flow.empvariation.domain;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.util.CollectionUtils;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestTaskDocumentAsyncGeneratedDataPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileInfoDTO;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ReviewDecisionRequiredChange;
import uk.gov.netz.api.workflow.request.flow.rfi.domain.RequestTaskPayloadRfiAttachable;

import java.util.Collection;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@SuperBuilder
public class EmpVariationApplicationReviewRequestTaskPayload extends EmpVariationApplicationSubmitRequestTaskPayload
        implements RequestTaskPayloadRfiAttachable, RequestTaskDocumentAsyncGeneratedDataPayload {

    private EmissionsMonitoringPlanContainer originalEmpContainer;

    private EmpVariationReviewDecision empVariationDetailsReviewDecision; 

    private String empVariationDetailsReviewCompleted;

    @Builder.Default
    private Map<EmpReviewGroup, EmpVariationReviewDecision> reviewGroupDecisions = new EnumMap<>(EmpReviewGroup.class);
    
    private EmpVariationDetermination determination;
    
    private Boolean finalDocumentsGenerationInProgress;
    private Boolean finalDocumentsGenerationSuccessful;
    
    @Builder.Default
    private Map<RequestGeneratedFileType, RequestTaskPreviewFileInfoDTO> previewFiles = new HashMap<>();

    @Builder.Default
    private Map<UUID, String> reviewAttachments = new HashMap<>();

    @Builder.Default
    private Map<UUID, String> rfiAttachments = new HashMap<>();
    
    @Override
    public Map<UUID, String> getAttachments() {
        return Stream.of(super.getAttachments(), getReviewAttachments(), getRfiAttachments(), getPreviewFileAttachments())
            .flatMap(map -> map.entrySet().stream())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    @Override
    public Set<UUID> getReferencedAttachmentIds() {
        final Set<UUID> reviewGroupsReviewAttachmentsUuids = getReviewGroupDecisions().values().stream()
            .filter(empVariationReviewDecision -> empVariationReviewDecision.getType() == EmpVariationReviewDecisionType.OPERATOR_AMENDS_NEEDED)
            .flatMap(
                empVariationReviewDecision -> ((ChangesRequiredDecisionDetails) empVariationReviewDecision.getDetails()).getRequiredChanges().stream()
                    .map(ReviewDecisionRequiredChange::getFiles))
            .flatMap(Set::stream)
            .collect(Collectors.toSet());

        final Set<UUID> variationDetailsReviewAttachmentsUuids = new HashSet<>();
        if (empVariationDetailsReviewDecision != null
            && empVariationDetailsReviewDecision.getType() == EmpVariationReviewDecisionType.OPERATOR_AMENDS_NEEDED) {
            variationDetailsReviewAttachmentsUuids
                .addAll(((ChangesRequiredDecisionDetails) empVariationDetailsReviewDecision.getDetails())
                    .getRequiredChanges().stream()
                    .flatMap(change -> change.getFiles().stream())
                    .collect(Collectors.toSet()));
        }

        return Stream.of(super.getReferencedAttachmentIds(), reviewGroupsReviewAttachmentsUuids, variationDetailsReviewAttachmentsUuids)
            .flatMap(Set::stream)
            .collect(Collectors.toSet());
    }

    @Override
    public void removeAttachments(final Collection<UUID> uuids) {
        if (CollectionUtils.isEmpty(uuids)) {
            return;
        }
        getEmpAttachments().keySet().removeIf(uuids::contains);
        getReviewAttachments().keySet().removeIf(uuids::contains);
        getRfiAttachments().keySet().removeIf(uuids::contains);
    }
    
    @Override
    public boolean canPreviewOfficialDocument() {
    	return determination != null;
    }
    
    private Map<UUID, String> getPreviewFileAttachments(){
    	return getPreviewFiles().values().stream()
				.filter(file -> file.getFile() != null && file.getFile().getUuid() != null)
				.collect(Collectors.toMap(file -> UUID.fromString(file.getFile().getUuid()),
						file -> file.getFile().getName()));
    }

}
