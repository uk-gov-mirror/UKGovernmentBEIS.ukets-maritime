package uk.gov.mrtm.api.emissionsmonitoringplan.domain.mandate;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
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
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EmpRegisteredOwner {

    @NotNull
    private UUID uniqueIdentifier;

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotBlank
    @Pattern(regexp = "^\\d{7}$")
    @UniqueField
    private String imoNumber;

    @NotBlank
    @Size(max = 255)
    private String contactName;

    @Email
    @Size(max = 255)
    @NotBlank
    private String email;

    @NotNull
    @NotAfterCurrentDateInZone
    private LocalDate effectiveDate;

    @Builder.Default
    @JsonDeserialize(as = LinkedHashSet.class)
    @NotEmpty
    @UniqueElements
    private Set<@NotNull @Valid RegisteredOwnerShipDetails> ships = new HashSet<>();
}
