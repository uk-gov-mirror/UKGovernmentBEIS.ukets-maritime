package uk.gov.mrtm.api.workflow.request.flow.common.jsonprovider;

import com.fasterxml.jackson.databind.jsontype.NamedType;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestMetadataType;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpBatchReissueRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpReissueRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirRequestMetadata;
import uk.gov.netz.api.common.config.jackson.JsonSubTypesProvider;

import java.util.List;

@Component
public class RequestMetadataTypesProvider implements JsonSubTypesProvider {

	@Override
	public List<NamedType> getTypes() {
		return List.of(
			// EMP_NOTIFICATION
			new NamedType(EmpNotificationRequestMetadata.class, MrtmRequestMetadataType.EMP_NOTIFICATION),
			// EMP_VARIATION
			new NamedType(EmpVariationRequestMetadata.class, MrtmRequestMetadataType.EMP_VARIATION),

			//BATCH_REISSUE
			new NamedType(EmpReissueRequestMetadata.class, MrtmRequestMetadataType.EMP_REISSUE),
			new NamedType(EmpBatchReissueRequestMetadata.class, MrtmRequestMetadataType.EMP_BATCH_REISSUE),
			//AER
			new NamedType(AerRequestMetadata.class, MrtmRequestMetadataType.AER),
			//DOE
			new NamedType(DoeRequestMetadata.class, MrtmRequestMetadataType.DOE),
			//VIR
			new NamedType(VirRequestMetadata.class, MrtmRequestMetadataType.VIR),
			// SITE_VISIT
			new NamedType(SiteVisitRequestMetadata.class, MrtmRequestMetadataType.SITE_VISIT)

		);
	}

}
