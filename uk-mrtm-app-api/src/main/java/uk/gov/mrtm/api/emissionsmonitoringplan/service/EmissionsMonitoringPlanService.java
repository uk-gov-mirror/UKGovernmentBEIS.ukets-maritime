package uk.gov.mrtm.api.emissionsmonitoringplan.service;

import lombok.RequiredArgsConstructor;

import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanEntity;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.repository.EmissionsMonitoringPlanRepository;
import uk.gov.mrtm.api.emissionsmonitoringplan.transform.EmissionsMonitoringPlanMapper;
import uk.gov.mrtm.api.emissionsmonitoringplan.validation.EmpValidatorService;
import uk.gov.netz.api.common.exception.BusinessException;

import static uk.gov.netz.api.common.exception.ErrorCode.RESOURCE_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class EmissionsMonitoringPlanService {

	private final EmpValidatorService empValidatorService;
    private final EmissionsMonitoringPlanRepository emissionsMonitoringPlanRepository;
    private final EmissionsMonitoringPlanIdentifierGenerator empIdentifierGenerator;
    private static final EmissionsMonitoringPlanMapper EMISSIONS_MONITORING_PLAN_MAPPER = Mappers.getMapper(EmissionsMonitoringPlanMapper.class);

    @Transactional
    public void setFileDocumentUuid(final String empId, final String fileDocumentUuid) {
        emissionsMonitoringPlanRepository.updateFileDocumentUuid(empId, fileDocumentUuid);
    }
    
    @Transactional
    public void submitEmissionsMonitoringPlan(Long accountId, EmissionsMonitoringPlanContainer empContainer,
                                              String empFileUuid) {
        empValidatorService.validateEmissionsMonitoringPlan(empContainer, accountId);

        String empId = empIdentifierGenerator.generate(accountId);

        //submit
        EmissionsMonitoringPlanEntity empEntity = EmissionsMonitoringPlanEntity.builder()
            .id(empId)
            .accountId(accountId)
            .empContainer(empContainer)
            .fileDocumentUuid(empFileUuid)
            .build();

        emissionsMonitoringPlanRepository.save(empEntity);
    }
    
    @Transactional
	public EmissionsMonitoringPlanDTO updateEmissionsMonitoringPlan(Long accountId, EmissionsMonitoringPlanContainer empContainer) {
        // validate
        empValidatorService.validateEmissionsMonitoringPlan(empContainer, accountId);

        final EmissionsMonitoringPlanEntity empEntity = emissionsMonitoringPlanRepository.findByAccountId(accountId)
                .orElseThrow(() -> new BusinessException(RESOURCE_NOT_FOUND));

        final int nextConsolidationNumber = calculateNextConsolidationNumber(empEntity);
        
        // update emp
        empEntity.setEmpContainer(empContainer);
        empEntity.setConsolidationNumber(nextConsolidationNumber);
        
        return EMISSIONS_MONITORING_PLAN_MAPPER.toEmissionsMonitoringPlanDTO(empEntity);
    }
    
    @Transactional
    public int incrementEmpConsolidationNumber(Long accountId) {
        EmissionsMonitoringPlanEntity empEntity = emissionsMonitoringPlanRepository.findByAccountId(accountId)
                .orElseThrow(() -> new BusinessException(RESOURCE_NOT_FOUND));
        final int nextConsolidationNumber = calculateNextConsolidationNumber(empEntity);
        empEntity.setConsolidationNumber(nextConsolidationNumber);
        return nextConsolidationNumber;
    }
    
    public int calculateNextConsolidationNumber(Long accountId) {
    	final EmissionsMonitoringPlanEntity empEntity = emissionsMonitoringPlanRepository.findByAccountId(accountId)
                .orElseThrow(() -> new BusinessException(RESOURCE_NOT_FOUND));
    	
    	return calculateNextConsolidationNumber(empEntity);
    }
    
    private int calculateNextConsolidationNumber(EmissionsMonitoringPlanEntity empEntity) {
    	return empEntity.getConsolidationNumber() + 1;
    }

}
