package uk.gov.mrtm.api.account.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.account.domain.AccountDetailsHistory;

import java.util.List;

public interface AccountDetailsHistoryRepository extends JpaRepository<AccountDetailsHistory, Long> {

    @Transactional(readOnly = true)
    List<AccountDetailsHistory> findByAccountIdOrderByCreationDateDesc(Long accountId);
}
