package uk.gov.mrtm.api.workflow.request.core.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.service.DoeInitiateValidator;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestCreateActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitRequestCreateAccountRelatedValidator;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.authorization.rules.services.resource.AccountRequestAuthorizationResourceService;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.domain.RequestType;
import uk.gov.netz.api.workflow.request.core.domain.constants.RequestCreateActionPayloadTypes;
import uk.gov.netz.api.workflow.request.core.repository.RequestRepository;
import uk.gov.netz.api.workflow.request.core.repository.RequestTypeRepository;
import uk.gov.netz.api.workflow.request.core.validation.EnabledWorkflowValidator;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReportRelatedRequestCreateActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestCreateValidationResult;
import uk.gov.netz.api.workflow.request.flow.common.service.RequestCreateByRequestValidator;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MrtmAvailableRequestServiceTest {

    private MrtmAvailableRequestService availableRequestService;

    @Mock
    private RequestRepository requestRepository;
    @Mock
    private RequestTypeRepository requestTypeRepository;
    @Mock
    private EnabledWorkflowValidator enabledWorkflowValidator;
    @Mock
    private AccountRequestAuthorizationResourceService accountRequestAuthorizationResourceService;
    @Mock
    private SiteVisitRequestCreateAccountRelatedValidator siteVisitRequestCreateAccountRelatedValidator;

    @Mock
    private DoeInitiateValidator doeInitiateValidator;

    @Spy
    private ArrayList<RequestCreateByRequestValidator> requestCreateByRequestValidators;

    @BeforeEach
    void setUp() {
        requestCreateByRequestValidators.add(doeInitiateValidator);
        availableRequestService = new MrtmAvailableRequestService(requestRepository, requestTypeRepository,
            enabledWorkflowValidator, accountRequestAuthorizationResourceService, requestCreateByRequestValidators,
            siteVisitRequestCreateAccountRelatedValidator);
    }

    @Test
    void getAvailableAerWorkflows() {
        final String requestId = "MAR-1";
        final AppUser user = AppUser.builder().userId("user").build();
        final long accountId = 1L;

        final Set<String> actionTypes = Set.of(MrtmRequestType.AER,
                MrtmRequestType.EMP_VARIATION, MrtmRequestType.DOE);

        final Set<RequestType> requestTypes = Set.of(buildRequestType(MrtmRequestType.AER, "REPORTING", ResourceType.ACCOUNT),
                buildRequestType(MrtmRequestType.EMP_VARIATION, "PERMIT", ResourceType.ACCOUNT));

        final Request request = Request.builder()
                .type(buildRequestType(MrtmRequestType.AER, "REPORTING", ResourceType.ACCOUNT))
                .id(requestId)
                .requestResources(List.of(RequestResource.builder().resourceId(String.valueOf(accountId)).resourceType(ResourceType.ACCOUNT).build()))
                .build();

        final ReportRelatedRequestCreateActionPayload payload = ReportRelatedRequestCreateActionPayload.builder()
                .payloadType(RequestCreateActionPayloadTypes.REPORT_RELATED_REQUEST_CREATE_ACTION_PAYLOAD)
                .requestId(requestId)
                .build();
        final RequestCreateValidationResult validationResult = RequestCreateValidationResult.builder().valid(true).build();

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));
        when(requestTypeRepository.findAllByCanCreateManuallyAndResourceType(true, ResourceType.ACCOUNT))
                .thenReturn(requestTypes);

        when(accountRequestAuthorizationResourceService.findRequestCreateActionsByAccountId(user, accountId)).thenReturn(actionTypes);
        when(enabledWorkflowValidator.isWorkflowEnabled(any(String.class))).thenReturn(true);
        when(doeInitiateValidator.getRequestType()).thenReturn(MrtmRequestType.AER);
        when(doeInitiateValidator.validateAction(accountId, payload)).thenReturn(validationResult);

        // Invoke
        final Map<String, RequestCreateValidationResult> actual = availableRequestService
                .getAvailableAerWorkflows(requestId, user);

        // Verify
        assertThat(actual).containsExactly(Map.entry(MrtmRequestType.AER, validationResult));
        verify(requestRepository, times(1)).findById(requestId);
        verify(accountRequestAuthorizationResourceService, times(1)).findRequestCreateActionsByAccountId(user, accountId);
        verify(enabledWorkflowValidator, times(4)).isWorkflowEnabled(any(String.class));
        verify(doeInitiateValidator, times(1)).getRequestType();
        verify(doeInitiateValidator, times(1)).validateAction(accountId, payload);
        verifyNoMoreInteractions(requestRepository, accountRequestAuthorizationResourceService, enabledWorkflowValidator, doeInitiateValidator);
        verifyNoInteractions(siteVisitRequestCreateAccountRelatedValidator);
    }

    @Test
    void getAvailableAerWorkflows_validator_not_found() {
        final String requestId = "MAR-1";
        final AppUser user = AppUser.builder().userId("user").build();
        final long accountId = 1L;

        final Set<String> actionTypes = Set.of(MrtmRequestType.AER,
                MrtmRequestType.EMP_VARIATION);

        final Set<RequestType> requestTypes = Set.of(
                buildRequestType(MrtmRequestType.EMP_VARIATION, "PERMIT", ResourceType.ACCOUNT), buildRequestType(MrtmRequestType.AER, "REPORTING", ResourceType.ACCOUNT));

        final Request request = Request.builder()
                .type(buildRequestType(MrtmRequestType.AER, "REPORTING", ResourceType.ACCOUNT))
                .id(requestId)
                .requestResources(List.of(RequestResource.builder().resourceId(String.valueOf(accountId)).resourceType(ResourceType.ACCOUNT).build()))
                .build();

        final ReportRelatedRequestCreateActionPayload payload = ReportRelatedRequestCreateActionPayload.builder()
                .payloadType(RequestCreateActionPayloadTypes.REPORT_RELATED_REQUEST_CREATE_ACTION_PAYLOAD)
                .requestId(requestId)
                .build();
        final RequestCreateValidationResult validationResult = RequestCreateValidationResult.builder().valid(true).build();

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));
        when(requestTypeRepository.findAllByCanCreateManuallyAndResourceType(true, ResourceType.ACCOUNT))
                .thenReturn(requestTypes);

        when(accountRequestAuthorizationResourceService.findRequestCreateActionsByAccountId(user, accountId)).thenReturn(actionTypes);
        when(enabledWorkflowValidator.isWorkflowEnabled(any(String.class))).thenReturn(true);
        when(doeInitiateValidator.getRequestType()).thenReturn(MrtmRequestType.DOE);

        // Invoke
        final Map<String, RequestCreateValidationResult> actual = availableRequestService
                .getAvailableAerWorkflows(requestId, user);

        // Verify
        assertThat(actual).containsExactly(Map.entry(MrtmRequestType.AER, validationResult));
        verify(requestRepository, times(1)).findById(requestId);
        verify(accountRequestAuthorizationResourceService, times(1)).findRequestCreateActionsByAccountId(user, accountId);
        verify(enabledWorkflowValidator, times(3)).isWorkflowEnabled(any(String.class));
        verify(doeInitiateValidator, times(1)).getRequestType();
        verify(doeInitiateValidator, never()).validateAction(accountId, payload);
        verifyNoMoreInteractions(requestRepository, accountRequestAuthorizationResourceService, enabledWorkflowValidator, doeInitiateValidator);
        verifyNoInteractions(siteVisitRequestCreateAccountRelatedValidator);
    }

    @Test
    void getAvailableAerWorkflows_request_not_found() {
        final String requestId = "MAR-1";
        final AppUser user = AppUser.builder().userId("user").build();

        when(requestRepository.findById(requestId)).thenReturn(Optional.empty());

        // Invoke
        BusinessException businessException = assertThrows(BusinessException.class, () ->
                availableRequestService.getAvailableAerWorkflows(requestId, user));

        // Verify
        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, businessException.getErrorCode());
        verify(requestRepository, times(1)).findById(requestId);
        verify(accountRequestAuthorizationResourceService, never()).findRequestCreateActionsByAccountId(any(), anyLong());
        verify(enabledWorkflowValidator, never()).isWorkflowEnabled(any());
        verify(doeInitiateValidator, never()).getRequestType();
        verify(doeInitiateValidator, never()).validateAction(anyLong(), any());
        verifyNoMoreInteractions(requestRepository, accountRequestAuthorizationResourceService, enabledWorkflowValidator, doeInitiateValidator);
        verifyNoInteractions(siteVisitRequestCreateAccountRelatedValidator);
    }

    @Test
    void getAvailableSiteVisitWorkflows() {
        final long accountId = 1L;
        final Year currentYear = Year.now();
        final Year lastYear = currentYear.minusYears(1);

        RequestCreateValidationResult currentYearValidationResult = mock(RequestCreateValidationResult.class);
        RequestCreateValidationResult lastYearValidationResult = mock(RequestCreateValidationResult.class);
        Map<Year, RequestCreateValidationResult> expected = Map.of(
            currentYear, currentYearValidationResult,
            lastYear, lastYearValidationResult
        );

        when(siteVisitRequestCreateAccountRelatedValidator.validateCreation(accountId, SiteVisitRequestCreateActionPayload.builder().year(currentYear).build()))
            .thenReturn(currentYearValidationResult);
        when(siteVisitRequestCreateAccountRelatedValidator.validateCreation(accountId, SiteVisitRequestCreateActionPayload.builder().year(lastYear).build()))
            .thenReturn(lastYearValidationResult);

        // Invoke
        Map<Year, RequestCreateValidationResult> actual = availableRequestService.getAvailableSiteVisitWorkflows(accountId);

        // Verify
        assertEquals(expected, actual);
        verify(siteVisitRequestCreateAccountRelatedValidator).validateCreation(accountId, SiteVisitRequestCreateActionPayload.builder().year(currentYear).build());
        verify(siteVisitRequestCreateAccountRelatedValidator).validateCreation(accountId, SiteVisitRequestCreateActionPayload.builder().year(lastYear).build());

        verifyNoInteractions(requestRepository, accountRequestAuthorizationResourceService, enabledWorkflowValidator, doeInitiateValidator);
        verifyNoMoreInteractions(siteVisitRequestCreateAccountRelatedValidator);
    }

    private RequestType buildRequestType(String requestTypeCode, String historyCategory, String resourceType) {
        return RequestType.builder()
                .code(requestTypeCode)
                .historyCategory(historyCategory)
                .resourceType(resourceType)
                .build();
    }
}
