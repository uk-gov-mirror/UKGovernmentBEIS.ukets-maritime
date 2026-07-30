package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanIdentifierGenerator;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.EmpCreateDocumentService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.common.utils.DateService;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpIssuanceCreateEmpDocumentServiceTest {

    @InjectMocks
    private EmpIssuanceCreateEmpDocumentService cut;

    @Mock
    private EmpCreateDocumentService empCreateDocumentService;
    @Mock
    private MrtmDocumentTemplateAccountDataCollectFromEmpIssuanceService templateAccountDataCollectFromEmpIssuanceService;
    @Mock
    private RequestTaskService requestTaskService;
    @Mock
    private DateService dateService;
    @Mock
    private EmissionsMonitoringPlanIdentifierGenerator generator;

    @Test
    void createAsyncConvert() {
        Long requestTaskId = 1L;
        Long accountId = 2L;
        String empId = "EMP-ID";
        String signatory = "signatory";
        UUID randomUUID = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime submissionDate = LocalDateTime.now().plusDays(1);
        DocumentTemplateStage stage = mock(DocumentTemplateStage.class);
        EmissionsMonitoringPlan emissionsMonitoringPlan = mock(EmissionsMonitoringPlan.class);
        Map<UUID, String> empAttachments = Map.of(randomUUID, "empAttachment");
        MrtmDocumentTemplateAccountData accountData = mock(MrtmDocumentTemplateAccountData.class);
        DecisionNotification decisionNotification = DecisionNotification.builder()
            .signatory(signatory)
            .build();
        EmissionsMonitoringPlanContainer empContainer = EmissionsMonitoringPlanContainer.builder()
            .emissionsMonitoringPlan(emissionsMonitoringPlan)
            .empAttachments(empAttachments)
            .build();
        EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload = EmpIssuanceApplicationReviewRequestTaskPayload.builder()
            .emissionsMonitoringPlan(emissionsMonitoringPlan)
            .empAttachments(empAttachments)
            .build();
        Request request = Request.builder()
            .id("3")
            .submissionDate(submissionDate)
            .requestResources(List.of(RequestResource.builder().resourceId(String.valueOf(accountId)).resourceType(ResourceType.ACCOUNT).build()))
            .build();
        RequestTask requestTask = RequestTask.builder()
            .id(requestTaskId)
            .payload(requestTaskPayload)
            .request(request)
            .build();
        EmissionsMonitoringPlanDTO empDTO = EmissionsMonitoringPlanDTO.builder()
            .id(empId)
            .accountId(accountId)
            .empContainer(empContainer)
            .consolidationNumber(1)
            .build();

        when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);
        when(generator.generate(accountId)).thenReturn(empId);
        when(templateAccountDataCollectFromEmpIssuanceService.collect(requestTask)).thenReturn(accountData);
        when(dateService.getLocalDateTime()).thenReturn(now);

        cut.createAsyncConvert(requestTaskId, stage, decisionNotification);

        verify(requestTaskService).findTaskById(requestTaskId);
        verify(generator).generate(accountId);
        verify(templateAccountDataCollectFromEmpIssuanceService).collect(requestTask);
        verify(empCreateDocumentService).generateDocumentAsyncConvert(request,
            requestTaskId,
            decisionNotification.getSignatory(),
            empDTO,
            MrtmDocumentTemplateType.EMP,
            stage,
            Collections.emptyList(),
            submissionDate,
            now,
            accountData);

        verifyNoMoreInteractions(empCreateDocumentService, templateAccountDataCollectFromEmpIssuanceService,
            requestTaskService, dateService, generator);
    }
}
