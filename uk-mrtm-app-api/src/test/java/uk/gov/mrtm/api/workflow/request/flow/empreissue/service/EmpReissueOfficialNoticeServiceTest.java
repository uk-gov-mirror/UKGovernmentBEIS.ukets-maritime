package uk.gov.mrtm.api.workflow.request.flow.empreissue.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.common.config.RegistryConfig;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmDocumentTemplateAccountDataCollectFromAccountService;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpReissueRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpReissueRequestPayload;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.competentauthority.CompetentAuthorityDTO;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;
import uk.gov.netz.api.documenttemplate.domain.templateparams.CompetentAuthorityTemplateParams;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.documenttemplate.service.FileDocumentGenerateServiceDelegator;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateOfficialNoticeParamsProvider;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateParamsSourceData;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.OfficialNoticeSendService;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpReissueOfficialNoticeServiceTest {

	@InjectMocks
	private EmpReissueOfficialNoticeService cut;

	@Mock
	private DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;
	
	@Mock
	private FileDocumentGenerateServiceDelegator fileDocumentGenerateServiceDelegator;

	@Mock
	private OfficialNoticeSendService officialNoticeSendService;

	@Mock
	private RegistryConfig registryConfig;
	
	@Mock
	private MrtmDocumentTemplateAccountDataCollectFromAccountService accountTemplateDataFromAccountService;

	@Test
	void generateOfficialNotice() throws InterruptedException, ExecutionException {
		Long accountId = 1L;
		EmpReissueRequestMetadata requestMetadata = EmpReissueRequestMetadata.builder()
				.signatory("signatory")
				.build();
		Request request = Request.builder()
							.metadata(requestMetadata)
							.requestResources(List.of(RequestResource.builder()
									.resourceId(accountId.toString())
									.resourceType(ResourceType.ACCOUNT)
									.build()))
							.build();

		TemplateParams templateParams = TemplateParams.builder()
				.competentAuthorityParams(CompetentAuthorityTemplateParams.builder()
						.competentAuthority(CompetentAuthorityDTO.builder().id(CompetentAuthorityEnum.ENGLAND).build())
						.build())
				.build();
		
		MrtmDocumentTemplateAccountData accountData = MrtmDocumentTemplateAccountData.builder().name("accname").build();
		
		DocumentTemplateParamsSourceData paramsSourceData = DocumentTemplateParamsSourceData.builder()
				.contextActionType(MrtmDocumentTemplateGenerationContextActionType.EMP_REISSUE)
				.request(request)
				.signatory(requestMetadata.getSignatory())
				.accountData(accountData)
				.build();
		
		FileInfoDTO fileInfoDTO = FileInfoDTO.builder()
				.name("offnotice")
				.build();
		
		
		when(accountTemplateDataFromAccountService.collect(accountId)).thenReturn(accountData);
		when(documentTemplateOfficialNoticeParamsProvider.constructTemplateParams(paramsSourceData))
				.thenReturn(templateParams);

		when(fileDocumentGenerateServiceDelegator.generateAndSaveFileDocumentAsync(MrtmDocumentTemplateType.EMP_REISSUE, templateParams, "Batch_variation_notice_maritime.pdf")).thenReturn(CompletableFuture.completedFuture(fileInfoDTO));
		
		CompletableFuture<FileInfoDTO> resultFuture = cut.generateOfficialNotice(request);
		FileInfoDTO result = resultFuture.get();
		
		assertThat(result).isEqualTo(fileInfoDTO);

		verify(accountTemplateDataFromAccountService, times(1)).collect(accountId);
		verify(documentTemplateOfficialNoticeParamsProvider, times(1))
				.constructTemplateParams(paramsSourceData);
		verify(fileDocumentGenerateServiceDelegator, times(1))
				.generateAndSaveFileDocumentAsync(MrtmDocumentTemplateType.EMP_REISSUE, templateParams, "Batch_variation_notice_maritime.pdf");
	}
	
	@Test
	void sendOfficialNotice() {
		String registryMail = "registry@mail.com";
		FileInfoDTO officialNotice = FileInfoDTO.builder()
    			.name("off").uuid(UUID.randomUUID().toString())
    			.build();
    	FileInfoDTO permitDocument = FileInfoDTO.builder()
    			.name("permitDocument").uuid(UUID.randomUUID().toString())
    			.build();
    	EmpReissueRequestPayload requestPayload = EmpReissueRequestPayload.builder()
    			.payloadType(MrtmRequestPayloadType.EMP_REISSUE_REQUEST_PAYLOAD)
    			.officialNotice(officialNotice)
    			.document(permitDocument)
    			.build();
    	
		Request request = Request.builder()
				.payload(requestPayload)
				.build();
		when(registryConfig.getEmail()).thenReturn(registryMail);

		cut.sendOfficialNotice(request);

		verify(registryConfig).getEmail();
		verify(officialNoticeSendService, times(1))
			.sendOfficialNotice(List.of(officialNotice, permitDocument), request, List.of(registryMail));

		verifyNoMoreInteractions(registryConfig, officialNoticeSendService);
		verifyNoInteractions(fileDocumentGenerateServiceDelegator, documentTemplateOfficialNoticeParamsProvider);
	}
	
}
