package uk.gov.mrtm.api.account.domain.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.account.validation.ValidFirstMaritimeActivityDate;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MrtmAccountUpdateDTO {
    @NotBlank(message = "{account.name.notEmpty}")
    @Size(max = 255, message = "{account.name.typeMismatch}")
    private String name;

    @NotNull
    @Valid
    @JsonUnwrapped
    private AddressStateDTO address;

    @NotNull
    @ValidFirstMaritimeActivityDate(message = "The year must be after or equal to 2026 and not after current year")
    private LocalDate firstMaritimeActivityDate;

    @Min(value = 0)
    @Max(value = 9999999999L)
    private Long sopId;

    @NotBlank(message = "Enter a reason")
    @Size(max = 10000)
    private String reason;
}


