package uk.gov.mrtm.api.workflow.request.flow.common.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateAccountDataCollectFromAccountService;

@Service
@RequiredArgsConstructor
public class MrtmDocumentTemplateAccountDataCollectFromAccountService
		implements DocumentTemplateAccountDataCollectFromAccountService<MrtmDocumentTemplateAccountData> {
	
	private final MrtmAccountQueryService mrtmAccountQueryService;
	private final MrtmAccountConstructAddressInfoService addressService;

	public MrtmDocumentTemplateAccountData collect(Long accountId) {
		MrtmAccount account = mrtmAccountQueryService.getAccountById(accountId);
		return MrtmDocumentTemplateAccountData.builder()
				.name(account.getName())
				.competentAuthority(account.getCompetentAuthority())
				.imoNumber(account.getImoNumber())
				.address(addressService.constructAddressInfo(account.getAddress()))
				.build();
	}
	
}
