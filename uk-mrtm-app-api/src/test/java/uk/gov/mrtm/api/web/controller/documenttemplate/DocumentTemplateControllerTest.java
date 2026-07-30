package uk.gov.mrtm.api.web.controller.documenttemplate;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import uk.gov.mrtm.api.web.config.AppUserArgumentResolver;
import uk.gov.mrtm.api.web.controller.exception.ExceptionControllerAdvice;
import uk.gov.mrtm.api.web.orchestrator.template.dto.DocumentTemplateDTO;
import uk.gov.mrtm.api.web.orchestrator.template.service.DocumentTemplateQueryOrchestratorService;
import uk.gov.netz.api.authorization.core.domain.AppAuthority;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.authorization.rules.services.AppUserAuthorizationService;
import uk.gov.netz.api.authorization.rules.services.RoleAuthorizationService;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.common.domain.PagingRequest;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;
import uk.gov.netz.api.documenttemplate.domain.dto.DocumentTemplateInfoDTO;
import uk.gov.netz.api.documenttemplate.domain.dto.DocumentTemplateSearchCriteria;
import uk.gov.netz.api.documenttemplate.domain.dto.DocumentTemplateSearchResults;
import uk.gov.netz.api.documenttemplate.service.DocumentTemplateQueryService;
import uk.gov.netz.api.documenttemplate.service.DocumentTemplateUpdateService;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.notification.template.domain.dto.NotificationTemplateInfoDTO;
import uk.gov.netz.api.security.AppSecurityComponent;
import uk.gov.netz.api.security.AuthorizationAspectUserResolver;
import uk.gov.netz.api.security.AuthorizedAspect;
import uk.gov.netz.api.security.AuthorizedRoleAspect;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static uk.gov.netz.api.common.constants.RoleTypeConstants.OPERATOR;

@ExtendWith(MockitoExtension.class)
class DocumentTemplateControllerTest {

    private MockMvc mockMvc;

    @InjectMocks
    private DocumentTemplateController documentTemplateController;

    @Mock
    private DocumentTemplateQueryService documentTemplateQueryService;
    
    @Mock
    private DocumentTemplateQueryOrchestratorService documentTemplateQueryOrchestratorService;

    @Mock
    private DocumentTemplateUpdateService documentTemplateUpdateService;

    @Mock
    private AppSecurityComponent appSecurityComponent;

    @Mock
    private RoleAuthorizationService roleAuthorizationService;

    @Mock
    private AppUserAuthorizationService appUserAuthorizationService;

    @BeforeEach
    public void setUp() {
        AuthorizationAspectUserResolver authorizationAspectUserResolver = new AuthorizationAspectUserResolver(appSecurityComponent);
        AuthorizedRoleAspect
            authorizedRoleAspect = new AuthorizedRoleAspect(roleAuthorizationService, authorizationAspectUserResolver);
        AuthorizedAspect authorizedAspect = new AuthorizedAspect(appUserAuthorizationService, authorizationAspectUserResolver);

        AspectJProxyFactory aspectJProxyFactory = new AspectJProxyFactory(documentTemplateController);
        aspectJProxyFactory.addAspect(authorizedRoleAspect);
        aspectJProxyFactory.addAspect(authorizedAspect);

        DefaultAopProxyFactory proxyFactory = new DefaultAopProxyFactory();
        AopProxy aopProxy = proxyFactory.createAopProxy(aspectJProxyFactory);

        documentTemplateController = (DocumentTemplateController) aopProxy.getProxy();

        FormattingConversionService conversionService = new FormattingConversionService();

        mockMvc = MockMvcBuilders.standaloneSetup(documentTemplateController)
            .addFilters(new FilterChainProxy(Collections.emptyList()))
            .setControllerAdvice(new ExceptionControllerAdvice())
            .setCustomArgumentResolvers(new AppUserArgumentResolver(appSecurityComponent))
            .setConversionService(conversionService)
            .build();
    }

