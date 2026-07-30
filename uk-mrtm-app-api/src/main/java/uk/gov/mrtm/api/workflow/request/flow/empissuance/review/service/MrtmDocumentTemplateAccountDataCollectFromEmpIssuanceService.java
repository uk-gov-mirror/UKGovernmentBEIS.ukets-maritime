package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmAccountConstructAddressInfoService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;

@Service
@RequiredArgsConstructor
public class MrtmDocumentTemplateAccountDataCollectFromEmpIssuanceService {

	private final EmpIssuanceAccountDraftDataQueryService accountDraftDataQueryService;
	private final MrtmAccountQueryService mrtmAccountQueryService;
	private final MrtmAccountConstructAddressInfoService accountAddressService;
	
	public MrtmDocumentTemplateAccountData collect(RequestTask requestTask) {
		final EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload = (EmpIssuanceApplicationReviewRequestTaskPayload) requestTask
				.getPayload();
		final MrtmAccount account = mrtmAccountQueryService.getAccountById(requestTask.getRequest().getAccountId());

		final EmpIssuanceAccountDraftData accountDraftData = accountDraftDataQueryService
				.getAccountDraftData(requestTaskPayload);

		return MrtmDocumentTemplateAccountData.builder()
				.name(accountDraftData.getName())
				.competentAuthority(requestTask.getRequest().getCompetentAuthority())
				.imoNumber(account.getImoNumber())
				.address(accountAddressService.constructAddressInfo(accountDraftData.getAddress()))
				.build();
	}

}
