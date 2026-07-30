package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.common.domain.AddressState;
import uk.gov.mrtm.api.common.domain.RegisteredAddressState;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpIssuanceAccountDraftData {

	private String name;
	private AddressState address;
	private RegisteredAddressState registeredAddress;
	
}
