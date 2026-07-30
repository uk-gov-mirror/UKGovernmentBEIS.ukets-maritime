package uk.gov.mrtm.api.integration.external.emp.domain.delegatedresponsibility;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.common.validation.SpELExpression;
import uk.gov.netz.api.common.validation.uniqueelements.UniqueElements;

import java.util.LinkedHashSet;
import java.util.Set;


@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@SpELExpression(expression = "{T(java.lang.Boolean).TRUE.equals(#delegatedResponsibilityUsed) == (#registeredOwners?.size() gt 0)}",
    message = "emp.external.mandate.delegatedResponsibilityUsed")
@SpELExpression(expression = "{T(java.lang.Boolean).TRUE.equals(#delegatedResponsibilityUsed) ? " +
    "T(java.lang.Boolean).TRUE.equals(#responsibilityDeclaration) : #responsibilityDeclaration eq null}", message = "emp.external.mandate.responsibilityDeclaration")
public class ExternalEmpDelegatedResponsibility {

    @Schema(description = "Delegation of UK ETS compliance by registered ship owners. If true, registeredOwners and responsibilityDeclaration are required otherwise they must be omitted")
    @NotNull
    private Boolean delegatedResponsibilityUsed;

    @Builder.Default
    @JsonDeserialize(as = LinkedHashSet.class)
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @UniqueElements
    private Set<@NotNull @Valid ExternalEmpRegisteredOwner> registeredOwners = new LinkedHashSet<>();

    @Schema(nullable = true, description = "Maritime Operator declares that the information provided is true. If delegatedResponsibilityUsed is true it must be true, otherwise it must be omitted")
    private Boolean responsibilityDeclaration;
}
