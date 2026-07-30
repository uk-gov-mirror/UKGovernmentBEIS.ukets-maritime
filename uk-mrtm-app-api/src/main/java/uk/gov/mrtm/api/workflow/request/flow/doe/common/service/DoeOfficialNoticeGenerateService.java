package uk.gov.mrtm.api.workflow.request.flow.doe.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmDocumentTemplateAccountDataCollectFromAccountService;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeRequestPayload;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.documenttemplate.service.FileDocumentGenerateServiceDelegator;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.userinfoapi.UserInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.flow.common.service.DecisionNotificationUsersService;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestAccountContactQueryService;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateOfficialNoticeParamsProvider;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateParamsSourceData;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DoeOfficialNoticeGenerateService {

    private final RequestService requestService;
    private final RequestAccountContactQueryService requestAccountContactQueryService;
    private final DecisionNotificationUsersService decisionNotificationUsersService;
    private final DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;
    private final FileDocumentGenerateServiceDelegator fileDocumentGenerateServiceDelegator;
    private final DoeSubmittedDocumentTemplateWorkflowParamsProvider doeSubmittedDocumentTemplateWorkflowParamsProvider;
    private final MrtmDocumentTemplateAccountDataCollectFromAccountService accountTemplateDataFromAccountService;

    @Transactional
    public void generateOfficialNotice(String requestId) {
        Request request = requestService.findRequestById(requestId);
        DoeRequestPayload requestPayload = (DoeRequestPayload) request.getPayload();

        Optional<UserInfoDTO> accountPrimaryContact = requestAccountContactQueryService.getRequestAccountPrimaryContact(request);

        List<String> ccRecipientsEmails = decisionNotificationUsersService.findUserEmails(requestPayload.getDecisionNotification());
        
		final MrtmDocumentTemplateAccountData accountData = accountTemplateDataFromAccountService
				.collect(request.getAccountId());

        TemplateParams templateParams = documentTemplateOfficialNoticeParamsProvider
            .constructTemplateParams(DocumentTemplateParamsSourceData.builder()
                .contextActionType(MrtmDocumentTemplateGenerationContextActionType.DOE_SUBMIT)
                .request(request)
                .signatory(requestPayload.getDecisionNotification().getSignatory())
                .accountPrimaryContact(accountPrimaryContact.orElse(null))
                .toRecipientEmail(accountPrimaryContact.map(UserInfoDTO::getEmail).orElse(null))
                .ccRecipientsEmails(ccRecipientsEmails)
                .accountData(accountData)
                .build());
        final Map<String, Object> params =
                doeSubmittedDocumentTemplateWorkflowParamsProvider.constructParams(requestPayload);
        templateParams.getParams().putAll(params);

        boolean isSurrenderObligationType = requestPayload.getDoe().getMaritimeEmissions()
                .getTotalMaritimeEmissions().getDeterminationType().equals(DoeDeterminationType.SURRENDER_OBLIGATION);
        FileInfoDTO officialNotice = isSurrenderObligationType ?
                fileDocumentGenerateServiceDelegator.generateAndSaveFileDocument(
                        MrtmDocumentTemplateType.DOE_EFSN_SUBMITTED,
                        templateParams,
                        "EFSN_Notice.pdf") :
                fileDocumentGenerateServiceDelegator.generateAndSaveFileDocument(
                        MrtmDocumentTemplateType.DOE_SUBMITTED,
                        templateParams, "DoE_and_EFSN_Notice.pdf");

        requestPayload.setOfficialNotice(officialNotice);
    }
}
