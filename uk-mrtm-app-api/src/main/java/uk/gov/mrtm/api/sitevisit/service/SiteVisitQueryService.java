package uk.gov.mrtm.api.sitevisit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitEntity;
import uk.gov.mrtm.api.sitevisit.repository.SiteVisitRepository;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitValidatorService;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class SiteVisitQueryService {

    private final SiteVisitRepository siteVisitRepository;
    private final SiteVisitValidatorService validatorService;

    @Transactional
    public void submitSiteVisit(Long accountId, SiteVisitContainer siteVisitContainer, Year year, String id) {
        validatorService.validateSiteVisit(siteVisitContainer);

        SiteVisitEntity empEntity = SiteVisitEntity.builder()
            .id(id)
            .accountId(accountId)
            .siteVisitContainer(siteVisitContainer)
            .year(year)
            .build();

        siteVisitRepository.save(empEntity);
    }
}
