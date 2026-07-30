package uk.gov.mrtm.api.workflow.request.flow.common.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanIdentifierGenerator;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.MrtmAccountTemplateParams;
import uk.gov.netz.api.account.domain.AccountContactType;
import uk.gov.netz.api.account.service.AccountContactQueryService;
import uk.gov.netz.api.common.config.CompetentAuthorityProperties;
import uk.gov.netz.api.common.utils.DateService;
import uk.gov.netz.api.competentauthority.CompetentAuthorityService;
import uk.gov.netz.api.documenttemplate.domain.templateparams.AccountTemplateParams;
import uk.gov.netz.api.user.core.service.auth.UserAuthService;
import uk.gov.netz.api.user.regulator.service.RegulatorUserAuthService;
import uk.gov.netz.api.userinfoapi.UserInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateCommonParamsAbstractProvider;

@Service
public class MrtmDocumentTemplateCommonParamsProvider
		extends DocumentTemplateCommonParamsAbstractProvider<MrtmDocumentTemplateAccountData> {
	
	private final UserAuthService userAuthService;
	private final AccountContactQueryService accountContactQueryService;
	private final EmissionsMonitoringPlanQueryService empQueryService;
	private final EmissionsMonitoringPlanIdentifierGenerator generator;

	public MrtmDocumentTemplateCommonParamsProvider(RegulatorUserAuthService regulatorUserAuthService,
			UserAuthService userAuthService, 
			AccountContactQueryService accountContactQueryService,
			CompetentAuthorityProperties competentAuthorityProperties, 
			DateService dateService,
			CompetentAuthorityService competentAuthorityService, 
			EmissionsMonitoringPlanQueryService empQueryService,
			EmissionsMonitoringPlanIdentifierGenerator generator) {
		super(regulatorUserAuthService, userAuthService, competentAuthorityProperties, dateService,
				competentAuthorityService);
		this.userAuthService = userAuthService;
		this.accountContactQueryService = accountContactQueryService;
		this.empQueryService = empQueryService;
		this.generator = generator;
	}

	@Override
    public String getPermitReferenceId(Long accountId) {
        return  empQueryService.getEmpIdByAccountId(accountId).orElse(generator.generate(accountId));
    }

	@Override
	public AccountTemplateParams getAccountTemplateParams(Request request,
			MrtmDocumentTemplateAccountData accountData) {
		final Long accountId = request.getAccountId();

        final Optional<UserInfoDTO> serviceContact = accountContactQueryService
            .findContactByAccountAndContactType(accountId, AccountContactType.SERVICE)
            .map(userAuthService::getUserByUserId);

        final Optional<UserInfoDTO> primaryContact = accountContactQueryService
            .findContactByAccountAndContactType(accountId, AccountContactType.PRIMARY)
            .map(userAuthService::getUserByUserId);

        return MrtmAccountTemplateParams.builder()
            .name(accountData.getName())
            .competentAuthority(accountData.getCompetentAuthority())
            .imoNumber(accountData.getImoNumber())
            .location(accountData.getAddress())
            .primaryContact(primaryContact.map(UserInfoDTO::getFullName).orElse(null))
            .primaryContactEmail(primaryContact.map(UserInfoDTO::getEmail).orElse(null))
            .serviceContact(serviceContact.map(UserInfoDTO::getFullName).orElse(null))
            .serviceContactFirstName(serviceContact.map(UserInfoDTO::getFirstName).orElse(null))
            .serviceContactEmail(serviceContact.map(UserInfoDTO::getEmail).orElse(null))
            .build();
	}

}
