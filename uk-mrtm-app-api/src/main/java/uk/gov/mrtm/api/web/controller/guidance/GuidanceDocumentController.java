package uk.gov.mrtm.api.web.controller.guidance;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import uk.gov.mrtm.api.web.constants.SwaggerApiInfo;
import uk.gov.mrtm.api.web.controller.exception.ErrorResponse;
import uk.gov.mrtm.api.web.util.FileDtoMapper;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.files.common.domain.dto.FileUuidDTO;
import uk.gov.netz.api.guidance.documents.domain.dto.GuidanceDocumentDTO;
import uk.gov.netz.api.guidance.documents.domain.dto.SaveGuidanceDocumentDTO;
import uk.gov.netz.api.guidance.documents.service.GuidanceDocumentService;
import uk.gov.netz.api.guidance.fileguidance.service.FileGuidanceService;
import uk.gov.netz.api.security.Authorized;
import uk.gov.netz.api.token.FileToken;

import java.io.IOException;
import java.util.UUID;

import static uk.gov.mrtm.api.web.constants.SwaggerApiInfo.BAD_REQUEST;
import static uk.gov.mrtm.api.web.constants.SwaggerApiInfo.CREATED;
import static uk.gov.mrtm.api.web.constants.SwaggerApiInfo.FORBIDDEN;
import static uk.gov.mrtm.api.web.constants.SwaggerApiInfo.INTERNAL_SERVER_ERROR;
import static uk.gov.mrtm.api.web.constants.SwaggerApiInfo.NOT_FOUND;
import static uk.gov.mrtm.api.web.constants.SwaggerApiInfo.OK;

@Validated
@RestController
@RequestMapping(path = "/v1.0/guidance-sections/{sectionId}/documents")
@RequiredArgsConstructor
@Tag(name = "Guidance documents")
public class GuidanceDocumentController {

    private final GuidanceDocumentService guidanceDocumentService;
    private final FileDtoMapper fileDtoMapper = Mappers.getMapper(FileDtoMapper.class);
    private final FileGuidanceService fileGuidanceService;

