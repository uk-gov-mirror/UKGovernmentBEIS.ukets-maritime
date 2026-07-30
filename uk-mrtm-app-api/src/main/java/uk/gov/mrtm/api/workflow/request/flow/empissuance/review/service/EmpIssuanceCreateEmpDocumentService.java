package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanIdentifierGenerator;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.EmpCreateDocumentService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.mapper.EmpReviewMapper;
import uk.gov.netz.api.common.utils.DateService;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class EmpIssuanceCreateEmpDocumentService {

    private final EmpCreateDocumentService empCreateDocumentService;
    private final MrtmDocumentTemplateAccountDataCollectFromEmpIssuanceService templateAccountDataCollectFromEmpIssuanceService;
    private final RequestTaskService requestTaskService;
    private final DateService dateService;
    private final EmissionsMonitoringPlanIdentifierGenerator generator;

    private static final EmpReviewMapper EMP_REVIEW_MAPPER = Mappers.getMapper(EmpReviewMapper.class);

    public String createAsyncConvert(Long requestTaskId, DocumentTemplateStage stage,
                                     DecisionNotification decisionNotification) {
        final RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);
        final Request request = requestTask.getRequest();
        final Long accountId = request.getAccountId();

        final EmissionsMonitoringPlanContainer empContainer = EMP_REVIEW_MAPPER.toEmissionsMonitoringPlanContainer(
            (EmpIssuanceApplicationReviewRequestTaskPayload) requestTask.getPayload());

        final EmissionsMonitoringPlanDTO empDTO = EmissionsMonitoringPlanDTO.builder()
            .id(generator.generate(accountId))
            .accountId(accountId)
            .empContainer(empContainer)
            .consolidationNumber(1)
            .build();

        MrtmDocumentTemplateAccountData accountData = templateAccountDataCollectFromEmpIssuanceService.collect(requestTask);

        return empCreateDocumentService.generateDocumentAsyncConvert(request,
            requestTaskId,
            decisionNotification.getSignatory(),
            empDTO,
            MrtmDocumentTemplateType.EMP,
            stage,
            Collections.emptyList(),
            request.getSubmissionDate(),
            dateService.getLocalDateTime(),
            accountData
        );
    }
}
