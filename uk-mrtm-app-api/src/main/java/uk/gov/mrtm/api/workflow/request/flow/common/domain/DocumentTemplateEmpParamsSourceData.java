package uk.gov.mrtm.api.workflow.request.flow.common.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestInfo;
import uk.gov.netz.api.workflow.request.core.domain.Request;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTemplateEmpParamsSourceData {

    private Request request;
    private String signatory;
    private EmissionsMonitoringPlanContainer empContainer;
    private int consolidationNumber;
    private List<EmpVariationRequestInfo> variationRequestInfoList;
    private LocalDateTime empSubmissionDate;
    private LocalDateTime empEndDate;
    
    private MrtmDocumentTemplateAccountData accountData;
}
