package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.enumeration.AccountSearchKey;
import uk.gov.mrtm.api.account.service.AccountDetailsHistoryConstants;
import uk.gov.mrtm.api.account.service.MrtmAccountUpdateService;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.EmpShipEmissions;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.mapper.EmpReviewMapper;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;
import uk.gov.netz.api.account.service.AccountSearchAdditionalKeywordService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;

import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmpIssuanceApprovedService {

    private final RequestService requestService;
    private final EmissionsMonitoringPlanService emissionsMonitoringPlanService;
    private final MrtmAccountUpdateService accountUpdateService;
    private final AccountSearchAdditionalKeywordService accountSearchAdditionalKeywordService;
    private final EmpIssuanceAccountDraftDataQueryService accountDraftDataQueryService;

    private static final EmpReviewMapper empReviewMapper = Mappers.getMapper(EmpReviewMapper.class);

    public void approveEmp(String requestId) {
        Request request = requestService.findRequestById(requestId);
        EmpIssuanceRequestPayload requestPayload = (EmpIssuanceRequestPayload) request.getPayload();

        Long accountId = request.getAccountId();

        EmissionsMonitoringPlanContainer empContainer =
                empReviewMapper.toEmissionsMonitoringPlanContainer(requestPayload);

        Set<EmpShipEmissions> empShipEmissionsSet = empContainer.getEmissionsMonitoringPlan().getEmissions().getShips();
        Set<EmpShipEmissions> sorted = empShipEmissionsSet.stream().sorted()
                .collect(Collectors.toCollection(LinkedHashSet::new));
        empContainer.getEmissionsMonitoringPlan().getEmissions().setShips(sorted);

        emissionsMonitoringPlanService.submitEmissionsMonitoringPlan(accountId, empContainer, requestPayload.getEmpDocument().getUuid());

        final EmpIssuanceAccountDraftData accountDraftData = accountDraftDataQueryService
            .getAccountDraftData(requestPayload);

        accountUpdateService.updateAccountUponEmpApproved(
                accountId,
                accountDraftData,
                AccountDetailsHistoryConstants.updatedThroughWorkflow(
                        AccountDetailsHistoryConstants.WORKFLOW_NAME_EMP_ISSUANCE, requestId),
                AccountDetailsHistoryConstants.SUBMITTED_BY_SYSTEM);

        requestService.saveRequest(request);

        updateSearchKeywords(accountId, accountDraftData.getName());
    }

    private void updateSearchKeywords(Long accountId, String name) {
        accountSearchAdditionalKeywordService.storeKeywordsForAccount(
                accountId,
                Map.of(AccountSearchKey.ACCOUNT_NAME.name(), name));
    }
}
