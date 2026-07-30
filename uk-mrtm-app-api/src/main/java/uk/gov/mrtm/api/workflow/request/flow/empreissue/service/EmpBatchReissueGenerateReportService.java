package uk.gov.mrtm.api.workflow.request.flow.empreissue.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpBatchReissueRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpBatchReissueRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpEmpReissueAccountReport;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.files.documents.service.storage.FileDocumentStorageService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;

import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Log4j2
@Service
@RequiredArgsConstructor
public class EmpBatchReissueGenerateReportService {

	private static final DateTimeFormatter CSV_DATE_ISSUE_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
	
	private final RequestService requestService;
	private final FileDocumentStorageService fileDocumentStorageService;
	
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void generateReport(String requestId) {
		final Request request = requestService.findRequestById(requestId);
		final EmpBatchReissueRequestPayload payload = (EmpBatchReissueRequestPayload) request.getPayload();
		final EmpBatchReissueRequestMetadata metadata = (EmpBatchReissueRequestMetadata) request.getMetadata();
		final Map<Long, EmpEmpReissueAccountReport> accountsReports = metadata.getAccountsReports();
		
		try (StringWriter sw = new StringWriter();
				CSVPrinter csvPrinter = new CSVPrinter(sw, CSVFormat.DEFAULT.builder()
						.setHeader("Plan ID", 
								"Operator name", 
								"Date issued", 
								"Status")
						.build());) {
			for (EmpEmpReissueAccountReport accountReport : accountsReports.values()) {
				csvPrinter.printRecord(
						accountReport.getEmpId(), 
						accountReport.getAccountName(),
						accountReport.getIssueDate() != null
								? CSV_DATE_ISSUE_FORMATTER.format(accountReport.getIssueDate())
								: "N/A",
						BooleanUtils.isTrue(accountReport.getSucceeded()) ? "Pass" : "Fail");
			}
			
			final byte[] generatedFile = sw.toString().getBytes(StandardCharsets.UTF_8);
			final FileInfoDTO reportFile = fileDocumentStorageService.createFileDocument(generatedFile,
					request.getId() + ".csv");
			
			//update payload
			payload.setReport(reportFile);
		} catch (Exception e) {
			log.error(String.format("Cannot generate csv report for request %s", requestId), e);
		}
	}
	
}
