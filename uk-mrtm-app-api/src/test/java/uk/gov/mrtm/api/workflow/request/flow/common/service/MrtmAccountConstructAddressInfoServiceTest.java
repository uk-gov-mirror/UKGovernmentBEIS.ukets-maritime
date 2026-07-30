package uk.gov.mrtm.api.workflow.request.flow.common.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.common.domain.AddressState;
import uk.gov.netz.api.referencedata.domain.Country;
import uk.gov.netz.api.referencedata.service.CountryService;

@ExtendWith(MockitoExtension.class)
class MrtmAccountConstructAddressInfoServiceTest {

	@Mock
	private CountryService countryService;

	@InjectMocks
	private MrtmAccountConstructAddressInfoService service;

	@Test
	void constructAddressInfo() {
		Country greece = Country.builder().name("Greece").code("GR").build();
		when(countryService.getReferenceData()).thenReturn(List.of(greece));
		AddressState address = AddressState.builder().line1("123 Main St").line2("Apt 4B").city("Athens")
				.postcode("10001").country("GR").build();

		String result = service.constructAddressInfo(address);

		assertThat(result).isEqualTo("123 Main St\nApt 4B\nAthens\n10001\nGreece");
	}

}
