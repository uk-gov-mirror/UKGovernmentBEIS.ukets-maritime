package uk.gov.mrtm.api.workflow.request.flow.common.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.common.domain.AddressState;
import uk.gov.netz.api.referencedata.domain.Country;
import uk.gov.netz.api.referencedata.service.CountryService;

@Service
@RequiredArgsConstructor
public class MrtmAccountConstructAddressInfoService {
	
	private final CountryService countryService;

	public String constructAddressInfo(AddressState address) {
		String countryName = countryService.getReferenceData().stream()
				.filter(country -> address.getCountry().equals(country.getCode())).map(Country::getName).findFirst()
				.orElse("");

		StringBuilder addressBuilder = new StringBuilder();
		addressBuilder.append(address.getLine1());
		Optional.ofNullable(address.getLine2()).ifPresent(line2 -> addressBuilder.append("\n").append(line2));
		addressBuilder.append("\n").append(address.getCity());
		Optional.ofNullable(address.getPostcode()).ifPresent(postcode -> addressBuilder.append("\n").append(postcode));
		addressBuilder.append("\n").append(countryName);
		return addressBuilder.toString();
	}
}
