package uk.gov.mrtm.api.workflow.request.flow.aer.common.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestMetadataType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerMonitoringPlanVersion;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestInfo;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationRequestQueryService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AerBuildMonitoringPlanVersionsServiceTest {

    @InjectMocks
    private AerBuildMonitoringPlanVersionsService aerBuildMonitoringPlanVersionsService;

    @Mock
    private EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;

    @Mock
    private EmpVariationRequestQueryService empVariationRequestQueryService;

    @Mock
    private AerRequestQueryService aerRequestQueryService;

    @Test
    void build_emp_variations_exists() {
        Year reportingYear = Year.now();
        Long accountId = 1L;
        String empId = "empId";

        when(emissionsMonitoringPlanQueryService.getEmpIdByAccountId(accountId)).thenReturn(Optional.of(empId));

        when(empVariationRequestQueryService.findEmpVariationRequests(accountId)).thenReturn(
                List.of(
                        createEmpVariationRequestInfo("requestId1", LocalDateTime.of(reportingYear.getValue(), 5, 17, 11, 15), 10),
                        createEmpVariationRequestInfo("requestId2", LocalDateTime.of(reportingYear.getValue(), 4, 17, 11, 15), 9),
                        createEmpVariationRequestInfo("requestId3", LocalDateTime.of(reportingYear.getValue(), 2, 15, 12, 20), 8),
                        createEmpVariationRequestInfo("requestId4", LocalDateTime.of(reportingYear.minusYears(1).getValue(), 7, 15, 12, 20), 7),
                        createEmpVariationRequestInfo("requestId5", LocalDateTime.of(reportingYear.minusYears(1).getValue(), 4, 16, 8, 25), 6)
                ));

        AerMonitoringPlanVersion expectedResult =
                createAerMonitoringPlanVersion(empId, LocalDate.of(reportingYear.getValue(), 5, 17), 10);

        Optional<AerMonitoringPlanVersion> actualResult = aerBuildMonitoringPlanVersionsService.build(accountId, reportingYear);

        assertThat(actualResult).contains(expectedResult);

        verify(emissionsMonitoringPlanQueryService, times(1)).getEmpIdByAccountId(accountId);
        verify(empVariationRequestQueryService, times(1)).findEmpVariationRequests(accountId);
        verifyNoInteractions(aerRequestQueryService);
    }

    @Test
    void build_skips_emp_variations_with_null_end_date() {
        Year reportingYear = Year.now();
        Long accountId = 1L;
        String empId = "empId";

        when(emissionsMonitoringPlanQueryService.getEmpIdByAccountId(accountId)).thenReturn(Optional.of(empId));

        when(empVariationRequestQueryService.findEmpVariationRequests(accountId)).thenReturn(
                List.of(
                        createEmpVariationRequestInfo("openVariation", null, 11),
                        createEmpVariationRequestInfo("completedVariation",
                                LocalDateTime.of(reportingYear.getValue(), 5, 17, 11, 15), 10)
                ));

        AerMonitoringPlanVersion expectedResult =
                createAerMonitoringPlanVersion(empId, LocalDate.of(reportingYear.getValue(), 5, 17), 10);

        Optional<AerMonitoringPlanVersion> actualResult = aerBuildMonitoringPlanVersionsService.build(accountId, reportingYear);

        assertThat(actualResult).contains(expectedResult);

        verify(emissionsMonitoringPlanQueryService, times(1)).getEmpIdByAccountId(accountId);
        verify(empVariationRequestQueryService, times(1)).findEmpVariationRequests(accountId);
        verifyNoInteractions(aerRequestQueryService);
    }

    @Test
    void build_falls_back_to_issuance_when_only_emp_variations_have_null_end_date() {
        Year reportingYear = Year.now();
        Long accountId = 1L;
        String empId = "empId";

        when(emissionsMonitoringPlanQueryService.getEmpIdByAccountId(accountId)).thenReturn(Optional.of(empId));

        when(empVariationRequestQueryService.findEmpVariationRequests(accountId)).thenReturn(
                List.of(createEmpVariationRequestInfo("openVariation", null, 11)));

        when(aerRequestQueryService.findEndDateOfApprovedEmpIssuanceByAccountId(accountId,
                MrtmRequestType.EMP_ISSUANCE))
                .thenReturn(Optional.of(LocalDateTime.of(reportingYear.minusYears(1).getValue(), 2, 15, 12, 20)));

        AerMonitoringPlanVersion expectedResult =
                createAerMonitoringPlanVersion(empId, LocalDate.of(reportingYear.minusYears(1).getValue(), 2, 15), 1);

        Optional<AerMonitoringPlanVersion> actualResult = aerBuildMonitoringPlanVersionsService.build(accountId, reportingYear);

        assertThat(actualResult).contains(expectedResult);

        verify(emissionsMonitoringPlanQueryService, times(1)).getEmpIdByAccountId(accountId);
        verify(empVariationRequestQueryService, times(1)).findEmpVariationRequests(accountId);
        verify(aerRequestQueryService, times(1))
                .findEndDateOfApprovedEmpIssuanceByAccountId(accountId, MrtmRequestType.EMP_ISSUANCE);
    }

    @Test
    void build_emp_variations_not_in_AER_year_exists() {
        Year reportingYear = Year.now();
        Long accountId = 1L;
        String empId = "empId";

        when(emissionsMonitoringPlanQueryService.getEmpIdByAccountId(accountId)).thenReturn(Optional.of(empId));

        when(empVariationRequestQueryService.findEmpVariationRequests(accountId)).thenReturn(
                List.of(
                        createEmpVariationRequestInfo("requestId1", LocalDateTime.of(reportingYear.minusYears(1).getValue(), 7, 15, 12, 20), 7),
                        createEmpVariationRequestInfo("requestId2", LocalDateTime.of(reportingYear.minusYears(1).getValue(), 4, 16, 8, 25), 6)
                ));

        when(aerRequestQueryService.findEndDateOfApprovedEmpIssuanceByAccountId(accountId,
                MrtmRequestType.EMP_ISSUANCE))
                .thenReturn(Optional.of(LocalDateTime.of(reportingYear.minusYears(2).getValue(), 2, 15, 12, 20)));

        AerMonitoringPlanVersion expectedResult =
                createAerMonitoringPlanVersion(empId, LocalDate.of(reportingYear.minusYears(2).getValue(), 2, 15), 1);

        Optional<AerMonitoringPlanVersion> actualResult = aerBuildMonitoringPlanVersionsService.build(accountId, reportingYear);

        assertThat(actualResult).contains(expectedResult);

        verify(emissionsMonitoringPlanQueryService, times(1)).getEmpIdByAccountId(accountId);
        verify(empVariationRequestQueryService, times(1)).findEmpVariationRequests(accountId);
        verify(aerRequestQueryService, times(1)).findEndDateOfApprovedEmpIssuanceByAccountId(accountId, MrtmRequestType.EMP_ISSUANCE);

    }

    @Test
    void build_emp_not_exists() {
        Year reportingYear = Year.now();
        Long accountId = 1L;

        when(emissionsMonitoringPlanQueryService.getEmpIdByAccountId(accountId)).thenReturn(Optional.empty());

        Optional<AerMonitoringPlanVersion> actualResult = aerBuildMonitoringPlanVersionsService.build(accountId, reportingYear);

        assertThat(actualResult).isEmpty();

        verify(emissionsMonitoringPlanQueryService, times(1)).getEmpIdByAccountId(accountId);
        verifyNoInteractions(empVariationRequestQueryService);
        verifyNoInteractions(aerRequestQueryService);
    }

    private EmpVariationRequestInfo createEmpVariationRequestInfo(String requestId, LocalDateTime endDate, Integer consolidationNumber) {
        return EmpVariationRequestInfo.builder()
                .id(requestId)
                .endDate(endDate)
                .metadata(EmpVariationRequestMetadata.builder().type(MrtmRequestMetadataType.EMP_VARIATION).empConsolidationNumber(consolidationNumber).build())
                .build();
    }

    private AerMonitoringPlanVersion createAerMonitoringPlanVersion(String empId, LocalDate approvalDate, Integer consolidationNumber) {
        return AerMonitoringPlanVersion.builder()
                .empId(empId)
                .empApprovalDate(approvalDate)
                .empConsolidationNumber(consolidationNumber)
                .build();
    }
}
