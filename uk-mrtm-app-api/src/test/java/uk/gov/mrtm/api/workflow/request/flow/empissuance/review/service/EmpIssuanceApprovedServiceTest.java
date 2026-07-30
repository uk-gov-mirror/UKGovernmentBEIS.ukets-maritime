package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.enumeration.AccountSearchKey;
import uk.gov.mrtm.api.account.service.MrtmAccountUpdateService;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.EmissionsMonitoringPlanFactory;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDetermination;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpReviewGroup;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;
import uk.gov.netz.api.account.service.AccountSearchAdditionalKeywordService;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceApprovedServiceTest {

    @InjectMocks
    private EmpIssuanceApprovedService empIssuanceApprovedService;

    @Mock
    private RequestService requestService;

    @Mock
    private EmissionsMonitoringPlanService emissionsMonitoringPlanService;

    @Mock
    private MrtmAccountUpdateService accountUpdateService;

    @Mock
    private AccountSearchAdditionalKeywordService accountSearchAdditionalKeywordService;

    @Mock
    private EmpIssuanceAccountDraftDataQueryService accountDraftDataQueryService;

    private static final UUID DOCUMENT_ID_1 = UUID.randomUUID();
    private static final UUID DOCUMENT_ID_2 = UUID.randomUUID();
    private static final String IMO_NUMBER = "7654321";

    @Test
    void approveEmp() {
        Long accountId = 1L;
        String requestId = "REQ3";
        String fileUuid = "file-uuid";
        String name = "name2";

        EmissionsMonitoringPlan emissionsMonitoringPlan =
                EmissionsMonitoringPlanFactory.getEmissionsMonitoringPlan(DOCUMENT_ID_1, IMO_NUMBER);
        EmpIssuanceAccountDraftData accountDraftData = EmpIssuanceAccountDraftData.builder()
            .name(name)
            .build();

        EmpIssuanceRequestPayload payload = EmpIssuanceRequestPayload.builder()
                .emissionsMonitoringPlan(emissionsMonitoringPlan)
                .empSectionsCompleted(Map.of("a", "b"))
                .empDocument(FileInfoDTO.builder().uuid(fileUuid).build())
                .empAttachments(Map.of(DOCUMENT_ID_1, "test"))
                .reviewGroupDecisions(Map.of(EmpReviewGroup.ABBREVIATIONS_AND_DEFINITIONS,
                        EmpIssuanceReviewDecision.builder().build()))
                .reviewAttachments(Map.of(DOCUMENT_ID_2, "test"))
                .determination(EmpIssuanceDetermination.builder().build())
                .decisionNotification(DecisionNotification.builder().build())
                .build();

        Request request = Request.builder()
                .id(requestId)
                .payload(payload)
                .requestResources(List.of(RequestResource.builder()
                    .resourceId(String.valueOf(accountId))
                    .resourceType(ResourceType.ACCOUNT)
                    .build()))
                .build();

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(accountDraftDataQueryService.getAccountDraftData(payload)).thenReturn(accountDraftData);

        empIssuanceApprovedService.approveEmp(requestId);

        verify(requestService).findRequestById(requestId);
        verify(requestService).saveRequest(request);
        verify(accountDraftDataQueryService).getAccountDraftData(payload);
        verify(accountUpdateService).updateAccountUponEmpApproved(accountId, accountDraftData);
        verify(accountSearchAdditionalKeywordService)
            .storeKeywordsForAccount(accountId, Map.of(AccountSearchKey.ACCOUNT_NAME.name(), name));
        verify(emissionsMonitoringPlanService)
            .submitEmissionsMonitoringPlan(eq(accountId), any(EmissionsMonitoringPlanContainer.class), eq(fileUuid));

        verifyNoMoreInteractions(requestService, accountUpdateService, accountDraftDataQueryService,
                accountSearchAdditionalKeywordService, emissionsMonitoringPlanService);
    }

}