package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmAccountConstructAddressInfoService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;

@Service
@RequiredArgsConstructor
public class MrtmDocumentTemplateAccountDataCollectFromEmpVariationService {

	private final EmpVariationAccountDraftDataQueryService accountDraftDataQueryService;
	private final MrtmAccountQueryService mrtmAccountQueryService;
	private final MrtmAccountConstructAddressInfoService accountAddressService;
	
	public MrtmDocumentTemplateAccountData collect(RequestTask requestTask) {
		final EmpVariationApplicationSubmitRequestTaskPayload requestTaskPayload = (EmpVariationApplicationSubmitRequestTaskPayload) requestTask
				.getPayload();
		final MrtmAccount account = mrtmAccountQueryService.getAccountById(requestTask.getRequest().getAccountId());

		final EmpVariationAccountDraftData accountDraftData = accountDraftDataQueryService
				.getAccountDraftData(requestTaskPayload);

		return MrtmDocumentTemplateAccountData.builder()
				.name(accountDraftData.getName())
				.competentAuthority(requestTask.getRequest().getCompetentAuthority())
				.imoNumber(account.getImoNumber())
				.address(accountAddressService.constructAddressInfo(accountDraftData.getAddress()))
				.build();
	}

}
