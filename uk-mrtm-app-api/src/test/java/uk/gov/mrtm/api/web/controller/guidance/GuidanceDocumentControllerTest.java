package uk.gov.mrtm.api.web.controller.guidance;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.aop.framework.AopProxy;
import org.springframework.aop.framework.DefaultAopProxyFactory;
import org.springframework.format.support.FormattingConversionService;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import uk.gov.mrtm.api.web.config.AppUserArgumentResolver;
import uk.gov.mrtm.api.web.controller.exception.ExceptionControllerAdvice;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.authorization.rules.services.AppUserAuthorizationService;
import uk.gov.netz.api.authorization.rules.services.RoleAuthorizationService;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.files.common.domain.dto.FileNameAndUuid;
import uk.gov.netz.api.files.common.domain.dto.FileUuidDTO;
import uk.gov.netz.api.guidance.documents.domain.dto.GuidanceDocumentDTO;
import uk.gov.netz.api.guidance.documents.domain.dto.SaveGuidanceDocumentDTO;
import uk.gov.netz.api.guidance.documents.service.GuidanceDocumentService;
import uk.gov.netz.api.guidance.fileguidance.service.FileGuidanceService;
import uk.gov.netz.api.security.AppSecurityComponent;
import uk.gov.netz.api.security.AuthorizationAspectUserResolver;
import uk.gov.netz.api.security.AuthorizedAspect;
import uk.gov.netz.api.security.AuthorizedRoleAspect;
import uk.gov.netz.api.token.FileToken;

