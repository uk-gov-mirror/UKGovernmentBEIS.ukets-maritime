package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

@ExtendWith(MockitoExtension.class)
class EmpVariationDocumentGenerateServiceTest {

	@InjectMocks
    private EmpVariationDocumentGenerateService cut;

    @Mock
    private EmpVariationCreateEmpDocumentService empVariationCreateEmpDocumentService;
    
    @Mock
    private EmpVariationOfficialNoticeService empVariationOfficialNoticeService;
    
    @Test
    void generateDocuments_emp() {
    	RequestGeneratedFileType type = RequestGeneratedFileType.EMP;
    	Long requestTaskId = 1l;
    	DocumentTemplateStage stage = DocumentTemplateStage.FINAL;
    	DecisionNotification decision = DecisionNotification.builder().signatory("sign").build();
    	
    	String expectedResult = "emp1";
    	
		when(empVariationCreateEmpDocumentService.createAsyncConvert(requestTaskId, stage, decision)).thenReturn(expectedResult);

    	cut.generateDocument(type, requestTaskId, stage, decision);
    	
    	verify(empVariationCreateEmpDocumentService, times(1)).createAsyncConvert(requestTaskId, stage, decision);
    	verifyNoInteractions(empVariationOfficialNoticeService);
    }
    
    @Test
    void generateDocuments_official() {
    	RequestGeneratedFileType type = RequestGeneratedFileType.OFFICIAL_NOTICE;
    	Long requestTaskId = 1l;
    	DocumentTemplateStage stage = DocumentTemplateStage.FINAL;
    	DecisionNotification decision = DecisionNotification.builder().signatory("sign").build();
    	
    	String expectedResult = "off1";
    	
		when(empVariationOfficialNoticeService.generateOfficialNoticeAsyncConvert(requestTaskId, stage, decision)).thenReturn(expectedResult);

    	cut.generateDocument(type, requestTaskId, stage, decision);
    	
    	verifyNoInteractions(empVariationCreateEmpDocumentService);
    	verify(empVariationOfficialNoticeService, times(1)).generateOfficialNoticeAsyncConvert(requestTaskId, stage, decision);
    }
}
