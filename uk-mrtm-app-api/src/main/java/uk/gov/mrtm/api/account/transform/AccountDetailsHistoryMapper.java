package uk.gov.mrtm.api.account.transform;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import uk.gov.mrtm.api.account.domain.AccountDetailsHistory;
import uk.gov.mrtm.api.account.domain.dto.AccountDetailsHistoryDTO;
import uk.gov.netz.api.common.config.MapperConfig;

@Mapper(componentModel = "spring", config = MapperConfig.class)
public interface AccountDetailsHistoryMapper {

    @Mapping(target = "changedBy", source = "submitterName")
    AccountDetailsHistoryDTO toAccountDetailsHistoryDTO(AccountDetailsHistory accountDetailsHistory);
}
