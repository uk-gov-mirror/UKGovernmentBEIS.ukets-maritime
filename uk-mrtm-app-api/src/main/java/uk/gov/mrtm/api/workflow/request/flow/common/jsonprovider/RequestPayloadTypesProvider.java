package uk.gov.mrtm.api.workflow.request.flow.common.jsonprovider;

import com.fasterxml.jackson.databind.jsontype.NamedType;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.flow.accountclosure.domain.AccountClosureRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpBatchReissueRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpReissueRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirRequestPayload;
import uk.gov.netz.api.common.config.jackson.JsonSubTypesProvider;

import java.util.List;

import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType.ACCOUNT_CLOSURE_REQUEST_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType.AER_REQUEST_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType.DOE_REQUEST_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType.EMP_BATCH_REISSUE_REQUEST_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType.EMP_ISSUANCE_REQUEST_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType.EMP_NOTIFICATION_REQUEST_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType.EMP_VARIATION_REQUEST_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType.EMP_REISSUE_REQUEST_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType.NON_COMPLIANCE_REQUEST_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType.SITE_VISIT_REQUEST_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType.VIR_REQUEST_PAYLOAD;

@Component
public class RequestPayloadTypesProvider implements JsonSubTypesProvider {

	@Override
	public List<NamedType> getTypes() {
		return List.of(
				new NamedType(AccountClosureRequestPayload.class, ACCOUNT_CLOSURE_REQUEST_PAYLOAD),
				//EMP_ISSUANCE
				new NamedType(EmpIssuanceRequestPayload.class, EMP_ISSUANCE_REQUEST_PAYLOAD),
				//EMP_NOTIFICATION
				new NamedType(EmpNotificationRequestPayload.class, EMP_NOTIFICATION_REQUEST_PAYLOAD),
				//EMP_VARIATION
				new NamedType(EmpVariationRequestPayload.class, EMP_VARIATION_REQUEST_PAYLOAD),
				//BATCH_REISSUE
				new NamedType(EmpReissueRequestPayload.class, EMP_REISSUE_REQUEST_PAYLOAD),
				new NamedType(EmpBatchReissueRequestPayload.class, EMP_BATCH_REISSUE_REQUEST_PAYLOAD),
				// AER
				new NamedType(AerRequestPayload.class, AER_REQUEST_PAYLOAD),
				//DOE
				new NamedType(DoeRequestPayload.class, DOE_REQUEST_PAYLOAD),
				//VIR
				new NamedType(VirRequestPayload.class, VIR_REQUEST_PAYLOAD),
				//NON_COMPLIANCE
				new NamedType(NonComplianceRequestPayload.class, NON_COMPLIANCE_REQUEST_PAYLOAD),
				//SITE_VISIT
				new NamedType(SiteVisitRequestPayload.class, SITE_VISIT_REQUEST_PAYLOAD)
				);
	}

}
