package uk.gov.mrtm.api.workflow.request.flow.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.DocumentTemplateEmpParamsSourceData;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.referencedata.domain.Country;
import uk.gov.netz.api.referencedata.service.CountryService;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateCommonParamsProvider;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DocumentTemplateEmpParamsProvider {

    private final DocumentTemplateCommonParamsProvider<MrtmDocumentTemplateAccountData> commonParamsProvider;
    private final CountryService countryService;

	public TemplateParams constructTemplateParams(final DocumentTemplateEmpParamsSourceData sourceData) {
		final TemplateParams templateParams = commonParamsProvider.constructCommonTemplateParams(
				sourceData.getRequest(), sourceData.getSignatory(), sourceData.getAccountData());

        final EmissionsMonitoringPlanContainer empContainer = sourceData.getEmpContainer();

        Map<String, Object> params = new HashMap<>();
        params.put("empContainer", empContainer);
        params.put("consolidationNumber", sourceData.getConsolidationNumber());
        params.put("variationRequestInfoList", sourceData.getVariationRequestInfoList());
        params.put("empSubmissionDate", sourceData.getEmpSubmissionDate());
        params.put("empEndDate", sourceData.getEmpEndDate());
        params.put("contactCountry",
                getCountryName(empContainer.getEmissionsMonitoringPlan().getOperatorDetails().getContactAddress().getCountry())
        );
        params.put("registeredCountry",
                getCountryName(empContainer.getEmissionsMonitoringPlan().getOperatorDetails().getOrganisationStructure().getRegisteredAddress().getCountry())
        );

        return templateParams.withParams(params);
    }

    private String getCountryName(String code) {
        return countryService.getReferenceData().stream()
                .filter(country -> code.equals(country.getCode()))
                .map(Country::getName)
                .findFirst().orElse("");
    }
}
