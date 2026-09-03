package uk.gov.mrtm.api.account.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.account.domain.AccountDetailsHistory;
import uk.gov.mrtm.api.account.domain.dto.AccountDetailsHistoryListResponse;
import uk.gov.mrtm.api.account.domain.dto.AccountDetailsHistorySnapshot;
import uk.gov.mrtm.api.account.repository.AccountDetailsHistoryRepository;
import uk.gov.mrtm.api.account.transform.AccountDetailsHistoryMapper;
import uk.gov.netz.api.common.utils.DateService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class AccountDetailsHistoryQueryService {

    private final AccountDetailsHistoryRepository accountDetailsHistoryRepository;
    private final ObjectMapper objectMapper;
    private final AccountDetailsHistoryMapper accountDetailsHistoryMapper;
    private final DateService dateService;

    public void createAccountDetailsHistory(Long accountId,
                                            AccountDetailsHistorySnapshot previousValue,
                                            AccountDetailsHistorySnapshot newValue,
                                            String reason,
                                            String submitterName,
                                            String submitterId) {
        AccountDetailsHistory accountDetailsHistory =
            AccountDetailsHistory.builder()
                    .accountId(accountId)
                    .previousValue(objectMapper.valueToTree(previousValue))
                    .newValue(objectMapper.valueToTree(newValue))
                    .reason(reason)
                    .submitterName(submitterName)
                    .submitterId(submitterId)
                    .creationDate(dateService.getLocalDateTime())
                    .build();

        accountDetailsHistoryRepository.save(accountDetailsHistory);
    }

    public AccountDetailsHistoryListResponse getAccountDetailsHistory(Long accountId) {
        List<AccountDetailsHistory> accountDetailsHistoryList =
                accountDetailsHistoryRepository.findByAccountIdOrderByCreationDateDesc(accountId);

        return AccountDetailsHistoryListResponse.builder()
                .accountDetailsHistoryList(accountDetailsHistoryList.stream()
                        .map(accountDetailsHistoryMapper::toAccountDetailsHistoryDTO)
                        .toList())
                .build();
    }
}