    @Test
    void getCurrentUserDocumentTemplates() throws Exception {
        CompetentAuthorityEnum ca = CompetentAuthorityEnum.ENGLAND;
        AppAuthority appAuthority = AppAuthority.builder().competentAuthority(ca).build();
        AppUser appUser = AppUser.builder()
            .userId("userId")
            .roleType(RoleTypeConstants.REGULATOR)
            .authorities(List.of(appAuthority))
            .build();
        DocumentTemplateSearchCriteria searchCriteria = DocumentTemplateSearchCriteria.builder()
            .competentAuthority(ca)
            .term("term")
            .paging(PagingRequest.builder().pageNumber(0).pageSize(30).build())
            .build();

        List<DocumentTemplateInfoDTO> documentTemplates = List.of(
            new DocumentTemplateInfoDTO(1L, "template1", null, "Workflow Name", LocalDateTime.now()),
            new DocumentTemplateInfoDTO(2L, "template2", null, "Workflow Name", LocalDateTime.now())
        );
        DocumentTemplateSearchResults results = DocumentTemplateSearchResults.builder()
            .templates(documentTemplates)
            .total(2L)
            .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);
        when(documentTemplateQueryService.getDocumentTemplatesBySearchCriteria(searchCriteria)).thenReturn(results);

        mockMvc.perform(MockMvcRequestBuilders
                .get("/v1.0/document-templates")
                .param("term", searchCriteria.getTerm())
                .param("page", String.valueOf(searchCriteria.getPaging().getPageNumber()))
                .param("size", String.valueOf(searchCriteria.getPaging().getPageSize()))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.templates[0].id").value(1L))
                .andExpect(jsonPath("$.templates[0].name").value("template1"))
                .andExpect(jsonPath("$.templates[1].id").value(2L))
                .andExpect(jsonPath("$.templates[1].name").value("template2"));

        verify(documentTemplateQueryService, times(1)).getDocumentTemplatesBySearchCriteria(searchCriteria);
    }

    @Test
    void getCurrentUserDocumentTemplates_forbidden() throws Exception {
        AppUser appUser = AppUser.builder()
            .userId("userId")
            .roleType(OPERATOR)
            .build();
        DocumentTemplateSearchCriteria searchCriteria = DocumentTemplateSearchCriteria.builder()
            .term("term")
            .paging(PagingRequest.builder().pageNumber(0).pageSize(30).build())
            .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
            .when(roleAuthorizationService)
            .evaluate(appUser, new String[]{ RoleTypeConstants.REGULATOR });

        mockMvc.perform(MockMvcRequestBuilders
                .get("/v1.0/document-templates")
                .param("term", searchCriteria.getTerm())
                .param("page", String.valueOf(searchCriteria.getPaging().getPageNumber()))
                .param("size", String.valueOf(searchCriteria.getPaging().getPageSize()))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        verifyNoInteractions(documentTemplateQueryService);
    }

    @Test
    void getDocumentTemplateById() throws Exception {
        Long documentTemplateId = 1L;
        String documentTemplateName = "document_template_name";
        AppUser user = AppUser.builder().userId("userId").build();

        uk.gov.netz.api.documenttemplate.domain.dto.DocumentTemplateDTO documentTemplateDTO = uk.gov.netz.api.documenttemplate.domain.dto.DocumentTemplateDTO.builder()
            .id(documentTemplateId)
            .name(documentTemplateName)
            .build();
        
        DocumentTemplateDTO documentTemplateDTOResponse = DocumentTemplateDTO.builder()
        		.documentTemplate(documentTemplateDTO)
        		.notificationTemplates(Set.of(
        				new NotificationTemplateInfoDTO(2L, "name", null, "workflow", LocalDateTime.now())
        				))
        		.build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(user);
        when(documentTemplateQueryOrchestratorService.getDocumentTemplateDTOById(documentTemplateId)).thenReturn(documentTemplateDTOResponse);

        mockMvc.perform(MockMvcRequestBuilders
            .get("/v1.0/document-templates/" + documentTemplateId)
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(documentTemplateId))
            .andExpect(jsonPath("$.name").value(documentTemplateName))
            .andExpect(jsonPath("$.notificationTemplates", org.hamcrest.Matchers.hasSize(1)))
            .andExpect(jsonPath("$.notificationTemplates[0].id").value(2L))
            .andExpect(jsonPath("$.notificationTemplates[0].name").value("name"))
            ;

        verify(documentTemplateQueryOrchestratorService, times(1)).getDocumentTemplateDTOById(documentTemplateId);
    }

    @Test
    void getDocumentTemplateById_forbidden() throws Exception {
        long documentTemplateId = 1L;
        AppUser appUser = AppUser.builder()
            .userId("userId")
            .roleType(OPERATOR)
            .build();

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(appUser);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN))
            .when(appUserAuthorizationService)
            .authorize(appUser, "getDocumentTemplateById", Long.toString(documentTemplateId), null, null);

