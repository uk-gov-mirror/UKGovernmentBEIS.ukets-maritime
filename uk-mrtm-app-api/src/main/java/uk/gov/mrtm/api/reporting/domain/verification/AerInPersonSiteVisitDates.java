package uk.gov.mrtm.api.reporting.domain.verification;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.netz.api.common.validation.NotAfterCurrentDateInZone;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AerInPersonSiteVisitDates {

    @NotNull
    @NotAfterCurrentDateInZone
    private LocalDate startDate;

    @NotNull
    @Positive
    private Integer numberOfDays;
}
