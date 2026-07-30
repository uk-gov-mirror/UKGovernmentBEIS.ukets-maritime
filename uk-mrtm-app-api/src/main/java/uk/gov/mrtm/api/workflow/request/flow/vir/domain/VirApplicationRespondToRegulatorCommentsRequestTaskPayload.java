package uk.gov.mrtm.api.workflow.request.flow.vir.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.HashMap;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class VirApplicationRespondToRegulatorCommentsRequestTaskPayload extends
    VirApplicationRequestTaskPayload {

    @Builder.Default
    private Map<String, RegulatorImprovementResponse> regulatorImprovementResponses = new HashMap<>();

    @Builder.Default
    private Map<String, OperatorImprovementFollowUpResponse> operatorImprovementFollowUpResponses = new HashMap<>();

    @Builder.Default
    private Map<String, String> virRespondToRegulatorCommentsSectionsCompleted = new HashMap<>();
}