    @GetMapping(path = "/{id}")
    @Operation(summary = "Get a guidance document")
    @ApiResponse(responseCode = "200", description = OK, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = GuidanceDocumentDTO.class))})
    @ApiResponse(responseCode = "403", description = FORBIDDEN, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "404", description = NOT_FOUND, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "429", description = SwaggerApiInfo.TOO_MANY_REQUESTS,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "500", description = INTERNAL_SERVER_ERROR, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @Authorized(resourceId = "#id")
    public ResponseEntity<GuidanceDocumentDTO> getGuidanceDocumentById(@PathVariable("id") @Parameter(description = "The guidance document id", required = true) Long id,
                                                                       @PathVariable("sectionId") @Parameter(description = "The guidance section id", required = true) Long sectionId) {
        final GuidanceDocumentDTO guidanceDocument = guidanceDocumentService.getGuidanceDocumentById(id, sectionId);
        return new ResponseEntity<>(guidanceDocument, HttpStatus.OK);
    }

    @PostMapping
    @Operation(summary = "Creates a new guidance document")
    @ApiResponse(responseCode = "201", description = CREATED)
    @ApiResponse(responseCode = "400", description = BAD_REQUEST, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "403", description = FORBIDDEN, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "429", description = SwaggerApiInfo.TOO_MANY_REQUESTS,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "500", description = INTERNAL_SERVER_ERROR, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @Authorized(resourceId = "#sectionId")
    public ResponseEntity<Long> createGuidanceDocument(@Parameter(hidden = true) AppUser authUser,
                                                       @PathVariable("sectionId") @Parameter(description = "The guidance section id", required = true) Long sectionId,
                                                       @RequestBody
                                                       @Valid
                                                       @Parameter(description = "The guidance document request", required = true)
                                                       SaveGuidanceDocumentDTO guidanceDocumentDTO) {

        final Long guidanceDocumentId = guidanceDocumentService.createGuidanceDocument(authUser, sectionId, guidanceDocumentDTO);
        return new ResponseEntity<>(guidanceDocumentId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a guidance document")
    @ApiResponse(responseCode = "200", description = OK)
    @ApiResponse(responseCode = "400", description = BAD_REQUEST, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "403", description = FORBIDDEN, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "404", description = NOT_FOUND, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "429", description = SwaggerApiInfo.TOO_MANY_REQUESTS,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "500", description = INTERNAL_SERVER_ERROR, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @Authorized(resourceId = "#id")
    public ResponseEntity<GuidanceDocumentDTO> updateGuidanceDocument(
            @Parameter(hidden = true) AppUser authUser,
            @PathVariable("id") @Parameter(description = "The guidance document id", required = true) Long id,
            @PathVariable("sectionId") @Parameter(description = "The guidance section id", required = true) Long sectionId,
            @RequestBody @Valid @Parameter(description = "The guidance document request", required = true) SaveGuidanceDocumentDTO guidanceDocumentDTO) {

        final GuidanceDocumentDTO updatedGuidanceDocument = guidanceDocumentService.updateGuidanceDocument(id, sectionId, guidanceDocumentDTO, authUser);
        return new ResponseEntity<>(updatedGuidanceDocument, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a guidance document")
    @ApiResponse(responseCode = "200", description = OK)
    @ApiResponse(responseCode = "403", description = FORBIDDEN, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "404", description = NOT_FOUND, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "429", description = SwaggerApiInfo.TOO_MANY_REQUESTS,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "500", description = INTERNAL_SERVER_ERROR, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @Authorized(resourceId = "#id")
    public ResponseEntity<Void> deleteGuidanceDocument(@PathVariable("id") @Parameter(description = "The guidance document id", required = true) Long id,
                                                       @PathVariable("sectionId") @Parameter(description = "The guidance section id", required = true) Long sectionId) {
        guidanceDocumentService.deleteGuidanceDocument(id, sectionId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping(path = "/upload", consumes = {"multipart/form-data"})
    @Operation(summary = "Upload a guidance file")
    @ApiResponse(responseCode = "200", description = OK, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = FileUuidDTO.class))})
    @ApiResponse(responseCode = "403", description = FORBIDDEN, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "404", description = NOT_FOUND, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "429", description = SwaggerApiInfo.TOO_MANY_REQUESTS,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "500", description = INTERNAL_SERVER_ERROR, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @Authorized(resourceId = "#sectionId")
    public ResponseEntity<FileUuidDTO> uploadGuidanceFile(
            @Parameter(hidden = true) AppUser authUser,
            @PathVariable("sectionId") @Parameter(description = "The guidance section id", required = true) Long sectionId,
            @RequestPart("file") @Parameter(description = "The guidance file", required = true)
            MultipartFile file) throws IOException {

        final FileDTO fileDTO = fileDtoMapper.toFileDTO(file, authUser.getUserId());
        final FileUuidDTO fileUuidDTO = fileGuidanceService.uploadFile(authUser.getUserId(), fileDTO, sectionId);

        return new ResponseEntity<>(fileUuidDTO, HttpStatus.OK);
    }

    @GetMapping(path = "/files")
    @Operation(summary = "Generate the token to get the file that belongs to the provided guidance file")
    @ApiResponse(responseCode = "200", description = OK, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = FileToken.class))})
    @ApiResponse(responseCode = "403", description = FORBIDDEN, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "404", description = NOT_FOUND, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "429", description = SwaggerApiInfo.TOO_MANY_REQUESTS,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "500", description = INTERNAL_SERVER_ERROR, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @Authorized(resourceId = "#sectionId")
    public ResponseEntity<FileToken> generateGetGuidanceFileToken(
            @PathVariable("sectionId") @Parameter(description = "The guidance section id", required = true) @NotNull Long sectionId,
            @RequestParam("uuid") @Parameter(description = "The guidance file uuid") @NotNull UUID fileUuid) {

        final FileToken fileToken = guidanceDocumentService.generateGetGuidanceDocumentToken(fileUuid, sectionId);
        return new ResponseEntity<>(fileToken, HttpStatus.OK);
    }

}
