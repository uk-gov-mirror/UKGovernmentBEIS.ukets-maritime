package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.service;

import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.netz.api.workflow.request.core.repository.RequestSequenceRepository;
import uk.gov.netz.api.workflow.request.core.repository.RequestTypeRepository;
import uk.gov.netz.api.workflow.request.flow.common.service.ReportingRequestSequenceRequestIdGenerator;

import java.util.List;

@Service
public class SiteVisitRequestIdGenerator extends ReportingRequestSequenceRequestIdGenerator {
    protected SiteVisitRequestIdGenerator(RequestSequenceRepository repository, RequestTypeRepository requestTypeRepository) {
        super(repository, requestTypeRepository);
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestType.SITE_VISIT);
    }

    @Override
    public String getPrefix() {
        return "MASV";
    }
}
