package uk.gov.mrtm.api.web.controller.workflow;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.gov.mrtm.api.integration.external.common.domain.ThirdPartyDataProviderStagingDetailsDTO;
import uk.gov.mrtm.api.integration.external.common.service.ThirdPartyProviderViewServiceDelegator;
import uk.gov.mrtm.api.web.constants.SwaggerApiInfo;
import uk.gov.mrtm.api.web.controller.exception.ErrorResponse;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.security.Authorized;
import uk.gov.netz.api.workflow.request.application.taskview.RequestTaskItemDTO;
import uk.gov.netz.api.workflow.request.application.taskview.RequestTaskViewService;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskActionProcessDTO;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandlerMapper;

import static uk.gov.mrtm.api.web.constants.SwaggerApiInfo.FORBIDDEN;
import static uk.gov.mrtm.api.web.constants.SwaggerApiInfo.INTERNAL_SERVER_ERROR;
import static uk.gov.mrtm.api.web.constants.SwaggerApiInfo.NOT_FOUND;
import static uk.gov.mrtm.api.web.constants.SwaggerApiInfo.OK;

@RestController
@RequestMapping(path = "/v1.0/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks")
@Log4j2
public class RequestTaskController {

    private final RequestTaskViewService requestTaskViewService;
    private final RequestTaskActionHandlerMapper requestTaskActionHandlerMapper;
    private final ThirdPartyProviderViewServiceDelegator thirdPartyProviderViewServiceDelegator;

    @GetMapping(path = "/{id}")
    @Operation(summary = "Get task item info by id")
    @ApiResponse(responseCode = "200", description = OK, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = RequestTaskItemDTO.class))})
    @ApiResponse(responseCode = "403", description = FORBIDDEN, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "429", description = SwaggerApiInfo.TOO_MANY_REQUESTS,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "500", description = INTERNAL_SERVER_ERROR, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @Authorized(resourceId = "#taskId")
    @Transactional
    public ResponseEntity<RequestTaskItemDTO> getTaskItemInfoById(@Parameter(hidden = true) AppUser appUser,
                                                                  @PathVariable("id") @Parameter(description = "The task id") Long taskId) {
        long startTime = System.nanoTime();
        final RequestTaskItemDTO taskItem = requestTaskViewService.getTaskItemInfo(taskId, appUser);
        long duration = (System.nanoTime() - startTime) / 1_000_000;
        log.info("Service execution time: {} ms", duration);
        return new ResponseEntity<>(taskItem, HttpStatus.OK);
    }

    @SuppressWarnings("unchecked")
    @PostMapping(path = "/actions")
    @Operation(summary = "Processes a request task action")
    @ApiResponse(responseCode = "200", description = OK, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = RequestTaskPayload.class))})
    @ApiResponse(responseCode = "204", description = SwaggerApiInfo.NO_CONTENT)
    @ApiResponse(responseCode = "400", description = SwaggerApiInfo.REQUEST_TASK_ACTION_BAD_REQUEST,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "403", description = FORBIDDEN,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "404", description = NOT_FOUND,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "429", description = SwaggerApiInfo.TOO_MANY_REQUESTS,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "500", description = INTERNAL_SERVER_ERROR,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @Authorized(resourceId = "#requestTaskActionProcessDTO.requestTaskId")
    public ResponseEntity<RequestTaskPayload> processRequestTaskAction(@Parameter(hidden = true) AppUser appUser,
                                                                       @RequestBody @Valid @Parameter(description = "The request task action body", required = true)
                                                                       RequestTaskActionProcessDTO requestTaskActionProcessDTO) {
        RequestTaskPayload taskPayload = requestTaskActionHandlerMapper.get(requestTaskActionProcessDTO.getRequestTaskActionType())
            .process(requestTaskActionProcessDTO.getRequestTaskId(),
                requestTaskActionProcessDTO.getRequestTaskActionType(),
                appUser,
                requestTaskActionProcessDTO.getRequestTaskActionPayload());

        return ObjectUtils.isEmpty(taskPayload) ? new ResponseEntity<>(HttpStatus.NO_CONTENT) : ResponseEntity.ok(taskPayload);
    }

    @GetMapping(path = "/{id}/third-party-data-provider-info")
    @Operation(summary = "Get third party provider data info by request id")
    @ApiResponse(responseCode = "200", description = OK, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ThirdPartyDataProviderStagingDetailsDTO.class))})
    @ApiResponse(responseCode = "403", description = FORBIDDEN, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "429", description = SwaggerApiInfo.TOO_MANY_REQUESTS,
            content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @ApiResponse(responseCode = "500", description = INTERNAL_SERVER_ERROR, content = {@Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class))})
    @Authorized(resourceId = "#taskId")
    public ResponseEntity<ThirdPartyDataProviderStagingDetailsDTO> getThirdPartyDataProviderInfoByRequestId(@PathVariable("id") @Parameter(description = "The task id") Long taskId) {
        final ThirdPartyDataProviderStagingDetailsDTO data = thirdPartyProviderViewServiceDelegator.getThirdPartyDataProviderInfo(taskId);
        return ObjectUtils.isEmpty(data) ? new ResponseEntity<>(HttpStatus.NO_CONTENT) : ResponseEntity.ok(data);
    }
}
