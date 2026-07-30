package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceDocumentGenerateServiceTest {

    @InjectMocks
    private EmpIssuanceDocumentGenerateService cut;

    @Mock
    private EmpIssuanceCreateEmpDocumentService empIssuanceCreateEmpDocumentService;

    @Mock
    private EmpIssuanceOfficialNoticeService empIssuanceOfficialNoticeService;

    @Test
    void generateDocuments_emp() {
        RequestGeneratedFileType type = RequestGeneratedFileType.EMP;
        Long requestTaskId = 1l;
        DocumentTemplateStage stage = DocumentTemplateStage.FINAL;
        DecisionNotification decision = DecisionNotification.builder().signatory("sign").build();

        String expectedResult = "emp1";

        when(empIssuanceCreateEmpDocumentService.createAsyncConvert(requestTaskId, stage, decision)).thenReturn(expectedResult);

        cut.generateDocument(type, requestTaskId, stage, decision);

        verify(empIssuanceCreateEmpDocumentService, times(1)).createAsyncConvert(requestTaskId, stage, decision);
        verifyNoInteractions(empIssuanceOfficialNoticeService);
    }

    @Test
    void generateDocuments_official() {
        RequestGeneratedFileType type = RequestGeneratedFileType.OFFICIAL_NOTICE;
        Long requestTaskId = 1l;
        DocumentTemplateStage stage = DocumentTemplateStage.FINAL;
        DecisionNotification decision = DecisionNotification.builder().signatory("sign").build();

        String expectedResult = "off1";

        when(empIssuanceOfficialNoticeService.generateOfficialNoticeAsyncConvert(requestTaskId, stage, decision)).thenReturn(expectedResult);

        cut.generateDocument(type, requestTaskId, stage, decision);

        verifyNoInteractions(empIssuanceCreateEmpDocumentService);
        verify(empIssuanceOfficialNoticeService, times(1)).generateOfficialNoticeAsyncConvert(requestTaskId, stage, decision);
    }
}
