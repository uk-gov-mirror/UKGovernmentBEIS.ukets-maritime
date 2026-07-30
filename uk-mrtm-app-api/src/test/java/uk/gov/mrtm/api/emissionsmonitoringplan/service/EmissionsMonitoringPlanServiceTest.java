package uk.gov.mrtm.api.emissionsmonitoringplan.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanEntity;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.abbreviations.EmpAbbreviations;
import uk.gov.mrtm.api.emissionsmonitoringplan.repository.EmissionsMonitoringPlanRepository;
import uk.gov.mrtm.api.emissionsmonitoringplan.validation.EmpValidatorService;

@ExtendWith(MockitoExtension.class)
class EmissionsMonitoringPlanServiceTest {
    private static final String EMP_ID = "empId";

    @InjectMocks
    private EmissionsMonitoringPlanService cut;

    @Mock
    private EmpValidatorService empValidatorService;

    @Mock
    private EmissionsMonitoringPlanRepository emissionsMonitoringPlanRepository;

    @Mock
    private EmissionsMonitoringPlanIdentifierGenerator empIdentifierGenerator;

    @Test
    void submitEmissionsMonitoringPlan() {
        ArgumentCaptor<EmissionsMonitoringPlanEntity> empCaptor = ArgumentCaptor.forClass(EmissionsMonitoringPlanEntity.class);
        Long accountId = 1L;
        String fileUuid = "file-uuid";
        EmissionsMonitoringPlanContainer empContainer = mock(EmissionsMonitoringPlanContainer.class);
        EmissionsMonitoringPlanEntity expectedEmpEntity = EmissionsMonitoringPlanEntity.builder()
            .id(EMP_ID)
            .accountId(accountId)
            .empContainer(empContainer)
            .fileDocumentUuid(fileUuid)
            .build();

        when(empIdentifierGenerator.generate(accountId)).thenReturn(EMP_ID);

        cut.submitEmissionsMonitoringPlan(accountId, empContainer, fileUuid);

        verify(empValidatorService).validateEmissionsMonitoringPlan(empContainer, accountId);
        verify(empIdentifierGenerator).generate(accountId);
        verify(emissionsMonitoringPlanRepository).save(empCaptor.capture());

        EmissionsMonitoringPlanEntity actualEmpEntity = empCaptor.getValue();
        assertThat(actualEmpEntity.getId()).isEqualTo(expectedEmpEntity.getId());
        assertThat(actualEmpEntity.getEmpContainer()).isEqualTo(expectedEmpEntity.getEmpContainer());
        assertThat(actualEmpEntity.getAccountId()).isEqualTo(expectedEmpEntity.getAccountId());
        assertThat(actualEmpEntity.getConsolidationNumber()).isEqualTo(expectedEmpEntity.getConsolidationNumber());
        assertThat(actualEmpEntity.getFileDocumentUuid()).isEqualTo(expectedEmpEntity.getFileDocumentUuid());

        verifyNoMoreInteractions(empValidatorService, empIdentifierGenerator, emissionsMonitoringPlanRepository);
    }

    @Test
    void updateEmissionsMonitoringPlan() {
    	Long accountId = 1L;
		EmissionsMonitoringPlanContainer empContainer = EmissionsMonitoringPlanContainer.builder()
				.emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
						.abbreviations(EmpAbbreviations.builder().exist(true).build()).build())
				.build();
		int nextConsolidationNumber = 2;

		EmissionsMonitoringPlanEntity empEntity = EmissionsMonitoringPlanEntity.builder()
				.build();

		when(emissionsMonitoringPlanRepository.findByAccountId(accountId)).thenReturn(Optional.of(empEntity));

		cut.updateEmissionsMonitoringPlan(accountId, empContainer);

		assertThat(empEntity.getConsolidationNumber()).isEqualTo(nextConsolidationNumber);
		assertThat(empEntity.getEmpContainer()).isEqualTo(empContainer);

		verify(empValidatorService, times(1)).validateEmissionsMonitoringPlan(empContainer, accountId);
		verify(emissionsMonitoringPlanRepository, times(1)).findByAccountId(accountId);
    }

    @Test
    void incrementEmpConsolidationNumber() {
    	Long accountId = 1L;

		EmissionsMonitoringPlanEntity empEntity = new EmissionsMonitoringPlanEntity();
		empEntity.setConsolidationNumber(2);

		when(emissionsMonitoringPlanRepository.findByAccountId(accountId)).thenReturn(Optional.of(empEntity));

		var result = cut.incrementEmpConsolidationNumber(accountId);

		assertThat(result).isEqualTo(3);

		verify(emissionsMonitoringPlanRepository, times(1)).findByAccountId(accountId);
    }

    @Test
    void calculateNextConsolidationNumber() {
    	Long accountId = 1L;

		EmissionsMonitoringPlanEntity empEntity = new EmissionsMonitoringPlanEntity();
		empEntity.setConsolidationNumber(2);

		when(emissionsMonitoringPlanRepository.findByAccountId(accountId)).thenReturn(Optional.of(empEntity));

		var result = cut.calculateNextConsolidationNumber(accountId);

		assertThat(result).isEqualTo(3);

		verify(emissionsMonitoringPlanRepository, times(1)).findByAccountId(accountId);
    }



}
