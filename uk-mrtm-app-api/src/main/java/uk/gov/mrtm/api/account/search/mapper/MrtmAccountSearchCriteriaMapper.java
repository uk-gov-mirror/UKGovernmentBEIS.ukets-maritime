package uk.gov.mrtm.api.account.search.mapper;

import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;
import uk.gov.mrtm.api.account.domain.MrtmAccountStatus;
import uk.gov.mrtm.api.account.search.criteria.MrtmAccountSearchSortField;
import uk.gov.mrtm.api.account.search.domain.dto.MrtmAccountSearchCriteria;
import uk.gov.netz.api.account.search.criteria.AccountSearchCommonSortField;
import uk.gov.netz.api.account.search.criteria.AccountSearchFilterCriteria;
import uk.gov.netz.api.account.search.criteria.AccountSearchSortField;
import uk.gov.netz.api.common.domain.PagingRequest;

import java.util.Set;

/** Maps controller request params to generic {@link AccountSearchFilterCriteria}. */
public class MrtmAccountSearchCriteriaMapper {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_PAGE_SIZE = 20;

    /** Matches AC default: operator name A→Z via {@link AccountSearchCommonSortField#OPERATOR_NAME}. */
    private static final AccountSearchSortField DEFAULT_SORT_FIELD = AccountSearchCommonSortField.OPERATOR_NAME;

    public AccountSearchFilterCriteria toFilterCriteria(MrtmAccountSearchCriteria searchCriteria) {
        return mapToFilterCriteria(
                searchCriteria.getTerm(),
                PagingRequest.builder()
                        .pageNumber(searchCriteria.getPage() != null ? searchCriteria.getPage() : DEFAULT_PAGE)
                        .pageSize(searchCriteria.getSize() != null ? searchCriteria.getSize() : DEFAULT_PAGE_SIZE)
                        .build(),
                searchCriteria.getStatuses(),
                searchCriteria.getContactEmail(),
                searchCriteria.getSortBy(),
                searchCriteria.getDirection());
    }

    private AccountSearchFilterCriteria mapToFilterCriteria(
            String term,
            PagingRequest paging,
            Set<MrtmAccountStatus> statuses,
            String contactEmail,
            String sortBy,
            Sort.Direction direction) {
        return AccountSearchFilterCriteria.builder()
                .term(term)
                .paging(paging)
                .statuses(statuses)
                .contactEmail(contactEmail)
                .sortField(mapSortBy(sortBy))
                .sortDirection(direction != null ? direction : Sort.Direction.ASC)
                .build();
    }

    private AccountSearchSortField mapSortBy(String sortBy) {
        if (!StringUtils.hasText(sortBy)) {
            return DEFAULT_SORT_FIELD;
        }
        return switch (sortBy.trim()) {
            case "OPERATOR_NAME" -> AccountSearchCommonSortField.OPERATOR_NAME;
            case "ACCOUNT_ID" -> AccountSearchCommonSortField.ACCOUNT_ID;
            case "STATUS" -> AccountSearchCommonSortField.STATUS;
            case "IMO_NUMBER" -> MrtmAccountSearchSortField.IMO_NUMBER;
            default -> throw new IllegalArgumentException("Sort field not supported: " + sortBy);
        };
    }
}
