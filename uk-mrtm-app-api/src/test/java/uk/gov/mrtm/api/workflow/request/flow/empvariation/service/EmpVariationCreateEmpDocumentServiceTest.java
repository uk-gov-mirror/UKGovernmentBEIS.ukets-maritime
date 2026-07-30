package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.abbreviations.EmpAbbreviations;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.EmpCreateDocumentService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestInfo;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationMapper;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

@ExtendWith(MockitoExtension.class)
class EmpVariationCreateEmpDocumentServiceTest {

    @InjectMocks
    private EmpVariationCreateEmpDocumentService cut;

    @Mock
    private RequestTaskService requestTaskService;
    
    @Mock
    private EmissionsMonitoringPlanService emissionsMonitoringPlanService;

    @Mock
    private EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;

    @Mock
    private EmpCreateDocumentService empCreateDocumentService;
    
    @Mock
    private EmpVariationRequestQueryService empVariationRequestQueryService;
    
    @Mock
    private EmpVariationDraftDataQueryService empDraftDataQueryService;
    
    @Mock
    private MrtmDocumentTemplateAccountDataCollectFromEmpVariationService templateAccountDataCollectFromEmpVariationService;

    @Test
    void createAsyncConvert() {
    	Long requestTaskId = 1L;
    	DocumentTemplateStage stage = DocumentTemplateStage.PREVIEW;
    	Long accountId = 2L;
    	
    	Request request = Request.builder()
    			.requestResources(List.of(RequestResource.builder().resourceId(String.valueOf(accountId)).resourceType(ResourceType.ACCOUNT).build()))
    			.build();
    	
    	EmpVariationApplicationSubmitRequestTaskPayload requestTaskPayload = EmpVariationApplicationSubmitRequestTaskPayload.builder()
    			.emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
    					.abbreviations(EmpAbbreviations.builder().exist(true).build())
    					.build())
    			.build();
    	
    	RequestTask requestTask = RequestTask.builder()
    			.payload(requestTaskPayload)
    			.request(request)
    			.build();
    	
    	String empId = "empId";
    	int nextConsolidationNumber = 3;
    	final EmpVariationRequestInfo variationCurrentRequest = EmpVariationRequestInfo.builder()
                .submissionDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusDays(1)).build();
		final List<EmpVariationRequestInfo> variationHistoricalRequests = List
				.of(EmpVariationRequestInfo.builder().id("1").build());
		final Request empIssuanceRequest = Request.builder().submissionDate(LocalDateTime.now()).endDate(LocalDateTime.now()).build();
		MrtmDocumentTemplateAccountData accountData = MrtmDocumentTemplateAccountData.builder()
        		.name("name")
        		.competentAuthority(request.getCompetentAuthority())
        		.imoNumber("imo")
        		.address("address")
        		.build();
		
		final List<EmpVariationRequestInfo> variationHistory = new ArrayList<>(variationHistoricalRequests);
    	variationHistory.add(variationCurrentRequest);
    	
    	
    	EmissionsMonitoringPlanContainer empContainer =
        		Mappers.getMapper(EmpVariationMapper.class).toEmissionsMonitoringPlanContainer(
                        requestTaskPayload);
        final EmissionsMonitoringPlanDTO emp = EmissionsMonitoringPlanDTO.builder().id(empId)
        		.accountId(accountId)
        		.empContainer(empContainer)
        		.consolidationNumber(nextConsolidationNumber)
        		.build();
        
        DecisionNotification decision = DecisionNotification.builder().signatory("sign").build();
        
        String expectedResult = "proc";
    	
    	when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);
    	when(emissionsMonitoringPlanQueryService.getEmpIdByAccountId(accountId)).thenReturn(Optional.of(empId));
    	when(emissionsMonitoringPlanService.calculateNextConsolidationNumber(accountId)).thenReturn(nextConsolidationNumber);
    	when(empDraftDataQueryService.getEmpVariationDraftData(requestTask,
				nextConsolidationNumber)).thenReturn(variationCurrentRequest);
    	when(empVariationRequestQueryService.findEmpVariationRequests(accountId))
        	.thenReturn(variationHistoricalRequests);
    	when(emissionsMonitoringPlanQueryService.findApprovedByAccountId(accountId))
    		.thenReturn(empIssuanceRequest);
    	when(templateAccountDataCollectFromEmpVariationService.collect(requestTask)).thenReturn(accountData);
		when(empCreateDocumentService.generateDocumentAsyncConvert(empIssuanceRequest, requestTaskId, decision.getSignatory(), emp,
				MrtmDocumentTemplateType.EMP, stage, variationHistory, empIssuanceRequest.getSubmissionDate(),
				empIssuanceRequest.getEndDate(), accountData)).thenReturn(expectedResult);
    	
    	String result = cut.createAsyncConvert(requestTaskId, stage, decision);

        assertThat(result).isEqualTo(expectedResult);
    	
    	verify(requestTaskService, times(1)).findTaskById(requestTaskId);
    	verify(emissionsMonitoringPlanQueryService, times(1)).getEmpIdByAccountId(accountId);
    	verify(emissionsMonitoringPlanService, times(1)).calculateNextConsolidationNumber(accountId);
    	verify(empDraftDataQueryService, times(1)).getEmpVariationDraftData(requestTask,
				nextConsolidationNumber);
    	verify(empVariationRequestQueryService, times(1)).findEmpVariationRequests(accountId);
    	verify(emissionsMonitoringPlanQueryService).findApprovedByAccountId(accountId);
    	verify(templateAccountDataCollectFromEmpVariationService).collect(requestTask);
    	verify(empCreateDocumentService, times(1)).generateDocumentAsyncConvert(request, requestTaskId, decision.getSignatory(), emp,
                MrtmDocumentTemplateType.EMP, stage, variationHistory, empIssuanceRequest.getSubmissionDate(),
                empIssuanceRequest.getEndDate(), accountData);
    	
        
    }


}
