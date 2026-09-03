package uk.gov.mrtm.api.account.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;

import java.time.LocalDate;

/**
 * Snapshot of operator details tracked for account details history.
 * The UI diffs previous vs new and renders only changed fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDetailsHistorySnapshot {

    private String operatorName;
    private Long sopId;
    private AddressStateDTO contactAddress;
    private AddressStateDTO registeredAddress;
    private LocalDate firstYearOfReportingObligation;
    private Integer registryId;
}
