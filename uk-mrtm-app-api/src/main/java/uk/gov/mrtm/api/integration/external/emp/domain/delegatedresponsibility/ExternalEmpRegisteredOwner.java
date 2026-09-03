package uk.gov.mrtm.api.integration.external.emp.domain.delegatedresponsibility;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import uk.gov.netz.api.common.validation.NotAfterCurrentDateInZone;
import uk.gov.netz.api.common.validation.uniqueelements.UniqueElements;
import uk.gov.netz.api.common.validation.uniqueelements.UniqueField;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalEmpRegisteredOwner {

    @Schema(description = "Registered owner name")
    @NotBlank
    @Size(min = 1, max = 255)
    private String name;

    @NotBlank(message = "Company IMO number is required")
    @Pattern(
            regexp = "^\\d{7}$",
            message = "Company IMO number must contain exactly 7 digits"
    )
    @UniqueField
    private String companyImoNumber;

    @NotBlank
    @Size(min = 1, max = 255)
    private String contactName;

    @Email
    @Size(min = 1, max = 255)
    @NotBlank
    private String email;

    @Schema(description = "The date of the written agreement can be past or present. The present date is validated using UTC+14.")
    @NotNull
    @NotAfterCurrentDateInZone
    private LocalDate agreementDate;

    @Schema(description = "Associated ships")
    @Builder.Default
    @JsonDeserialize(as = LinkedHashSet.class)
    @NotEmpty
    @UniqueElements
    private Set<@NotNull @Valid ExternalEmpRegisteredOwnerShipDetails> ships = new LinkedHashSet<>();
}
