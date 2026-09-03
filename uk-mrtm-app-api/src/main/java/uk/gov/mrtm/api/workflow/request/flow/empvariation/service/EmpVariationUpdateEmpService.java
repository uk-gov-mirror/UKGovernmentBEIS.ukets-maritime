package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.account.enumeration.AccountSearchKey;
import uk.gov.mrtm.api.account.service.AccountDetailsHistoryConstants;
import uk.gov.mrtm.api.account.service.MrtmAccountUpdateService;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.EmpOperatorDetails;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationMapper;
import uk.gov.netz.api.account.service.AccountSearchAdditionalKeywordService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmpVariationUpdateEmpService {

    private final RequestService requestService;
    private final EmissionsMonitoringPlanService emissionsMonitoringPlanService;
    private final MrtmAccountUpdateService mrtmAccountUpdateService;
    private final EmpVariationAccountDraftDataQueryService accountDraftDataQueryService;
    private final EmpVariationDraftDataQueryService empDraftDataQueryService;
    private final AccountSearchAdditionalKeywordService accountSearchAdditionalKeywordService;

    private static final EmpVariationMapper EMP_VARIATION_MAPPER = Mappers.getMapper(EmpVariationMapper.class);

    @Transactional
    public void updateEmp(final String requestId) {
        final Request request = requestService.findRequestById(requestId);
        final EmpVariationRequestPayload requestPayload = (EmpVariationRequestPayload) request.getPayload();
        final EmpVariationRequestMetadata requestMetadata = (EmpVariationRequestMetadata) request.getMetadata();
        final Long accountId = request.getAccountId();
        final EmissionsMonitoringPlanContainer empContainer =
                EMP_VARIATION_MAPPER.toEmissionsMonitoringPlanContainer(
                        requestPayload);

        final EmpVariationAccountDraftData accountDraftData = accountDraftDataQueryService
				.getAccountDraftData(requestPayload);

		final EmissionsMonitoringPlanDTO empDTO = emissionsMonitoringPlanService.updateEmissionsMonitoringPlan(accountId, empContainer);
        final int newConsolidationNumber = empDTO.getConsolidationNumber();
		emissionsMonitoringPlanService.setFileDocumentUuid(empDTO.getId(), requestPayload.getEmpDocument().getUuid());
        requestMetadata.setEmpConsolidationNumber(newConsolidationNumber);
        requestMetadata.setSummary(empDraftDataQueryService.getEmpVariationDeterminationSummary(request));
        requestPayload.setEmpConsolidationNumber(newConsolidationNumber);
		requestService.saveRequest(request);
		mrtmAccountUpdateService.updateAccountUponEmpVariationApproved(
                accountId,
                accountDraftData,
                AccountDetailsHistoryConstants.updatedThroughWorkflow(
                        AccountDetailsHistoryConstants.WORKFLOW_NAME_EMP_VARIATION, requestId),
                AccountDetailsHistoryConstants.SUBMITTED_BY_SYSTEM);

		final EmpOperatorDetails empOperatorDetails = empContainer.getEmissionsMonitoringPlan().getOperatorDetails();
        updateSearchKeywords(accountId, empOperatorDetails.getOperatorName());
    }

    private void updateSearchKeywords(Long accountId, String name) {
        accountSearchAdditionalKeywordService.storeKeywordsForAccount(
            accountId,
            Map.of(AccountSearchKey.ACCOUNT_NAME.name(), name));
    }

}
