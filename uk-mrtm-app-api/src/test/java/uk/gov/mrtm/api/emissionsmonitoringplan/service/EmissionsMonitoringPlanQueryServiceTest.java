package uk.gov.mrtm.api.emissionsmonitoringplan.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanEntity;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmpProcedureFormWithFiles;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.abbreviations.EmpAbbreviations;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.additionaldocuments.AdditionalDocuments;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.datagaps.EmpDataGaps;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmpDetailsDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.managementprocedures.EmpManagementProcedures;
import uk.gov.mrtm.api.emissionsmonitoringplan.repository.EmissionsMonitoringPlanRepository;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.common.domain.EmpIssuanceDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.files.documents.service.storage.FileDocumentStorageService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskType;
import uk.gov.netz.api.workflow.request.core.repository.RequestRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmissionsMonitoringPlanQueryServiceTest {
    private static final UUID dataFlowActivitiesFileId = UUID.randomUUID();
    private static final Long ACCOUNT_ID = 1L;
    private static final String EMP_ID = "empId";

    @InjectMocks
    private EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;

    @Mock
    private EmissionsMonitoringPlanRepository emissionsMonitoringPlanRepository;

    @Mock
    private FileDocumentStorageService fileDocumentStorageService;

    @Mock
    private RequestRepository requestRepository;

    @Test
    void getEmissionsMonitoringPlanDetailsDTOByAccountId() {
        String fileDocumentId = "fileDocumentId";
        Map<UUID, String> empAttachments = Map.of(UUID.randomUUID(), "attachment 1", UUID.randomUUID(), "attachment 2");
        EmissionsMonitoringPlanContainer empContainer = EmissionsMonitoringPlanContainer.builder()
                .emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
                        .abbreviations(EmpAbbreviations.builder()
                                .exist(false)
                                .build())
                        .additionalDocuments(AdditionalDocuments.builder()
                                .exist(false)
                                .build())
                        .managementProcedures(createManagementProcedures())
                        .dataGaps(createDataGaps())
                                .build())
                .empAttachments(empAttachments)
                .build();
        EmissionsMonitoringPlanEntity empEntity = EmissionsMonitoringPlanEntity.builder()
                .id(EMP_ID)
                .accountId(ACCOUNT_ID)
                .fileDocumentUuid(fileDocumentId)
                .empContainer(empContainer)
                .build();
        when(emissionsMonitoringPlanRepository.findByAccountId(ACCOUNT_ID)).thenReturn(Optional.of(empEntity));
        when(fileDocumentStorageService.getFileInfoDTO(fileDocumentId)).thenReturn(FileInfoDTO.builder().build());
        final Optional<EmpDetailsDTO> actual = emissionsMonitoringPlanQueryService.getEmissionsMonitoringPlanDetailsDTOByAccountId(ACCOUNT_ID);
        assertTrue(actual.isPresent());
        assertEquals(empEntity.getId(), actual.get().getId());
        assertEquals(empAttachments, actual.get().getEmpAttachments());
        verify(emissionsMonitoringPlanRepository).findByAccountId(ACCOUNT_ID);
        verify(fileDocumentStorageService).getFileInfoDTO(fileDocumentId);
    }

    @Test
    void getEmissionsMonitoringPlanDTOByAccountId() {
        String fileDocumentId = "fileDocumentId";
        Map<UUID, String> empAttachments = Map.of(UUID.randomUUID(), "attachment 1", UUID.randomUUID(), "attachment 2");
        EmissionsMonitoringPlanEntity empEntity = EmissionsMonitoringPlanEntity.builder()
                .id(EMP_ID)
                .accountId(ACCOUNT_ID)
                .fileDocumentUuid(fileDocumentId)
                .empContainer(EmissionsMonitoringPlanContainer.builder()
                        .emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
                                .abbreviations(EmpAbbreviations.builder()
                                        .exist(false)
                                        .build())
                                .additionalDocuments(AdditionalDocuments.builder()
                                        .exist(false)
                                        .build())
                                .managementProcedures(createManagementProcedures())
                                .dataGaps(createDataGaps())
                                        .build())
                        .empAttachments(empAttachments)
                        .build())
                .build();
        when(emissionsMonitoringPlanRepository.findByAccountId(ACCOUNT_ID)).thenReturn(Optional.of(empEntity));
        final Optional<EmissionsMonitoringPlanDTO> actual = emissionsMonitoringPlanQueryService.getEmissionsMonitoringPlanDTOByAccountId(ACCOUNT_ID);
        assertTrue(actual.isPresent());
        assertEquals(EMP_ID, actual.get().getId());
        assertEquals(ACCOUNT_ID, actual.get().getAccountId());
        assertNotNull(actual.get().getEmpContainer());
    }

    @Test
    void getEmissionsMonitoringPlanDTOByAccountId_no_emp_found() {
        when(emissionsMonitoringPlanRepository.findByAccountId(ACCOUNT_ID)).thenReturn(Optional.empty());
        final Optional<EmissionsMonitoringPlanDTO> actual = emissionsMonitoringPlanQueryService.getEmissionsMonitoringPlanDTOByAccountId(ACCOUNT_ID);
        assertTrue(actual.isEmpty());
    }

    @Test
    void findApprovedByAccountId() {
        Request request = mock(Request.class);
        when(requestRepository.findByAccountIdAndTypeAndStatus(ACCOUNT_ID, MrtmRequestType.EMP_ISSUANCE,
            EmpIssuanceDeterminationType.APPROVED.name())).thenReturn(List.of(request));

        final Request actual = emissionsMonitoringPlanQueryService.findApprovedByAccountId(ACCOUNT_ID);
        assertEquals(request, actual);
    }

    @Test
    void findApprovedByAccountId_throws_exception() {
        Request request = mock(Request.class);
        when(requestRepository.findByAccountIdAndTypeAndStatus(ACCOUNT_ID, MrtmRequestType.EMP_ISSUANCE,
            EmpIssuanceDeterminationType.APPROVED.name())).thenReturn(List.of(request, request));

        BusinessException businessException = assertThrows(
            BusinessException.class, () -> emissionsMonitoringPlanQueryService.findApprovedByAccountId(ACCOUNT_ID));
        assertThat(businessException.getErrorCode()).isEqualTo(ErrorCode.INTERNAL_SERVER);
    }

    @Test
    void getEmpIdByAccountId() {
        when(emissionsMonitoringPlanRepository.findIdByAccountId(ACCOUNT_ID)).thenReturn(Optional.of(EMP_ID));
        final Optional<String> actual = emissionsMonitoringPlanQueryService.getEmpIdByAccountId(ACCOUNT_ID);
        assertTrue(actual.isPresent());
        assertThat(actual.get()).isEqualTo(EMP_ID);
    }

    @Test
    void getEmpContainerById() {
        EmissionsMonitoringPlanContainer container = mock(EmissionsMonitoringPlanContainer.class);
        EmissionsMonitoringPlanEntity emissionsMonitoringPlan = EmissionsMonitoringPlanEntity.builder()
            .empContainer(container)
            .build();

        when(emissionsMonitoringPlanRepository.findById(EMP_ID)).thenReturn(Optional.of(emissionsMonitoringPlan));
        final EmissionsMonitoringPlanContainer actual = emissionsMonitoringPlanQueryService.getEmpContainerById(EMP_ID);

        assertThat(actual).isEqualTo(container);
        verify(emissionsMonitoringPlanRepository).findById(EMP_ID);
        verifyNoMoreInteractions(emissionsMonitoringPlanRepository);
        verifyNoInteractions(fileDocumentStorageService, requestRepository);
    }

    @Test
    void getEmpContainerById_throws_exception() {
        when(emissionsMonitoringPlanRepository.findById(EMP_ID)).thenReturn(Optional.empty());

        BusinessException businessException = assertThrows(
            BusinessException.class, () -> emissionsMonitoringPlanQueryService.getEmpContainerById(EMP_ID));

        assertThat(businessException.getErrorCode()).isEqualTo(ErrorCode.RESOURCE_NOT_FOUND);
        verifyNoMoreInteractions(emissionsMonitoringPlanRepository);
        verifyNoInteractions(fileDocumentStorageService, requestRepository);
    }

    @Test
    void existsContainerByIdAndFileDocumentUuid() {
        String fileDocumentUuid = "fileDocumentUuid";

        when(emissionsMonitoringPlanRepository.existsByIdAndFileDocumentUuid(EMP_ID, fileDocumentUuid)).thenReturn(true);
        final boolean actual = emissionsMonitoringPlanQueryService.existsContainerByIdAndFileDocumentUuid(EMP_ID, fileDocumentUuid);

        assertThat(actual).isEqualTo(true);
        verify(emissionsMonitoringPlanRepository).existsByIdAndFileDocumentUuid(EMP_ID, fileDocumentUuid);
        verifyNoMoreInteractions(emissionsMonitoringPlanRepository);
        verifyNoInteractions(fileDocumentStorageService, requestRepository);
    }

    @Test
    void getEmpAccountById() {
        when(emissionsMonitoringPlanRepository.findEmpAccountById(EMP_ID)).thenReturn(Optional.of(ACCOUNT_ID));
        final Long actual = emissionsMonitoringPlanQueryService.getEmpAccountById(EMP_ID);

        assertThat(actual).isEqualTo(ACCOUNT_ID);
        verify(emissionsMonitoringPlanRepository).findEmpAccountById(EMP_ID);
        verifyNoMoreInteractions(emissionsMonitoringPlanRepository);
        verifyNoInteractions(fileDocumentStorageService, requestRepository);
    }

    @Test
    void getEmpAccountById_throws_exception() {
        when(emissionsMonitoringPlanRepository.findEmpAccountById(EMP_ID)).thenReturn(Optional.empty());

        BusinessException businessException = assertThrows(
            BusinessException.class, () -> emissionsMonitoringPlanQueryService.getEmpAccountById(EMP_ID));

        assertThat(businessException.getErrorCode()).isEqualTo(ErrorCode.RESOURCE_NOT_FOUND);
        verifyNoMoreInteractions(emissionsMonitoringPlanRepository);
        verifyNoInteractions(fileDocumentStorageService, requestRepository);
    }
    
    private EmpManagementProcedures createManagementProcedures() {
        return EmpManagementProcedures.builder()
                .dataFlowActivities(EmpProcedureFormWithFiles.builder()
                        .description("procedure description")
                        .version("procedure version")
                        .description("procedure description")
                        .responsiblePersonOrPosition("responsible person or position")
                        .recordsLocation("location of records")
                        .itSystemUsed("IT system")
                        .files(Set.of(dataFlowActivitiesFileId))
                        .build())
                .build();
    }

    private EmpDataGaps createDataGaps() {
        return EmpDataGaps.builder()
                .formulaeUsed("Some formulae used")
                .fuelConsumptionEstimationMethod("Some fuel consumption method")
                .dataSources("Some Data Sources")
                .recordsLocation("Some Records location")
                .itSystemUsed("Some IT System used")
                .build();
    }

    @Test
    void getEmissionsMonitoringPlanConsolidationNumberByAccountId() {
        Long accountId = 1L;
        EmissionsMonitoringPlanEntity empEntity = new EmissionsMonitoringPlanEntity("1", accountId, EmissionsMonitoringPlanContainer.builder().build(), null);

        when(emissionsMonitoringPlanRepository.findByAccountId(accountId)).thenReturn(Optional.of(empEntity));

        int result = emissionsMonitoringPlanQueryService.getEmissionsMonitoringPlanConsolidationNumberByAccountId(accountId);
        assertThat(result).isEqualTo(1);
        verify(emissionsMonitoringPlanRepository, times(1)).findByAccountId(accountId);
    }

    @Test
    void getLastestEmissionsMonitoringPlan_when_emp_exists() {
        EmissionsMonitoringPlan emissionsMonitoringPlan = mock(EmissionsMonitoringPlan.class);
        EmissionsMonitoringPlanContainer empContainer = EmissionsMonitoringPlanContainer.builder()
            .emissionsMonitoringPlan(emissionsMonitoringPlan)
            .build();

        EmissionsMonitoringPlanEntity empEntity = new EmissionsMonitoringPlanEntity("1", ACCOUNT_ID, empContainer, null);

        when(emissionsMonitoringPlanRepository.findByAccountId(ACCOUNT_ID)).thenReturn(Optional.of(empEntity));

        EmissionsMonitoringPlan lastestEmissionsMonitoringPlan = emissionsMonitoringPlanQueryService.getLastestEmissionsMonitoringPlan(ACCOUNT_ID);
        assertEquals(emissionsMonitoringPlan,  lastestEmissionsMonitoringPlan);

        verify(emissionsMonitoringPlanRepository).findByAccountId(ACCOUNT_ID);
        verifyNoMoreInteractions(emissionsMonitoringPlanRepository);
        verifyNoInteractions(fileDocumentStorageService, requestRepository);
    }

    @Test
    void getLastestEmissionsMonitoringPlan_when_emp_does_not_exist_and_emp_review_exists() {
        EmissionsMonitoringPlan emissionsMonitoringPlan = mock(EmissionsMonitoringPlan.class);

        when(emissionsMonitoringPlanRepository.findByAccountId(ACCOUNT_ID)).thenReturn(Optional.empty());
        EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload = EmpIssuanceApplicationReviewRequestTaskPayload.builder().emissionsMonitoringPlan(emissionsMonitoringPlan).build();
        RequestTaskType requestTaskType = RequestTaskType.builder().code(MrtmRequestTaskType.EMP_ISSUANCE_APPLICATION_REVIEW).build();
        RequestTask requestTask = RequestTask.builder().type(requestTaskType).payload(requestTaskPayload).build();
        Request request = Request.builder().requestTasks(List.of(requestTask)).build();
        when(requestRepository.findByRequestTypeAndResourceTypeAndResourceId(MrtmRequestType.EMP_ISSUANCE, ResourceType.ACCOUNT, String.valueOf(ACCOUNT_ID)))
            .thenReturn(List.of(request));

        EmissionsMonitoringPlan lastestEmissionsMonitoringPlan = emissionsMonitoringPlanQueryService.getLastestEmissionsMonitoringPlan(ACCOUNT_ID);
        assertEquals(emissionsMonitoringPlan,  lastestEmissionsMonitoringPlan);

        verify(emissionsMonitoringPlanRepository).findByAccountId(ACCOUNT_ID);
        verify(requestRepository).findByRequestTypeAndResourceTypeAndResourceId(MrtmRequestType.EMP_ISSUANCE, ResourceType.ACCOUNT, String.valueOf(ACCOUNT_ID));
        verifyNoMoreInteractions(requestRepository, emissionsMonitoringPlanRepository);
        verifyNoInteractions(fileDocumentStorageService);
    }

    @Test
    void getLastestEmissionsMonitoringPlan_when_emp_does_not_exist_and_emp_review_does_not_exist() {
        EmissionsMonitoringPlan emissionsMonitoringPlan = mock(EmissionsMonitoringPlan.class);

        when(emissionsMonitoringPlanRepository.findByAccountId(ACCOUNT_ID)).thenReturn(Optional.empty());
        EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload = EmpIssuanceApplicationReviewRequestTaskPayload.builder().emissionsMonitoringPlan(emissionsMonitoringPlan).build();
        RequestTaskType requestTaskType = RequestTaskType.builder().code(MrtmRequestTaskType.EMP_ISSUANCE_APPLICATION_SUBMIT).build();
        RequestTask requestTask = RequestTask.builder().type(requestTaskType).payload(requestTaskPayload).build();
        Request request = Request.builder().requestTasks(List.of(requestTask)).build();
        when(requestRepository.findByRequestTypeAndResourceTypeAndResourceId(MrtmRequestType.EMP_ISSUANCE, ResourceType.ACCOUNT, String.valueOf(ACCOUNT_ID)))
            .thenReturn(List.of(request));

        EmissionsMonitoringPlan lastestEmissionsMonitoringPlan = emissionsMonitoringPlanQueryService.getLastestEmissionsMonitoringPlan(ACCOUNT_ID);
        assertNull(lastestEmissionsMonitoringPlan);

        verify(emissionsMonitoringPlanRepository).findByAccountId(ACCOUNT_ID);
        verify(requestRepository).findByRequestTypeAndResourceTypeAndResourceId(MrtmRequestType.EMP_ISSUANCE, ResourceType.ACCOUNT, String.valueOf(ACCOUNT_ID));
        verifyNoMoreInteractions(requestRepository, emissionsMonitoringPlanRepository);
        verifyNoInteractions(fileDocumentStorageService);
    }
}
