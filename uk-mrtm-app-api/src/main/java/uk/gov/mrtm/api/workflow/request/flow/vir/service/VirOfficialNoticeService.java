package uk.gov.mrtm.api.workflow.request.flow.vir.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmDocumentTemplateAccountDataCollectFromAccountService;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirRequestPayload;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.documenttemplate.service.FileDocumentGenerateServiceDelegator;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.userinfoapi.UserInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.flow.common.service.DecisionNotificationUsersService;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestAccountContactQueryService;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateOfficialNoticeParamsProvider;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateParamsSourceData;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.OfficialNoticeSendService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VirOfficialNoticeService {

    private static final String FILE_NAME = "Recommended_improvements.pdf";

    private final RequestService requestService;
    private final RequestAccountContactQueryService requestAccountContactQueryService;
    private final DecisionNotificationUsersService decisionNotificationUsersService;
    private final DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;
    private final FileDocumentGenerateServiceDelegator fileDocumentGenerateServiceDelegator;
    private final OfficialNoticeSendService officialNoticeSendService;
    private final MrtmDocumentTemplateAccountDataCollectFromAccountService accountTemplateDataFromAccountService;

    @Transactional
    public void generateAndSaveRecommendedImprovementsOfficialNotice(final String requestId) {
        final Request request = requestService.findRequestById(requestId);
        final VirRequestPayload requestPayload = (VirRequestPayload) request.getPayload();
        // Generate file
        final FileInfoDTO officialNotice = generateOfficialNotice(request);
        // Save to payload
        requestPayload.setOfficialNotice(officialNotice);
    }

    public void sendOfficialNotice(final String requestId) {
        
        final Request request = requestService.findRequestById(requestId);
        final VirRequestPayload requestPayload = (VirRequestPayload) request.getPayload();
        final List<String> ccRecipientsEmails = decisionNotificationUsersService.findUserEmails(requestPayload.getDecisionNotification());
        final List<FileInfoDTO> attachments = List.of(requestPayload.getOfficialNotice());

        officialNoticeSendService.sendOfficialNotice(attachments, request, ccRecipientsEmails);
    }

    @Transactional
    public FileDTO doGenerateOfficialNoticeWithoutSave(Request dbRequest) {
        final TemplateParams templateParams = constructTemplateParams(dbRequest);
        return fileDocumentGenerateServiceDelegator.generateFileDocument(MrtmDocumentTemplateType.VIR_REVIEWED,
                templateParams, FILE_NAME);
    }

    private FileInfoDTO generateOfficialNotice(final Request request) {
        final TemplateParams templateParams = constructTemplateParams(request);
        return fileDocumentGenerateServiceDelegator.generateAndSaveFileDocument(MrtmDocumentTemplateType.VIR_REVIEWED,
                templateParams, FILE_NAME);
    }

    private TemplateParams constructTemplateParams(final Request request) {

        final VirRequestPayload requestPayload = (VirRequestPayload) request.getPayload();
        final UserInfoDTO accountPrimaryContact = requestAccountContactQueryService.getRequestAccountPrimaryContact(request)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND));
        final List<String> ccRecipientsEmails = decisionNotificationUsersService.findUserEmails(requestPayload.getDecisionNotification());

        final MrtmDocumentTemplateAccountData accountData = accountTemplateDataFromAccountService
				.collect(request.getAccountId());
        
        return documentTemplateOfficialNoticeParamsProvider.constructTemplateParams(
                 DocumentTemplateParamsSourceData.builder()
                        .contextActionType(MrtmDocumentTemplateGenerationContextActionType.VIR_REVIEWED)
                        .request(request)
                        .signatory(requestPayload.getDecisionNotification().getSignatory())
                        .accountPrimaryContact(accountPrimaryContact)
                        .toRecipientEmail(accountPrimaryContact.getEmail())
                        .ccRecipientsEmails(ccRecipientsEmails)
                        .accountData(accountData)
                        .build()
        );
    }
}
