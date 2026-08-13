package uk.gov.mrtm.api.web.util;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.web.multipart.MultipartFile;
import uk.gov.netz.api.common.config.MapperConfig;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.files.common.utils.MimeTypeUtils;

import java.io.IOException;

@Mapper(componentModel = "spring", config = MapperConfig.class)
public interface FileDtoMapper {

    default FileDTO toFileDTO(MultipartFile file, String createdBy) throws IOException {
        if (file == null) {
            return null;
        }
        return toFileDTOMapping(file, createdBy);
    }

    @Mapping(target = "fileName", source = "file.originalFilename")
    @Mapping(target = "fileSize", source = "file.size")
    @Mapping(target = "fileContent", source = "file.bytes")
    @Mapping(target = "fileType", ignore = true)
    @Mapping(target = "createdBy", source = "createdBy")
    FileDTO toFileDTOMapping(MultipartFile file, String createdBy) throws IOException;

    @AfterMapping
    default void setFileType(@MappingTarget FileDTO fileDTO, MultipartFile file) throws IOException {
        if (fileDTO != null && file != null) {
            fileDTO.setFileType(MimeTypeUtils.detect(file.getBytes(), file.getOriginalFilename()));
        }
    }
}
