package uk.gov.mrtm.api.workflow.request.flow.common.jsonprovider;

import com.fasterxml.jackson.databind.jsontype.NamedType;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpBatchReissueRequestCreateActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestCreateActionPayload;
import uk.gov.netz.api.common.config.jackson.JsonSubTypesProvider;

import java.util.List;

import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestCreateActionPayloadType.EMP_BATCH_REISSUE_REQUEST_CREATE_ACTION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestCreateActionPayloadType.SITE_VISIT_REQUEST_CREATE_ACTION_PAYLOAD;

@Component
public class RequestCreateActionPayloadTypesProvider implements JsonSubTypesProvider {

	@Override
	public List<NamedType> getTypes() {
		return List.of(
			// EMP_BATCH_REISSUE
			new NamedType(EmpBatchReissueRequestCreateActionPayload.class, EMP_BATCH_REISSUE_REQUEST_CREATE_ACTION_PAYLOAD),
			// SITE_VISIT
			new NamedType(SiteVisitRequestCreateActionPayload.class, SITE_VISIT_REQUEST_CREATE_ACTION_PAYLOAD)
			);
	}

}
