package uk.gov.mrtm.api.account.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.AccountDetailsHistory;
import uk.gov.mrtm.api.account.domain.dto.AccountDetailsHistoryDTO;
import uk.gov.mrtm.api.account.domain.dto.AccountDetailsHistoryListResponse;
import uk.gov.mrtm.api.account.domain.dto.AccountDetailsHistorySnapshot;
import uk.gov.mrtm.api.account.repository.AccountDetailsHistoryRepository;
import uk.gov.mrtm.api.account.transform.AccountDetailsHistoryMapper;
import uk.gov.netz.api.common.utils.DateService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountDetailsHistoryQueryServiceTest {

    @InjectMocks
    private AccountDetailsHistoryQueryService service;

    @Mock
    private AccountDetailsHistoryRepository repository;

    @Mock
    private AccountDetailsHistoryMapper accountDetailsHistoryMapper;

    @Mock
    private DateService dateService;

    @Mock
    private ObjectMapper objectMapper;

    @Test
    void createAccountDetailsHistory_shouldSaveFullSnapshots() {
        Long accountId = 1L;
        String reason = "Corrected company data";
        String submitterName = "Jane Regulator";
        String submitterId = UUID.randomUUID().toString();
        LocalDateTime date = LocalDateTime.now();

        AccountDetailsHistorySnapshot previousValue = mock(AccountDetailsHistorySnapshot.class);
        AccountDetailsHistorySnapshot newValue = mock(AccountDetailsHistorySnapshot.class);
        JsonNode previousValueJson = mock(JsonNode.class);
        JsonNode newValueJson = mock(JsonNode.class);

        when(objectMapper.valueToTree(previousValue)).thenReturn(previousValueJson);
        when(objectMapper.valueToTree(newValue)).thenReturn(newValueJson);
        when(dateService.getLocalDateTime()).thenReturn(date);


        AccountDetailsHistory expected =  AccountDetailsHistory.builder()
            .accountId(accountId)
            .previousValue(previousValueJson)
            .newValue(newValueJson)
            .reason(reason)
            .submitterName(submitterName)
            .submitterId(submitterId)
            .creationDate(date)
            .build();

        service.createAccountDetailsHistory(accountId, previousValue, newValue, reason, submitterName, submitterId);

        ArgumentCaptor<AccountDetailsHistory> historyCaptor = ArgumentCaptor.forClass(AccountDetailsHistory.class);
        verify(dateService).getLocalDateTime();
        verify(repository).save(historyCaptor.capture());

        verifyNoMoreInteractions(repository, dateService);
        verifyNoMoreInteractions(accountDetailsHistoryMapper);

        AccountDetailsHistory actual = historyCaptor.getValue();
        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void getAccountDetailsHistory_shouldReturnListResponse() {
        Long accountId = 1L;

        AccountDetailsHistory historyEntry = AccountDetailsHistory.builder()
                .accountId(accountId)
                .reason("some reason")
                .build();

        AccountDetailsHistoryDTO historyDTO = AccountDetailsHistoryDTO.builder()
                .reason("some reason")
                .build();

        when(repository.findByAccountIdOrderByCreationDateDesc(accountId))
                .thenReturn(List.of(historyEntry));
        when(accountDetailsHistoryMapper.toAccountDetailsHistoryDTO(historyEntry))
                .thenReturn(historyDTO);

        AccountDetailsHistoryListResponse result = service.getAccountDetailsHistory(accountId);

        assertThat(result.getAccountDetailsHistoryList()).containsExactly(historyDTO);
    }
}
