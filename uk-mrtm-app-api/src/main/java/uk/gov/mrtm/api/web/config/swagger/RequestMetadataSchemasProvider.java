package uk.gov.mrtm.api.web.config.swagger;

import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestMetadata;
import uk.gov.netz.api.swagger.SwaggerSchemasAbstractProvider;

@Component
public class RequestMetadataSchemasProvider extends SwaggerSchemasAbstractProvider {

    @Override
    public void afterPropertiesSet() {
        //project specific
        //EMP_ISSUANCE
        addResolvedShemas(EmpNotificationRequestMetadata.class.getSimpleName(),
                EmpNotificationRequestMetadata.class);

        //EMP_VARIATION
        addResolvedShemas(EmpVariationRequestMetadata.class.getSimpleName(),
            EmpVariationRequestMetadata.class);

        //AER
        addResolvedShemas(AerRequestMetadata.class.getSimpleName(),
            AerRequestMetadata.class);

        //DOE
        addResolvedShemas(DoeRequestMetadata.class.getSimpleName(),
                DoeRequestMetadata.class);

        //SITE_VISIT
        addResolvedShemas(SiteVisitRequestMetadata.class.getSimpleName(),
            SiteVisitRequestMetadata.class);
    }

}