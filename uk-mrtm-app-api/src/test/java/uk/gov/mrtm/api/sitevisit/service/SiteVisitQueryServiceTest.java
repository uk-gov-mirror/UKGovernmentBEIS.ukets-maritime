package uk.gov.mrtm.api.sitevisit.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitEntity;
import uk.gov.mrtm.api.sitevisit.repository.SiteVisitRepository;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitValidatorService;

import java.time.Year;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

@ExtendWith(MockitoExtension.class)
class SiteVisitQueryServiceTest {

    @InjectMocks
    private SiteVisitQueryService service;

    @Mock
    private SiteVisitRepository siteVisitRepository;

    @Mock
    private SiteVisitValidatorService validatorService;

    @Test
    void submitSiteVisit() {
        Long accountId = 1L;
        SiteVisitContainer siteVisitContainer = mock(SiteVisitContainer.class);
        Year year = Year.now();
        String id = "MASV01-1";
        SiteVisitEntity empEntity = SiteVisitEntity.builder()
            .id(id)
            .accountId(accountId)
            .siteVisitContainer(siteVisitContainer)
            .year(year)
            .build();

        service.submitSiteVisit(accountId, siteVisitContainer, year, id);

        verify(siteVisitRepository).save(empEntity);
        verify(validatorService).validateSiteVisit(siteVisitContainer);
        verifyNoMoreInteractions(validatorService, siteVisitRepository);
    }
}