package uk.gov.mrtm.api.emissionsmonitoringplan.service;

import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.authorization.rules.services.authorityinfo.providers.EmpAuthorityInfoProvider;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanEntity;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmpAccountDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmpDetailsDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.repository.EmissionsMonitoringPlanRepository;
import uk.gov.mrtm.api.emissionsmonitoringplan.transform.EmissionsMonitoringPlanMapper;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.files.documents.service.storage.FileDocumentStorageService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.repository.RequestRepository;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmissionsMonitoringPlanQueryService implements EmpAuthorityInfoProvider {

    private final EmissionsMonitoringPlanRepository emissionsMonitoringPlanRepository;
    private final FileDocumentStorageService fileDocumentStorageService;
    private final RequestRepository requestRepository;

    private static final EmissionsMonitoringPlanMapper EMISSIONS_MONITORING_PLAN_MAPPER = Mappers.getMapper(EmissionsMonitoringPlanMapper.class);

    @Transactional(readOnly = true)
    public Optional<EmpDetailsDTO> getEmissionsMonitoringPlanDetailsDTOByAccountId(Long accountId) {
        return emissionsMonitoringPlanRepository.findByAccountId(accountId)
	        .map(empEntity -> {
	        	FileInfoDTO fileInfo = null;
	        	if (empEntity.getFileDocumentUuid() != null) {
						fileInfo = fileDocumentStorageService.getFileInfoDTO(empEntity.getFileDocumentUuid());
	            }
	        	return EMISSIONS_MONITORING_PLAN_MAPPER.toEmpDetailsDTO(empEntity, fileInfo);
	        });
    }

    @Transactional(readOnly = true)
    public Optional<EmissionsMonitoringPlanDTO> getEmissionsMonitoringPlanDTOByAccountId(Long accountId) {
        return emissionsMonitoringPlanRepository.findByAccountId(accountId).map(EMISSIONS_MONITORING_PLAN_MAPPER::toEmissionsMonitoringPlanDTO);
    }

    public EmissionsMonitoringPlanContainer getEmpContainerById(String id) {
        return emissionsMonitoringPlanRepository.findById(id)
            .map(EmissionsMonitoringPlanEntity::getEmpContainer)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    public boolean existsContainerByIdAndFileDocumentUuid(final String empId, final String fileDocumentUuid) {
        return emissionsMonitoringPlanRepository.existsByIdAndFileDocumentUuid(empId, fileDocumentUuid);
    }

    @Transactional(readOnly = true)
    public Request findApprovedByAccountId(Long accountId) {
        List<Request> requests = requestRepository.findByAccountIdAndTypeAndStatus(accountId, MrtmRequestType.EMP_ISSUANCE,
            EmpIssuanceDeterminationType.APPROVED.name());

        if (requests.size() != 1) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER);
        }

        return requests.getFirst();
    }

    public Optional<String> getEmpIdByAccountId(Long accountId) {
        return emissionsMonitoringPlanRepository.findIdByAccountId(accountId);
    }

    @Transactional(readOnly = true)
    public int getEmissionsMonitoringPlanConsolidationNumberByAccountId(Long accountId) {
        return emissionsMonitoringPlanRepository.findByAccountId(accountId)
                .map(EmissionsMonitoringPlanEntity::getConsolidationNumber)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    public Map<Long, EmpAccountDTO> getEmpAccountsByAccountIds(Set<Long> accountIds) {
        return emissionsMonitoringPlanRepository.findAllByAccountIdIn(accountIds).stream()
                .collect(Collectors.toMap(EmpAccountDTO::getAccountId, Function.identity()));
    }

    @Override
    public Long getEmpAccountById(String id) {
        return emissionsMonitoringPlanRepository.findEmpAccountById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public EmissionsMonitoringPlan getLastestEmissionsMonitoringPlan(Long accountId) {
        Optional<EmissionsMonitoringPlanDTO> empOptional = getEmissionsMonitoringPlanDTOByAccountId(accountId);

        return empOptional.isPresent()
            ? empOptional.get().getEmpContainer().getEmissionsMonitoringPlan()
            : getEmpFromPendingApprovalRequest(accountId);
    }

    private EmissionsMonitoringPlan getEmpFromPendingApprovalRequest(Long accountId) {
        List<Request> requestList = requestRepository.findByRequestTypeAndResourceTypeAndResourceId(
            MrtmRequestType.EMP_ISSUANCE, ResourceType.ACCOUNT, String.valueOf(accountId));

        Optional<RequestTask> requestTask = requestList.stream()
            .findFirst()
            .map(Request::getRequestTasks)
            .orElse(Collections.emptyList())
            .stream()
            .filter(rt -> MrtmRequestTaskType.EMP_ISSUANCE_APPLICATION_REVIEW.equals(rt.getType().getCode()))
            .findFirst();

        return requestTask.map(task -> ((EmpIssuanceApplicationReviewRequestTaskPayload) task.getPayload()).getEmissionsMonitoringPlan())
            .orElse(null);
    }
}
