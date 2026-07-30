package uk.gov.mrtm.api.workflow.request.flow.common.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.common.domain.AddressState;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;

@ExtendWith(MockitoExtension.class)
class MrtmDocumentTemplateAccountDataCollectFromAccountServiceTest {

	@InjectMocks
    private MrtmDocumentTemplateAccountDataCollectFromAccountService cut;

    @Mock
    private MrtmAccountQueryService mrtmAccountQueryService;

    @Mock
    private MrtmAccountConstructAddressInfoService addressService;

    @Test
    void collect() {
    	Long accountId = 1L;
    	MrtmAccount account = MrtmAccount.builder().id(2L)
    			.name("name")
    			.competentAuthority(CompetentAuthorityEnum.SCOTLAND)
    			.imoNumber("12")
    			.address(AddressState.builder().city("city").build())
    			.build();
    	String address = "address";
    	when(mrtmAccountQueryService.getAccountById(accountId)).thenReturn(account);
    	when(addressService.constructAddressInfo(account.getAddress())).thenReturn(address);
    	
    	var result = cut.collect(accountId);
    	assertThat(result).isEqualTo(MrtmDocumentTemplateAccountData.builder()
    			.name("name")
    			.competentAuthority(CompetentAuthorityEnum.SCOTLAND)
    			.imoNumber("12")
    			.address(address)
    			.build());
    	
    	verify(mrtmAccountQueryService, times(1)).getAccountById(accountId);
    	verify(addressService, times(1)).constructAddressInfo(account.getAddress());
    }
}
