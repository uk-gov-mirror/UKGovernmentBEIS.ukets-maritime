package uk.gov.mrtm.api.account.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateAccountData;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MrtmDocumentTemplateAccountData implements DocumentTemplateAccountData {

	private String name;
	private CompetentAuthorityEnum competentAuthority;
	private String imoNumber;
	private String address;
	
}
