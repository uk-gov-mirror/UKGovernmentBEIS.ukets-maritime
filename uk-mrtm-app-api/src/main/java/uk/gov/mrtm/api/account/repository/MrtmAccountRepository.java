package uk.gov.mrtm.api.account.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.account.domain.dto.MrtmAccountIdAndNameDTO;
import uk.gov.mrtm.api.account.domain.dto.MrtmAccountInfoDTO;
import uk.gov.netz.api.account.repository.AccountBaseRepository;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface MrtmAccountRepository extends AccountBaseRepository<MrtmAccount> {

    @Query(nativeQuery = true, value = "SELECT NEXTVAL('account_mrtm_seq')")
    Long generateId();

    @Transactional(readOnly = true)
    boolean existsByImoNumber(String imoNumber);

    @Transactional(readOnly = true)
    List<MrtmAccount> findAllByStatusIn(List<MrtmAccountStatus> accountStatuses);

    @Transactional(readOnly = true)
    @Query(name = MrtmAccount.NAMED_QUERY_FIND_BY_IMO_NUMBER)
    Optional<MrtmAccount> findByImoNumber(String imoNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select acc from account_mrtm acc where acc.imoNumber = :imoNumber")
    Optional<MrtmAccount> findByImoNumberForUpdate(String imoNumber);

    @Transactional(readOnly = true)
    @Query(name = MrtmAccount.NAMED_QUERY_FIND_ACCOUNT_ID_BY_IMO_NUMBER)
    Optional<Long> findAccountIdByImoNumber(String imoNumber);

    @Transactional(readOnly = true)
    @Query(name = MrtmAccount.NAMED_QUERY_FIND_VERIFICATION_BODY_ID_BY_IMO_NUMBER)
    Optional<Long> findVerificationBodyIdByImoNumber(String imoNumber);

    @Transactional(readOnly = true)
    @Query(name = MrtmAccount.NAMED_QUERY_FIND_BY_USER_ID)
    List<MrtmAccount> findByUserId(String userId);

    @Transactional(readOnly = true)
    MrtmAccount findByBusinessId(String businessId);

    @Transactional(readOnly = true)
    Optional<MrtmAccount> findByRegistryId(Integer registryId);

    @Transactional(readOnly = true)
    boolean existsByNameIgnoreCaseAndCompetentAuthorityAndIdNot(String name, CompetentAuthorityEnum ca, Long accountId);

    @Transactional(readOnly = true)
    boolean existsByNameIgnoreCaseAndCompetentAuthority(String name, CompetentAuthorityEnum ca);

    @Transactional(readOnly = true)
    boolean existsByImoNumberAndId(String imoNumber, Long accountId);

    @Transactional(readOnly = true)
    @Query(value = "select acc.id as accountId, acc.name as accountName "
            + "from account acc "
            + "inner join account_mrtm acc_mrtm on acc_mrtm.id = acc.id "
            + "where acc.competent_authority = :#{#competentAuthority.name()} "
            + "and (:#{#statuses.size() == 0} = true or acc_mrtm.status in :#{#statuses.![name()]}) ", nativeQuery = true)
    Set<MrtmAccountIdAndNameDTO> findAllByCAAndStatusesAndEmissionTradingSchemes(
            CompetentAuthorityEnum competentAuthority, Set<MrtmAccountStatus> statuses);

    @Transactional(readOnly = true)
    @Query(value = "select acc.id as id, acc.name as name, acc.business_id as businessId "
        + "from account acc "
        + "where acc.competent_authority = :#{#competentAuthority.name()}", nativeQuery = true)
    List<MrtmAccountInfoDTO> findAllByCA(CompetentAuthorityEnum competentAuthority);

    @Transactional(readOnly = true)
    @Query(value = "select acc.id as id, acc.name as name, acc.business_id as businessId "
        + "from account acc "
        + "where acc.id in :#{#accountIds}", nativeQuery = true)
    List<MrtmAccountInfoDTO> findAllByAccountIdIn(Set<Long> accountIds);
}
