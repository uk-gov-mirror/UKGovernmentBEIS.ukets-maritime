package uk.gov.mrtm.api.account.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountDetailsHistoryDTO {

    private String changedBy;
    private LocalDateTime creationDate;
    private JsonNode previousValue;
    private JsonNode newValue;
    private String reason;
}