        mockMvc.perform(MockMvcRequestBuilders
            .get("/v1.0/document-templates/" + documentTemplateId)
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden());

        verifyNoInteractions(documentTemplateQueryService);
    }

    @Test
    void updateDocumentTemplate() throws Exception {
        Long documentTemplateId = 1L;
        String userId = "userId";
        AppUser authUser = AppUser.builder().userId(userId).roleType(RoleTypeConstants.REGULATOR).build();
        String originalFilename = "filename.txt";
        String contentType = "text/plain";
        byte[] fileContent = "content".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", originalFilename, contentType, fileContent);
        FileDTO fileDTO = FileDTO.builder()
            .fileName(originalFilename)
            .fileType(contentType)
            .fileContent(fileContent)
            .fileSize(file.getSize())
            .createdBy(userId)
            .build();
        
        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(authUser);
        
        mockMvc.perform(MockMvcRequestBuilders.multipart("/v1.0/document-templates/" + documentTemplateId)
                .file(file)).andExpect(status().isNoContent());

        verify(appSecurityComponent, times(1)).getAuthenticatedUser();
        verify(documentTemplateUpdateService, times(1)).updateDocumentTemplateFile(documentTemplateId, fileDTO);
    }
    
    @Test
    void updateDocumentTemplate_forbidden() throws Exception {
        Long documentTemplateId = 1L;
        String userId = "userId";
        AppUser authUser = AppUser.builder().userId(userId).roleType(RoleTypeConstants.REGULATOR).build();
        String originalFilename = "filename.txt";
        String contentType = "text/plain";
        byte[] fileContent = "content".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", originalFilename, contentType, fileContent);
        
        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(authUser);
        doThrow(new BusinessException(ErrorCode.FORBIDDEN)).when(appUserAuthorizationService).authorize(authUser,
                "updateDocumentTemplate", Long.toString(documentTemplateId), null, null);
        
        mockMvc.perform(MockMvcRequestBuilders.multipart("/v1.0/document-templates/" + documentTemplateId)
                .file(file)).andExpect(status().isForbidden());

        verify(appSecurityComponent, times(1)).getAuthenticatedUser();
        verifyNoInteractions(documentTemplateUpdateService);
    }
    
    @Test
    @DisplayName("Should throw BAD REQUEST (400) when no attachment is provided")
    void updateDocumentTemplate_noDocumentTemplateFileProvided() throws Exception {
        AppUser authUser = AppUser.builder().userId("userId").roleType(RoleTypeConstants.REGULATOR).build();
        long documentTemplateId = 1L;

        when(appSecurityComponent.getAuthenticatedUser()).thenReturn(authUser);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/v1.0/document-templates/" + documentTemplateId))
            .andExpect(
                result -> Assertions.assertTrue(
                    result.getResolvedException() instanceof MissingServletRequestPartException))
            .andExpect(status().isBadRequest());
    }

}