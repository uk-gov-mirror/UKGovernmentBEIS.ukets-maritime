package uk.gov.mrtm.api.integration.external.verification.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.reporting.domain.verification.AerVerificationDecisionType;
import uk.gov.netz.api.common.validation.SpELExpression;
import uk.gov.netz.api.common.validation.uniqueelements.UniqueElements;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@SpELExpression(expression = "{(" +
    "#type eq 'VERIFIED_AS_SATISFACTORY' " +
    "&& (#comments == null OR #comments?.size() eq 0) " +
    "&& (#notVerifiedReasons == null OR #notVerifiedReasons?.size() eq 0) " +

    ")||(" +

    "#type eq 'VERIFIED_AS_SATISFACTORY_WITH_COMMENTS' " +
    "&& #comments?.size() gt 0 " +
    "&& (#notVerifiedReasons == null OR #notVerifiedReasons?.size() eq 0) " +

    ")||(" +

    "#type eq 'NOT_VERIFIED' " +
    "&& (#comments == null OR #comments?.size() eq 0) " +
    "&& #notVerifiedReasons?.size() gt 0 " +

    ")}",
    message = "aerVerificationData.external.decision.invalid")
public class ExternalAerVerificationDecision {

    @NotNull
    @Schema(description = "Assessment of this report")
    private AerVerificationDecisionType type;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Builder.Default
    @Schema(description = "List the comments for your decision. Provide only when type is 'VERIFIED_AS_SATISFACTORY_WITH_COMMENTS'")
    private List<@NotBlank @Size(max = 10000) String> comments = new ArrayList<>();

    @Builder.Default
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @JsonDeserialize(as = LinkedHashSet.class)
    @UniqueElements
    @Schema(description = "List the reasons for your decision. Provide only when type is 'NOT_VERIFIED'")
    private Set<@NotNull @Valid ExternalAerNotVerifiedDecisionReason> notVerifiedReasons = new LinkedHashSet<>();
}
