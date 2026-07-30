package uk.gov.mrtm.api.workflow.request.flow.empreissue.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.common.config.RegistryConfig;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmDocumentTemplateAccountDataCollectFromAccountService;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpReissueRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpReissueRequestPayload;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.documenttemplate.service.FileDocumentGenerateServiceDelegator;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateOfficialNoticeParamsProvider;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateParamsSourceData;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.OfficialNoticeSendService;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class EmpReissueOfficialNoticeService {

	private final DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;
	private final FileDocumentGenerateServiceDelegator fileDocumentGenerateServiceDelegator;
	private final OfficialNoticeSendService officialNoticeSendService;
	private final RegistryConfig registryConfig;
	private final MrtmDocumentTemplateAccountDataCollectFromAccountService accountTemplateDataFromAccountService;

	@Transactional
    public CompletableFuture<FileInfoDTO> generateOfficialNotice(final Request request) {
        final EmpReissueRequestMetadata requestMetadata = (EmpReissueRequestMetadata) request.getMetadata();

        final MrtmDocumentTemplateAccountData accountData = accountTemplateDataFromAccountService
				.collect(request.getAccountId());
        
        TemplateParams templateParams = documentTemplateOfficialNoticeParamsProvider
				.constructTemplateParams(DocumentTemplateParamsSourceData.builder()
						.contextActionType(MrtmDocumentTemplateGenerationContextActionType.EMP_REISSUE)
						.request(request)
						.signatory(requestMetadata.getSignatory())
						.accountData(accountData)
						.build());
        
		return fileDocumentGenerateServiceDelegator.generateAndSaveFileDocumentAsync(MrtmDocumentTemplateType.EMP_REISSUE,
				templateParams, "Batch_variation_notice_maritime.pdf");
    }
	
	public void sendOfficialNotice(final Request request) {
        final EmpReissueRequestPayload requestPayload = (EmpReissueRequestPayload) request.getPayload();
		final List<FileInfoDTO> attachments = List.of(requestPayload.getOfficialNotice(),
				requestPayload.getDocument());
        officialNoticeSendService.sendOfficialNotice(attachments, request, List.of(registryConfig.getEmail()));
    }
}
