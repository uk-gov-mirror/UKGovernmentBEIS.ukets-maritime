package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.enumeration.AccountSearchKey;
import uk.gov.mrtm.api.account.service.MrtmAccountUpdateService;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.EmpOperatorDetails;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.LimitedCompanyOrganisation;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.OrganisationLegalStatusType;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestInfo;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.netz.api.account.service.AccountSearchAdditionalKeywordService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationMapper;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.service.RequestService;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EmpVariationUpdateEmpServiceTest {

    @InjectMocks
    private EmpVariationUpdateEmpService service;

    @Mock
    private RequestService requestService;

    @Mock
    private EmissionsMonitoringPlanService emissionsMonitoringPlanService;

    @Mock
    private MrtmAccountUpdateService mrtmAccountUpdateService;
    
    @Mock
    private EmpVariationAccountDraftDataQueryService accountDraftDataQueryService;

    @Mock
    private EmpVariationDraftDataQueryService empDraftDataQueryService;

    @Mock
    private AccountSearchAdditionalKeywordService accountSearchAdditionalKeywordService;

    @Test
    void updateEmp() {
        Long accountId = 1L;
        String requestId = "requestId";
        String operatorName = "name";
        AddressStateDTO contactAddress = AddressStateDTO.builder()
                .line1("addressLine")
                .state("state")
                .city("city")
                .country("country")
                .build();
        AddressStateDTO registeredAddress = AddressStateDTO.builder()
                .line1("line1")
                .state("state1")
                .city("city1")
                .country("country1")
                .build();
        EmpVariationRequestPayload requestPayload = EmpVariationRequestPayload.builder()
        		.empConsolidationNumber(1)
                .emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
                        .operatorDetails(EmpOperatorDetails.builder()
                                .contactAddress(contactAddress)
                                .operatorName(operatorName)
                                .organisationStructure(LimitedCompanyOrganisation.builder()
                                        .legalStatusType(OrganisationLegalStatusType.LIMITED_COMPANY)
                                        .registeredAddress(registeredAddress)
                                        .build())
                                .build())
                        .build())
                .empDocument(FileInfoDTO.builder().uuid("uuid").build())
                .build();
        
        EmpVariationRequestMetadata requestMetadata = EmpVariationRequestMetadata.builder()
        		.empConsolidationNumber(1)
        		.summary("currentsum")
        		.build();
        
        Request request = Request.builder()
                .id(requestId)
                .metadata(requestMetadata)
                .payload(requestPayload)
                .requestResources(List.of(RequestResource.builder().resourceId(String.valueOf(accountId)).resourceType(ResourceType.ACCOUNT).build()))
                .build();
        
        EmpVariationAccountDraftData accountDraftData = EmpVariationAccountDraftData.builder().name("draftaccname").build();
        
        int nextConsolidationNumber = 2;
        
        String empId = "empId";
        
        EmissionsMonitoringPlanDTO empDTO = EmissionsMonitoringPlanDTO.builder()
        		.id(empId)
        		.consolidationNumber(nextConsolidationNumber)
        		.build();

        when(requestService.findRequestById(requestId)).thenReturn(request);
        when(accountDraftDataQueryService.getAccountDraftData(requestPayload)).thenReturn(accountDraftData);
		when(emissionsMonitoringPlanService.updateEmissionsMonitoringPlan(accountId,
				Mappers.getMapper(EmpVariationMapper.class).toEmissionsMonitoringPlanContainer(requestPayload)))
				.thenReturn(empDTO);
		when(empDraftDataQueryService.getEmpVariationDeterminationSummary(request)).thenReturn("sum");
        
        service.updateEmp(requestId);
        
        assertThat(requestMetadata.getEmpConsolidationNumber()).isEqualTo(nextConsolidationNumber);
        assertThat(requestMetadata.getSummary()).isEqualTo("sum");
        assertThat(requestPayload.getEmpConsolidationNumber()).isEqualTo(nextConsolidationNumber);

        verify(requestService, times(1)).findRequestById(requestId);
        verify(accountDraftDataQueryService, times(1)).getAccountDraftData(requestPayload);
        verify(emissionsMonitoringPlanService, times(1)).setFileDocumentUuid(empId, requestPayload.getEmpDocument().getUuid());
        verify(empDraftDataQueryService, times(1)).getEmpVariationDeterminationSummary(request);
        verify(mrtmAccountUpdateService, times(1))
                .updateAccountUponEmpVariationApproved(accountId, accountDraftData);

        verify(accountSearchAdditionalKeywordService, times(1)).storeKeywordsForAccount(accountId, Map.of(AccountSearchKey.ACCOUNT_NAME.name(), operatorName));
    }
}
