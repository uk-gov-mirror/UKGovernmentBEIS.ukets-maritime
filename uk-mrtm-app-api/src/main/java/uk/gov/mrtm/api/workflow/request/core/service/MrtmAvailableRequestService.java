package uk.gov.mrtm.api.workflow.request.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestCreateActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitRequestCreateAccountRelatedValidator;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.authorization.rules.services.resource.AccountRequestAuthorizationResourceService;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestCreateActionPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestType;
import uk.gov.netz.api.workflow.request.core.domain.constants.RequestCreateActionPayloadTypes;
import uk.gov.netz.api.workflow.request.core.repository.RequestRepository;
import uk.gov.netz.api.workflow.request.core.repository.RequestTypeRepository;
import uk.gov.netz.api.workflow.request.core.validation.EnabledWorkflowValidator;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReportRelatedRequestCreateActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestCreateValidationResult;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestCreateByRequestValidator;

import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MrtmAvailableRequestService {

    private final RequestRepository requestRepository;
    private final RequestTypeRepository requestTypeRepository;
    private final EnabledWorkflowValidator enabledWorkflowValidator;
    private final AccountRequestAuthorizationResourceService accountRequestAuthorizationResourceService;
    private final List<RequestCreateByRequestValidator> requestCreateByRequestValidators;
    private final SiteVisitRequestCreateAccountRelatedValidator siteVisitRequestCreateAccountRelatedValidator;

    @Transactional
    public Map<String, RequestCreateValidationResult> getAvailableAerWorkflows(
            final String requestId, final AppUser appUser) {

        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        ReportRelatedRequestCreateActionPayload payload = ReportRelatedRequestCreateActionPayload.builder()
                .payloadType(RequestCreateActionPayloadTypes.REPORT_RELATED_REQUEST_CREATE_ACTION_PAYLOAD)
                .requestId(requestId)
                .build();

        final Set<String> allManuallyCreateCreateRequestTypes =
                requestTypeRepository.findAllByCanCreateManuallyAndResourceType(true, ResourceType.ACCOUNT).stream()
                        .filter(requestType -> requestType.getHistoryCategory().equals("REPORTING"))
                        .map(RequestType::getCode)
                        .filter(enabledWorkflowValidator::isWorkflowEnabled)
                        .collect(Collectors.toSet());
        Set <String> actions = this.getAvailableCreateActions(
                request.getAccountId(), appUser, allManuallyCreateCreateRequestTypes);

        return actions.stream()
                .collect(Collectors.toMap(
                        requestType -> requestType,
                        requestType -> getRequestRelatedValidationResult(requestType, request.getAccountId(), payload)))
                .entrySet().stream()
                .filter(a -> a.getValue().isAvailable())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    @Transactional
    public Map<Year, RequestCreateValidationResult> getAvailableSiteVisitWorkflows(final long accountId) {
        final Year currentYear = Year.now();
        final Year lastYear = currentYear.minusYears(1);

        RequestCreateValidationResult currentYearValidationResult = siteVisitRequestCreateAccountRelatedValidator
            .validateCreation(accountId, SiteVisitRequestCreateActionPayload.builder().year(currentYear).build());
        RequestCreateValidationResult lastYearValidationResult = siteVisitRequestCreateAccountRelatedValidator
            .validateCreation(accountId, SiteVisitRequestCreateActionPayload.builder().year(lastYear).build());

        return Map.of(
            currentYear, currentYearValidationResult,
            lastYear, lastYearValidationResult
        );
    }

    private Set<String> getAvailableCreateActions(final Long accountId,
                                                                   final AppUser appUser,
                                                                   final Set<String> availableCreateRequestTypes) {
        return accountRequestAuthorizationResourceService
                .findRequestCreateActionsByAccountId(appUser, accountId).stream()
                .filter(enabledWorkflowValidator::isWorkflowEnabled)
                .filter(availableCreateRequestTypes::contains)
                .collect(Collectors.toSet());
    }

    private RequestCreateValidationResult getRequestRelatedValidationResult(String type, long accountId, RequestCreateActionPayload payload) {
        return requestCreateByRequestValidators.stream()
                .filter(validator -> validator.getRequestType().equals(type))
                .findFirst()
                .map(validator -> validator.validateAction(accountId, payload))
                .orElse(RequestCreateValidationResult.builder().valid(true).build());
    }
}
