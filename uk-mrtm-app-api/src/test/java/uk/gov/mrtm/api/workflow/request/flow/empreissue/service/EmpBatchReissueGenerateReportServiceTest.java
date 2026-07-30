package uk.gov.mrtm.api.workflow.request.flow.empreissue.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpBatchReissueRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpBatchReissueRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpEmpReissueAccountReport;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.files.documents.service.storage.FileDocumentStorageService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpBatchReissueGenerateReportServiceTest {

	@InjectMocks
	private EmpBatchReissueGenerateReportService cut;

	@Mock
	private RequestService requestService;
	
	@Mock
	private FileDocumentStorageService fileDocumentStorageService;
	
	@Test
	void generateReport() {
		String requestId = "req";
		LocalDate issueDate1 = LocalDate.of(2023, 5, 12);
		EmpBatchReissueRequestPayload payload = EmpBatchReissueRequestPayload.builder()
				.build();
		Map<Long, EmpEmpReissueAccountReport> accountsReports = Map.of(
				1L, EmpEmpReissueAccountReport.builder().accountName("accountName1")
						.empId("empId1").succeeded(true).issueDate(issueDate1).build(),
				2L, EmpEmpReissueAccountReport.builder().accountName("accountName2")
						.empId("empId2").succeeded(false).build());
		
		EmpBatchReissueRequestMetadata metadata = EmpBatchReissueRequestMetadata.builder()
				.accountsReports(accountsReports)
				.build();
		final Request request = Request.builder()
                .id(requestId)
                .payload(payload)
                .metadata(metadata)
                .build();
    	
		FileInfoDTO reportFile = FileInfoDTO.builder()
				.name("rep")
				.uuid(UUID.randomUUID().toString())
				.build();
		
    	when(requestService.findRequestById(requestId)).thenReturn(request);
    	when(fileDocumentStorageService.createFileDocument(Mockito.any(), Mockito.eq("req.csv"))).thenReturn(reportFile);
    	
    	cut.generateReport(requestId);
    	
    	assertThat(payload.getReport()).isEqualTo(reportFile);
    	
    	verify(requestService, times(1)).findRequestById(requestId);
    	ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    	verify(fileDocumentStorageService, times(1)).createFileDocument(fileContentCaptor.capture(), Mockito.eq("req.csv"));
    	byte[] fileContentCaptured = fileContentCaptor.getValue();
    	String fileContentAsStringCaptured = new String(fileContentCaptured);
    	
    	Scanner scanner = new Scanner(fileContentAsStringCaptured);
    	List<String> lines = new ArrayList<>();
    	while (scanner.hasNextLine()) {
    	  lines.add(scanner.nextLine());
    	}
    	scanner.close();
    	
    	assertThat(lines).containsExactlyInAnyOrder("Plan ID,Operator name,Date issued,Status",
    			"empId1,accountName1," + issueDate1.format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")) + ",Pass",
    			"empId2,accountName2,N/A,Fail"
    			);
	}
}
