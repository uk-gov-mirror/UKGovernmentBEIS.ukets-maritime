package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation;

import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestCreateActionPayload;
import uk.gov.netz.api.account.domain.enumeration.AccountStatus;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestCreateValidationResult;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestCreateAccountRelatedWithPayloadValidator;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestCreateValidatorService;

import java.util.Set;

@Service
public class SiteVisitRequestCreateAccountRelatedValidator extends RequestCreateAccountRelatedWithPayloadValidator<SiteVisitRequestCreateActionPayload> {

    private final SiteVisitRequestCreateValidatorService siteVisitRequestCreateValidatorService;

    public SiteVisitRequestCreateAccountRelatedValidator(RequestCreateValidatorService requestCreateValidatorService,
                                                         SiteVisitRequestCreateValidatorService siteVisitRequestCreateValidatorService) {
        super(requestCreateValidatorService);
        this.siteVisitRequestCreateValidatorService = siteVisitRequestCreateValidatorService;
    }

    @Override
    public RequestCreateValidationResult validateCreation(Long accountId, SiteVisitRequestCreateActionPayload payload) {
        return siteVisitRequestCreateValidatorService.validateCreation(accountId, getApplicableAccountStatuses(), payload);
    }

    @Override
    public RequestCreateValidationResult checkAvailability(Long accountId) {
        return siteVisitRequestCreateValidatorService.checkAvailability(accountId, getApplicableAccountStatuses());
    }

    @Override
    public String getRequestType() {
        return MrtmRequestType.SITE_VISIT;
    }

    public Set<AccountStatus> getApplicableAccountStatuses() {
        return Set.of(MrtmAccountStatus.LIVE, MrtmAccountStatus.NEW, MrtmAccountStatus.WITHDRAWN);
    }

    public Set<String> getMutuallyExclusiveRequests() {
        return Set.of();
    }
}
