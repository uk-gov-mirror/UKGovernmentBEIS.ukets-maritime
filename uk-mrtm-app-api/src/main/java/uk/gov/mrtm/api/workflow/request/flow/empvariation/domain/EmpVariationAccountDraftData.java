package uk.gov.mrtm.api.workflow.request.flow.empvariation.domain;

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
public class EmpVariationAccountDraftData {

	private String name;
	private AddressState address;
	private RegisteredAddressState registeredAddress;
	
}
