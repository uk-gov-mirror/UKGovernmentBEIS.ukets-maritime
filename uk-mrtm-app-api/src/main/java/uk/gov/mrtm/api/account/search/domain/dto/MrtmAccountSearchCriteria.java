package uk.gov.mrtm.api.account.search.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Sort;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MrtmAccountSearchCriteria {

    @Schema(description = "Search by emitter ID, account name, IMO number or Registry ID")
    @Size(min = 3, max = 256)
    private String term;

    @Schema(description = "Account statuses filter")
    private Set<MrtmAccountStatus> statuses;

    @Schema(description = "Contact email used for user-assignment filtering")
    private String contactEmail;

    @Schema(description = "Supported values: OPERATOR_NAME, ACCOUNT_ID, STATUS, IMO_NUMBER")
    @Pattern(
            regexp = "^(OPERATOR_NAME|ACCOUNT_ID|STATUS|IMO_NUMBER)?$",
            message = "sortBy must be one of OPERATOR_NAME, ACCOUNT_ID, STATUS, IMO_NUMBER")
    private String sortBy;

    @Schema(description = "Sort direction. Supported values: ASC, DESC")
    private Sort.Direction direction;

    @Schema(description = "Zero-based page index. Defaults to 0 when omitted.")
    @Min(value = 0, message = "{parameter.page.typeMismatch}")
    private Integer page;

    @Schema(description = "Page size. Defaults to 20 when omitted.")
    @Min(value = 1, message = "{parameter.pageSize.typeMismatch}")
    private Integer size;
}
