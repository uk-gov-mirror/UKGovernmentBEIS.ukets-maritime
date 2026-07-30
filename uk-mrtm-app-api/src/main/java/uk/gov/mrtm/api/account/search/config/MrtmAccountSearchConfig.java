package uk.gov.mrtm.api.account.search.config;

import jakarta.persistence.EntityManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.search.domain.dto.MrtmAccountSearchResultInfoDTO;
import uk.gov.mrtm.api.account.search.mapper.MrtmAccountSearchCriteriaMapper;
import uk.gov.mrtm.api.account.search.paths.MrtmAccountSearchEntityPaths;
import uk.gov.mrtm.api.account.search.query.MrtmAccountSearchProjectionMapper;
import uk.gov.mrtm.api.account.search.query.MrtmAccountSearchResultRowMapper;
import uk.gov.mrtm.api.account.search.query.MrtmAccountSearchSortMapper;
import uk.gov.netz.api.account.search.query.AccountSearchQueryRepository;
import uk.gov.netz.api.account.search.query.AccountSearchQueryRepositoryImpl;
import uk.gov.netz.api.account.search.service.AccountSearchQueryService;
import uk.gov.netz.api.account.search.service.AccountSearchQueryServiceImpl;
import uk.gov.netz.api.authorization.rules.services.authorization.verifier.VerifierAccountAccessService;

/** Spring wiring for enhanced MRTM account search. */
@Configuration(proxyBeanMethods = false)
public class MrtmAccountSearchConfig {

    @Bean
    MrtmAccountSearchCriteriaMapper mrtmAccountSearchCriteriaMapper() {
        return new MrtmAccountSearchCriteriaMapper();
    }

    @Bean
    MrtmAccountSearchEntityPaths mrtmAccountSearchEntityPaths() {
        return new MrtmAccountSearchEntityPaths();
    }

    @Bean
    MrtmAccountSearchSortMapper mrtmAccountSearchSortMapper() {
        return new MrtmAccountSearchSortMapper();
    }

    @Bean
    MrtmAccountSearchProjectionMapper mrtmAccountSearchProjectionMapper() {
        return new MrtmAccountSearchProjectionMapper();
    }

    @Bean
    MrtmAccountSearchResultRowMapper mrtmAccountSearchResultRowMapper() {
        return new MrtmAccountSearchResultRowMapper();
    }

    @Bean
    AccountSearchQueryRepository<MrtmAccount, MrtmAccountSearchResultInfoDTO> mrtmAccountSearchQueryRepository(
            EntityManager entityManager,
            MrtmAccountSearchSortMapper mrtmAccountSearchSortMapper,
            MrtmAccountSearchProjectionMapper mrtmAccountSearchProjectionMapper,
            MrtmAccountSearchResultRowMapper mrtmAccountSearchResultRowMapper) {
        return new AccountSearchQueryRepositoryImpl<>(
                entityManager,
                mrtmAccountSearchSortMapper,
                mrtmAccountSearchProjectionMapper,
                mrtmAccountSearchResultRowMapper);
    }

    @Bean
    AccountSearchQueryService<MrtmAccount, MrtmAccountSearchResultInfoDTO> mrtmAccountSearchQueryService(
            AccountSearchQueryRepository<MrtmAccount, MrtmAccountSearchResultInfoDTO> mrtmAccountSearchQueryRepository,
            MrtmAccountSearchEntityPaths mrtmAccountSearchEntityPaths,
            VerifierAccountAccessService verifierAccountAccessService,
            MrtmAccountSearchResultRowMapper mrtmAccountSearchResultRowMapper) {
        return new AccountSearchQueryServiceImpl<>(
                mrtmAccountSearchQueryRepository,
                mrtmAccountSearchEntityPaths,
                verifierAccountAccessService,
                mrtmAccountSearchResultRowMapper);
    }
}
