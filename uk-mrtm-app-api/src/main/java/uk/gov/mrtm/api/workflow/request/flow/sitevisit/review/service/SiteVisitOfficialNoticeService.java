package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateGenerationContextActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmDocumentTemplateAccountDataCollectFromAccountService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitReviewDecisionDetails;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.documenttemplate.service.FileDocumentGenerateServiceDelegator;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.userinfoapi.UserInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.service.DecisionNotificationUsersService;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestAccountContactQueryService;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateOfficialNoticeParamsProvider;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateParamsSourceData;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.OfficialNoticeSendService;

import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
public class SiteVisitOfficialNoticeService {

    private final RequestService requestService;
    private final DecisionNotificationUsersService decisionNotificationUsersService;
    private final RequestAccountContactQueryService requestAccountContactQueryService;
    private final DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;
    private final FileDocumentGenerateServiceDelegator documentFileGeneratorService;
    private final OfficialNoticeSendService officialNoticeSendService;
    private final MrtmDocumentTemplateAccountDataCollectFromAccountService templateAccountDataCollectFromAccountService;

    @Transactional
    public void generateApprovedOfficialNotice(final String requestId) {
        final Request request = requestService.findRequestById(requestId);
        final SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();

        final FileInfoDTO officialNotice = this.generateOfficialNotice(request,
            requestPayload,
            MrtmDocumentTemplateType.SITE_VISIT_APPROVED,
            "Virtual_site_visit_letter.pdf");

        requestPayload.setOfficialNotice(officialNotice);
    }

    @Transactional
    public void generateRejectedOfficialNotice(final String requestId) {
        final Request request = requestService.findRequestById(requestId);
        final SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();


        final FileInfoDTO officialNotice = this.generateOfficialNotice(request,
            requestPayload,
            MrtmDocumentTemplateType.SITE_VISIT_REJECTED,
            "Virtual_site_visit_letter.pdf");

        requestPayload.setOfficialNotice(officialNotice);
    }

    public FileDTO doGenerateOfficialNoticeWithoutSave(final Request request,
                                                       final String documentTemplateType,
                                                       final String fileNameToGenerate) {
        final SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();
        final TemplateParams templateParams = constructTemplateParams(request, requestPayload);
        return documentFileGeneratorService.generateFileDocument(documentTemplateType, templateParams, fileNameToGenerate);
    }

    public FileDTO doGenerateOfficialNoticeWithoutSave(final Request request,
                                                       final SiteVisitReviewDecision reviewDecision,
                                                       final DecisionNotification decisionNotification,
                                                       final String documentTemplateType,
                                                       final String fileNameToGenerate) {
        final TemplateParams templateParams = constructPreviewTemplateParams(request, reviewDecision, decisionNotification);
        return documentFileGeneratorService.generateFileDocument(documentTemplateType, templateParams, fileNameToGenerate);
    }

    public void sendOfficialNotice(final String requestId) {

        final Request request = requestService.findRequestById(requestId);
        final SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();
        final List<String> ccRecipientsEmails = decisionNotificationUsersService.findUserEmails(requestPayload.getDecisionNotification());
        final List<FileInfoDTO> attachments = List.of(requestPayload.getOfficialNotice());

        officialNoticeSendService.sendOfficialNotice(attachments, request, ccRecipientsEmails);
    }

    private FileInfoDTO generateOfficialNotice(final Request request,
                                               final SiteVisitRequestPayload requestPayload,
                                               final String documentTemplateType,
                                               final String fileNameToGenerate) {
        final TemplateParams templateParams = constructTemplateParams(request, requestPayload);
        return documentFileGeneratorService.generateAndSaveFileDocument(documentTemplateType, templateParams, fileNameToGenerate);
    }

    private TemplateParams constructTemplateParams(final Request request,
                                                   final SiteVisitRequestPayload requestPayload) {
        final UserInfoDTO accountPrimaryContact = requestAccountContactQueryService.getRequestAccountPrimaryContact(request)
            .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND));
        final UserInfoDTO serviceContact = requestAccountContactQueryService.getRequestAccountServiceContact(request)
            .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_SERVICE_CONTACT_NOT_FOUND));
        final List<String> ccRecipientsEmails = decisionNotificationUsersService.findUserEmails(requestPayload.getDecisionNotification());

        return documentTemplateOfficialNoticeParamsProvider
            .constructTemplateParams(DocumentTemplateParamsSourceData.builder()
                .contextActionType(MrtmDocumentTemplateGenerationContextActionType.SITE_VISIT)
                .request(request)
                .signatory(requestPayload.getDecisionNotification().getSignatory())
                .accountPrimaryContact(accountPrimaryContact)
                .toRecipientEmail(serviceContact.getEmail())
                .ccRecipientsEmails(ccRecipientsEmails)
                .accountData(templateAccountDataCollectFromAccountService.collect(request.getAccountId()))
                .build());
    }

    private TemplateParams constructPreviewTemplateParams(final Request request,
                                                          final SiteVisitReviewDecision reviewDecision,
                                                          final DecisionNotification decisionNotification) {
        final UserInfoDTO accountPrimaryContact = requestAccountContactQueryService.getRequestAccountPrimaryContact(request)
            .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND));
        final UserInfoDTO serviceContact = requestAccountContactQueryService.getRequestAccountServiceContact(request)
            .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_SERVICE_CONTACT_NOT_FOUND));
        final List<String> ccRecipientsEmails = decisionNotificationUsersService.findUserEmails(decisionNotification);

        final TemplateParams templateParams = documentTemplateOfficialNoticeParamsProvider
            .constructTemplateParams(DocumentTemplateParamsSourceData.builder()
                .request(request)
                .signatory(decisionNotification.getSignatory())
                .accountPrimaryContact(accountPrimaryContact)
                .accountData(templateAccountDataCollectFromAccountService.collect(request.getAccountId()))
                .toRecipientEmail(serviceContact.getEmail())
                .ccRecipientsEmails(ccRecipientsEmails).build());

        final String officialNotice = ((SiteVisitReviewDecisionDetails) reviewDecision.getDetails()).getSummary();
        templateParams.getParams().put("officialNotice", officialNotice);
        return templateParams;
    }

}
