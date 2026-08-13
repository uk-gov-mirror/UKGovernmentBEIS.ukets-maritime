package uk.gov.mrtm.api.workflow.request.flow.aer.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanEntity;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerMonitoringPlanVersion;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationRequestQueryService;

import java.time.Year;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AerBuildMonitoringPlanVersionsService {

    private final EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;
    private final EmpVariationRequestQueryService empVariationRequestQueryService;
    private final AerRequestQueryService aerRequestQueryService;

    public Optional<AerMonitoringPlanVersion> build(Long accountId, Year reportingYear) {
        final Optional<String> empIdOptional = emissionsMonitoringPlanQueryService.getEmpIdByAccountId(accountId);

        if (empIdOptional.isEmpty()) {
            return Optional.empty();
        }

        final String empId = empIdOptional.get();
        final List<AerMonitoringPlanVersion> monitoringPlanVersions = new ArrayList<>(findMonitoringPlanVersionsForVariation(accountId, empId));

        final List<AerMonitoringPlanVersion> monitoringPlanVersionsToIncludeInAer = monitoringPlanVersions.stream()
                .filter(monitoringPlanVersion -> isMonitoringPlanCompletedDuringReportingYear(reportingYear, monitoringPlanVersion))
                .collect(Collectors.toList());
        if (monitoringPlanVersionsToIncludeInAer.isEmpty()) {
            findMonitoringPlanVersionForIssuance(accountId, empId).ifPresent(monitoringPlanVersionsToIncludeInAer::add);
        }

        return monitoringPlanVersionsToIncludeInAer.stream()
                .max(Comparator.comparing(AerMonitoringPlanVersion::getEmpApprovalDate));
    }

    private List<AerMonitoringPlanVersion> findMonitoringPlanVersionsForVariation(Long accountId, String empId) {
        return empVariationRequestQueryService.findEmpVariationRequests(accountId).stream()
                .filter(empVariationRequestInfo -> empVariationRequestInfo.getEndDate() != null)
                .map(empVariationRequestInfo -> AerMonitoringPlanVersion.builder()
                        .empId(empId)
                        .empApprovalDate(empVariationRequestInfo.getEndDate().toLocalDate())
                        .empConsolidationNumber(empVariationRequestInfo.getMetadata().getEmpConsolidationNumber())
                        .build())
                .collect(Collectors.toList());
    }

    private Optional<AerMonitoringPlanVersion> findMonitoringPlanVersionForIssuance(Long accountId, String empId) {
        return aerRequestQueryService.findEndDateOfApprovedEmpIssuanceByAccountId(accountId, MrtmRequestType.EMP_ISSUANCE)
                .map(localDateTime -> AerMonitoringPlanVersion.builder()
                        .empId(empId)
                        .empApprovalDate(localDateTime.toLocalDate())
                        .empConsolidationNumber(EmissionsMonitoringPlanEntity.CONSOLIDATION_NUMBER_DEFAULT_VALUE)
                        .build());
    }

    private boolean isMonitoringPlanCompletedDuringReportingYear(Year reportingYear, AerMonitoringPlanVersion monitoringPlanVersion) {
        return Year.of(monitoringPlanVersion.getEmpApprovalDate().getYear()).equals(reportingYear);
    }
}
