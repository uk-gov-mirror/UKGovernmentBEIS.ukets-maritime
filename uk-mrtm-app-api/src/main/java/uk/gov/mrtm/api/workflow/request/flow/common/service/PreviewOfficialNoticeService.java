package uk.gov.mrtm.api.workflow.request.flow.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.userinfoapi.UserInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.service.DecisionNotificationUsersService;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestAccountContactQueryService;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateOfficialNoticeParamsProvider;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateParamsSourceData;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PreviewOfficialNoticeService {

    private final RequestAccountContactQueryService requestAccountContactQueryService;
    private final DecisionNotificationUsersService decisionNotificationUsersService;
    private final MrtmDocumentTemplateAccountDataCollectFromAccountService templateAccountDataCollectFromAccountService;
    private final DocumentTemplateOfficialNoticeParamsProvider documentTemplateOfficialNoticeParamsProvider;

    public TemplateParams generateCommonParams(final Request request,
                                               final DecisionNotification decisionNotification) {
        final UserInfoDTO accountPrimaryContact =
            requestAccountContactQueryService.getRequestAccountPrimaryContact(request)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCOUNT_CONTACT_TYPE_PRIMARY_CONTACT_NOT_FOUND));
        final List<String> ccRecipientsEmails =
            decisionNotificationUsersService.findUserEmails(decisionNotification);
        final String signatory = decisionNotification.getSignatory();

        return documentTemplateOfficialNoticeParamsProvider
            .constructTemplateParams(DocumentTemplateParamsSourceData.builder()
                .request(request)
                .signatory(signatory)
                .accountPrimaryContact(accountPrimaryContact)
                .toRecipientEmail(accountPrimaryContact.getEmail())
                .ccRecipientsEmails(ccRecipientsEmails)
                .accountData(templateAccountDataCollectFromAccountService.collect(request.getAccountId()))
                .build());
    }
}
