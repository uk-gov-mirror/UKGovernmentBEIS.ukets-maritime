package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.netz.api.account.domain.enumeration.AccountStatus;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestCreateAccountRelatedNoPayloadValidator;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestCreateValidatorService;

import java.util.Set;

@Service
public class EmpVariationCreateValidator extends RequestCreateAccountRelatedNoPayloadValidator {

    public EmpVariationCreateValidator(RequestCreateValidatorService requestCreateValidatorService) {
        super(requestCreateValidatorService);
    }

    @Override
    public Set<AccountStatus> getApplicableAccountStatuses() {
        return Set.of(MrtmAccountStatus.LIVE);
    }

    @Override
    public Set<String> getMutuallyExclusiveRequests() {
        return Set.of(MrtmRequestType.EMP_VARIATION);
    }

    @Override
    public String getRequestType() {
        return MrtmRequestType.EMP_VARIATION;
    }
}
