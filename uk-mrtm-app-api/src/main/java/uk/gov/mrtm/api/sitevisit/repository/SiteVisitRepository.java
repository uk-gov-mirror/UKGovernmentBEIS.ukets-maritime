package uk.gov.mrtm.api.sitevisit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitEntity;

@Repository
public interface SiteVisitRepository extends JpaRepository<SiteVisitEntity, String> {
}