import java.util.UUID;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GuidanceDocumentControllerTest {

    private static final String SECTIONS_CONTROLLER_PATH = "/v1.0/guidance-sections/";
    private static final String DOCUMENTS_CONTROLLER_PATH = "/documents";
    private static final long SECTION_ID = 1L;

    @InjectMocks
    private GuidanceDocumentController controller;

    @Mock
    private GuidanceDocumentService guidanceDocumentService;

    @Mock
    private FileGuidanceService fileGuidanceService;

    @Mock
    private AppSecurityComponent appSecurityComponent;

    @Mock
    private AppUserAuthorizationService appUserAuthorizationService;

    @Mock
    private RoleAuthorizationService roleAuthorizationService;


    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {

        AuthorizationAspectUserResolver authorizationAspectUserResolver = new AuthorizationAspectUserResolver(appSecurityComponent);
        AuthorizedAspect aspect = new AuthorizedAspect(appUserAuthorizationService, authorizationAspectUserResolver);
        AuthorizedRoleAspect authorizedRoleAspect = new AuthorizedRoleAspect(roleAuthorizationService, authorizationAspectUserResolver);

        AspectJProxyFactory aspectJProxyFactory = new AspectJProxyFactory(controller);
        aspectJProxyFactory.addAspect(aspect);
        aspectJProxyFactory.addAspect(authorizedRoleAspect);

        DefaultAopProxyFactory proxyFactory = new DefaultAopProxyFactory();
        AopProxy aopProxy = proxyFactory.createAopProxy(aspectJProxyFactory);
        controller = (GuidanceDocumentController) aopProxy.getProxy();

        FormattingConversionService conversionService = new FormattingConversionService();

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new AppUserArgumentResolver(appSecurityComponent))
                .setControllerAdvice(new ExceptionControllerAdvice())
                .setConversionService(conversionService)
                .build();
    }

    @Test
    void getGuidanceDocumentById() throws Exception {

        final long documentId = 1L;
        final String sectionName = "sectionName";
        final UUID fileUUID = UUID.randomUUID();
        final FileNameAndUuid fileNameAndUuid = FileNameAndUuid.builder().uuid(fileUUID).fileName("fileName").build();
        final AppUser user = AppUser.builder().roleType(RoleTypeConstants.REGULATOR).build();

        final GuidanceDocumentDTO guidanceDocumentDTO =
                GuidanceDocumentDTO.builder().id(documentId)
                        .guidanceSectionName(sectionName)
                        .guidanceSectionId(SECTION_ID)
                        .fileNameAndUuid(fileNameAndUuid)
                        .displayOrderNo(1)
                        .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        when(guidanceDocumentService.getGuidanceDocumentById(documentId, SECTION_ID)).thenReturn(guidanceDocumentDTO);

        mockMvc.perform(MockMvcRequestBuilders.get(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH + "/" + documentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andDo(MockMvcResultHandlers.print())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.guidanceSectionName").value(sectionName))
                .andExpect(jsonPath("$.guidanceSectionId").value(SECTION_ID))
                .andExpect(jsonPath("$.fileNameAndUuid.fileName").value("fileName"))
                .andExpect(jsonPath("$.fileNameAndUuid.uuid").value(fileUUID.toString()))
                .andExpect(jsonPath("$.displayOrderNo").value(1));

        verify(appSecurityComponent).getAuthenticatedUser();
        verify(guidanceDocumentService).getGuidanceDocumentById(documentId, SECTION_ID);
    }

    @Test
    void getGuidanceDocumentById_forbidden() throws Exception {

        Long documentId = 1L;
        final AppUser user = AppUser.builder().userId("userId").build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(appUserAuthorizationService)
                .authorize(user, "getGuidanceDocumentById", Long.toString(documentId), null, null);

        mockMvc.perform(
                        MockMvcRequestBuilders
                                .get(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH + "/" + documentId)
                                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        verifyNoInteractions(guidanceDocumentService);
    }

    @Test
    void createGuidanceDocument() throws Exception {

        final AppUser user = AppUser.builder()
                .roleType(RoleTypeConstants.REGULATOR)
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);

        final SaveGuidanceDocumentDTO saveGuidanceDocumentDTO = SaveGuidanceDocumentDTO.builder()
                .title("title")
                .displayOrderNo(1)
                .file(UUID.randomUUID())
                .build();

        mockMvc.perform(MockMvcRequestBuilders.post(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saveGuidanceDocumentDTO)))
                .andExpect(status().isCreated());

        verify(guidanceDocumentService).createGuidanceDocument(user, SECTION_ID, saveGuidanceDocumentDTO);
    }

    @Test
    void createGuidanceDocument_forbidden() throws Exception {

        final AppUser user = AppUser.builder()
                .roleType(RoleTypeConstants.REGULATOR)
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);

        final SaveGuidanceDocumentDTO saveGuidanceDocumentDTO = SaveGuidanceDocumentDTO.builder()
                .title("title")
                .displayOrderNo(1)
                .file(UUID.randomUUID())
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(appUserAuthorizationService)
                .authorize(user, "createGuidanceDocument", Long.toString(SECTION_ID), null, null);

        mockMvc.perform(MockMvcRequestBuilders.post(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saveGuidanceDocumentDTO)))
                .andExpect(status().isForbidden());

        verifyNoInteractions(guidanceDocumentService);
    }

    @Test
    void uploadFile() throws Exception {

        final AppUser authUser = AppUser.builder().userId("id").build();
        final String fileName = "file";
        final String originalFileName = "filename.txt";
        final String contentType = "text/plain";
        final byte[] content = "content".getBytes();

        final MockMultipartFile
                multipartFile = new MockMultipartFile(fileName, originalFileName, contentType, content);
        final FileDTO fileDTO = FileDTO.builder()
                .fileName(originalFileName)
                .fileType(contentType)
                .fileContent(content)
                .fileSize(multipartFile.getSize())
                .createdBy(authUser.getUserId())
                .build();
        final UUID fileUUID = UUID.randomUUID();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(authUser);
        when(fileGuidanceService.uploadFile(authUser.getUserId(), fileDTO, SECTION_ID))
                .thenReturn(FileUuidDTO.builder().uuid(fileUUID.toString()).build());

        mockMvc.perform(
                        MockMvcRequestBuilders
                                .multipart(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH + "/upload")
                                .file(multipartFile)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uuid").value(fileUUID.toString()));

        verify(appSecurityComponent).getAuthenticatedUser();
    }

    @Test
    void uploadFile_forbidden() throws Exception {

        final AppUser authUser = AppUser.builder().userId("id").build();

        final MockMultipartFile guidanceFile = new MockMultipartFile("file", "filename.txt", "text/plain", "content".getBytes());

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(authUser);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(appUserAuthorizationService)
                .authorize(authUser, "uploadGuidanceFile", Long.toString(SECTION_ID), null, null);

        mockMvc.perform(
                        MockMvcRequestBuilders.multipart(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH + "/upload")
                                .file(guidanceFile)
                )
                .andExpect(status().isForbidden());

        verify(appSecurityComponent).getAuthenticatedUser();
        verifyNoInteractions(fileGuidanceService);
    }

    @Test
    void updateGuidanceDocument() throws Exception {

        final Long documentId = 1L;
        final AppUser user = AppUser.builder()
                .roleType(RoleTypeConstants.REGULATOR)
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);

        UUID fileUUID = UUID.randomUUID();
        final SaveGuidanceDocumentDTO saveGuidanceDocumentDTO = SaveGuidanceDocumentDTO.builder()
                .title("title")
                .displayOrderNo(1)
                .file(fileUUID)
                .build();

        mockMvc.perform(MockMvcRequestBuilders.put(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH + "/" + documentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saveGuidanceDocumentDTO)))
                .andExpect(status().isOk());

        verify(guidanceDocumentService).updateGuidanceDocument(documentId, SECTION_ID, saveGuidanceDocumentDTO, user);
    }

    @Test
    void updateGuidanceDocument_forbidden() throws Exception {

        final Long documentId = 1L;
        final AppUser user = AppUser.builder()
                .roleType(RoleTypeConstants.REGULATOR)
                .build();

        UUID fileUUID = UUID.randomUUID();
        final SaveGuidanceDocumentDTO saveGuidanceDocumentDTO = SaveGuidanceDocumentDTO.builder()
                .title("title")
                .displayOrderNo(1)
                .file(fileUUID)
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(appUserAuthorizationService)
                .authorize(user, "updateGuidanceDocument", Long.toString(documentId), null, null);

        mockMvc.perform(MockMvcRequestBuilders.put(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH + "/" + documentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saveGuidanceDocumentDTO)))
                .andExpect(status().isForbidden());

        verify(appSecurityComponent).getAuthenticatedUser();
        verifyNoInteractions(guidanceDocumentService);
    }

    @Test
    void deleteGuidanceDocument() throws Exception {

        Long documentId = 1L;
        final AppUser user = AppUser.builder()
                .roleType(RoleTypeConstants.REGULATOR)
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);

        mockMvc.perform(MockMvcRequestBuilders.delete(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH + "/" + documentId))
                .andExpect(status().isNoContent());

        verify(guidanceDocumentService).deleteGuidanceDocument(documentId, SECTION_ID);
    }

    @Test
    void deleteGuidanceDocument_forbidden() throws Exception {

        final Long documentId = 1L;
        final AppUser user = AppUser.builder()
                .roleType(RoleTypeConstants.REGULATOR)
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(appUserAuthorizationService)
                .authorize(user, "deleteGuidanceDocument", Long.toString(documentId), null, null);

        mockMvc.perform(MockMvcRequestBuilders.delete(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH + "/" + documentId))
                .andExpect(status().isForbidden());

        verifyNoInteractions(guidanceDocumentService);
    }

    @Test
    void generateGetGuidanceFileToken() throws Exception {
        final UUID documentUuid = UUID.randomUUID();
        final FileToken expectedToken = FileToken.builder().token("token").build();
        final AppUser user = AppUser.builder()
                .roleType(RoleTypeConstants.REGULATOR)
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        when(guidanceDocumentService.generateGetGuidanceDocumentToken(documentUuid, SECTION_ID)).thenReturn(expectedToken);

        mockMvc.perform(MockMvcRequestBuilders
                        .get(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH + "/files")
                        .param("uuid", documentUuid.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(expectedToken.getToken()));

        verify(guidanceDocumentService).generateGetGuidanceDocumentToken(documentUuid, SECTION_ID);
    }

    @Test
    void generateGetGuidanceFileToken_forbidden() throws Exception {

        final UUID documentUuid = UUID.randomUUID();
        final AppUser user = AppUser.builder()
                .roleType(RoleTypeConstants.REGULATOR)
                .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
                .when(appUserAuthorizationService)
                .authorize(user, "generateGetGuidanceFileToken", Long.toString(SECTION_ID), null, null);

        mockMvc.perform(MockMvcRequestBuilders.get(SECTIONS_CONTROLLER_PATH + SECTION_ID + DOCUMENTS_CONTROLLER_PATH + "/files")
                .param("uuid", documentUuid.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        verifyNoInteractions(guidanceDocumentService);
    }
}
