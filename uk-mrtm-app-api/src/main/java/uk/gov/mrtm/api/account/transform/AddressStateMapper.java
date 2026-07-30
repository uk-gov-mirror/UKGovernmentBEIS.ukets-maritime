package uk.gov.mrtm.api.account.transform;

import org.mapstruct.Mapper;
import uk.gov.mrtm.api.common.domain.AddressState;
import uk.gov.mrtm.api.common.domain.dto.AddressStateDTO;
import uk.gov.netz.api.common.config.MapperConfig;


@Mapper(
        componentModel = "spring",
        config = MapperConfig.class
)
public interface AddressStateMapper {

    AddressStateDTO toAddressStateDTO(AddressState addressState);

    AddressState toAddressState(AddressStateDTO addressStateDTO);

}
