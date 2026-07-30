package uk.gov.mrtm.api.web.config.swagger;

import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.flow.accountclosure.domain.AccountClosureSaveRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.review.domain.AerApplicationSkipReviewRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.review.domain.AerSaveApplicationAmendRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.review.domain.AerSaveReviewGroupDecisionRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.submit.domain.AerImportThirdPartyDataRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.submit.domain.AerSaveApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.verify.domain.AerSaveApplicationVerificationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.verify.domain.AerVerificationImportThirdPartyDataRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.verify.domain.AerVerificationReturnToOperatorRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.doe.submit.domain.DoeSaveApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceSaveApplicationAmendRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceSaveApplicationReviewRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceSaveReviewGroupDecisionRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceSaveApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationApplicationSaveRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpExtendDateRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpSaveApplicationAmendRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpSaveResponseRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpSaveReviewDecisionRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationSaveReviewGroupDecisionRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveApplicationRegulatorLedRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveApplicationReviewRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveDetailsReviewGroupDecisionRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveReviewDeterminationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveReviewGroupDecisionRegulatorLedRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveReviewGroupDecisionRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceAmendDetailsRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceCivilPenaltySaveApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceCloseApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceFinalDeterminationSaveApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceInitialPenaltyNoticeSaveApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceNoticeOfIntentSaveApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceNotifyOperatorRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceSaveApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitSaveApplicationAmendRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSaveRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirSaveApplicationRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirSaveRespondToRegulatorCommentsRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirSaveReviewRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirSubmitRespondToRegulatorCommentsRequestTaskActionPayload;
import uk.gov.netz.api.swagger.SwaggerSchemasAbstractProvider;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewDecisionRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;
import uk.gov.netz.api.workflow.request.flow.payment.domain.PaymentCancelRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.payment.domain.PaymentMarkAsReceivedRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.rde.domain.RdeForceDecisionRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.rde.domain.RdeResponseSubmitRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.rde.domain.RdeSubmitRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.rfi.domain.RfiResponseSubmitRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.rfi.domain.RfiSubmitRequestTaskActionPayload;

@Component
public class RequestTaskActionPayloadSchemasProvider extends SwaggerSchemasAbstractProvider {
    
    @Override
    public void afterPropertiesSet() {
    	//common
    	addResolvedShemas(RfiSubmitRequestTaskActionPayload.class.getSimpleName(), RfiSubmitRequestTaskActionPayload.class);
    	addResolvedShemas(RfiResponseSubmitRequestTaskActionPayload.class.getSimpleName(), RfiResponseSubmitRequestTaskActionPayload.class);
    	
    	addResolvedShemas(RdeSubmitRequestTaskActionPayload.class.getSimpleName(), RdeSubmitRequestTaskActionPayload.class);
    	addResolvedShemas(RdeForceDecisionRequestTaskActionPayload.class.getSimpleName(), RdeForceDecisionRequestTaskActionPayload.class);
    	addResolvedShemas(RdeResponseSubmitRequestTaskActionPayload.class.getSimpleName(), RdeResponseSubmitRequestTaskActionPayload.class);
    	
    	addResolvedShemas(PaymentMarkAsReceivedRequestTaskActionPayload.class.getSimpleName(), PaymentMarkAsReceivedRequestTaskActionPayload.class);
    	addResolvedShemas(PaymentCancelRequestTaskActionPayload.class.getSimpleName(), PaymentCancelRequestTaskActionPayload.class);
    	
    	addResolvedShemas(RequestTaskActionEmptyPayload.class.getSimpleName(), RequestTaskActionEmptyPayload.class);
    	
    	//project specific
    	addResolvedShemas(AccountClosureSaveRequestTaskActionPayload.class.getSimpleName(),
				AccountClosureSaveRequestTaskActionPayload.class);
		//EMP_ISSUANCE
		addResolvedShemas(EmpIssuanceSaveApplicationRequestTaskActionPayload.class.getSimpleName(),
				EmpIssuanceSaveApplicationRequestTaskActionPayload.class);
		addResolvedShemas(EmpIssuanceSaveApplicationReviewRequestTaskActionPayload.class.getSimpleName(),
				EmpIssuanceSaveApplicationReviewRequestTaskActionPayload.class);
		addResolvedShemas(EmpIssuanceSaveReviewGroupDecisionRequestTaskActionPayload.class.getSimpleName(),
				EmpIssuanceSaveReviewGroupDecisionRequestTaskActionPayload.class);
		addResolvedShemas(EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload.class.getSimpleName(),
				EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload.class);
		addResolvedShemas(EmpIssuanceSaveApplicationAmendRequestTaskActionPayload.class.getSimpleName(),
			EmpIssuanceSaveApplicationAmendRequestTaskActionPayload.class);

		//EMP_NOTIFICATION
		addResolvedShemas(EmpNotificationApplicationSaveRequestTaskActionPayload.class.getSimpleName(),
				EmpNotificationApplicationSaveRequestTaskActionPayload.class);
		addResolvedShemas(NotifyOperatorForDecisionRequestTaskActionPayload.class.getSimpleName(),
			NotifyOperatorForDecisionRequestTaskActionPayload.class);
		addResolvedShemas(EmpNotificationSaveReviewGroupDecisionRequestTaskActionPayload.class.getSimpleName(),
			EmpNotificationSaveReviewGroupDecisionRequestTaskActionPayload.class);
		addResolvedShemas(PeerReviewRequestTaskActionPayload.class.getSimpleName(),
			PeerReviewRequestTaskActionPayload.class);
		addResolvedShemas(PeerReviewDecisionRequestTaskActionPayload.class.getSimpleName(),
			PeerReviewDecisionRequestTaskActionPayload.class);
		addResolvedShemas(EmpNotificationFollowUpSaveResponseRequestTaskActionPayload.class.getSimpleName(),
				EmpNotificationFollowUpSaveResponseRequestTaskActionPayload.class);
		addResolvedShemas(EmpNotificationFollowUpExtendDateRequestTaskActionPayload.class.getSimpleName(),
				EmpNotificationFollowUpExtendDateRequestTaskActionPayload.class);
		addResolvedShemas(EmpNotificationFollowUpSaveReviewDecisionRequestTaskActionPayload.class.getSimpleName(),
				EmpNotificationFollowUpSaveReviewDecisionRequestTaskActionPayload.class);
		addResolvedShemas(EmpNotificationFollowUpSaveApplicationAmendRequestTaskActionPayload.class.getSimpleName(),
			EmpNotificationFollowUpSaveApplicationAmendRequestTaskActionPayload.class);

		//EMP_VARIATION
		addResolvedShemas(EmpVariationSaveApplicationRequestTaskActionPayload.class.getSimpleName(),
			EmpVariationSaveApplicationRequestTaskActionPayload.class);
		addResolvedShemas(EmpVariationSaveApplicationReviewRequestTaskActionPayload.class.getSimpleName(),
				EmpVariationSaveApplicationReviewRequestTaskActionPayload.class);
		addResolvedShemas(EmpVariationSaveDetailsReviewGroupDecisionRequestTaskActionPayload.class.getSimpleName(),
				EmpVariationSaveDetailsReviewGroupDecisionRequestTaskActionPayload.class);
		addResolvedShemas(EmpVariationSaveReviewGroupDecisionRequestTaskActionPayload.class.getSimpleName(),
				EmpVariationSaveReviewGroupDecisionRequestTaskActionPayload.class);
		addResolvedShemas(EmpVariationSaveReviewDeterminationRequestTaskActionPayload.class.getSimpleName(),
				EmpVariationSaveReviewDeterminationRequestTaskActionPayload.class);
		addResolvedShemas(EmpVariationSaveApplicationRegulatorLedRequestTaskActionPayload.class.getSimpleName(),
				EmpVariationSaveApplicationRegulatorLedRequestTaskActionPayload.class);
		addResolvedShemas(EmpVariationSaveReviewGroupDecisionRegulatorLedRequestTaskActionPayload.class.getSimpleName(),
				EmpVariationSaveReviewGroupDecisionRegulatorLedRequestTaskActionPayload.class);

		//AER
		addResolvedShemas(AerSaveApplicationRequestTaskActionPayload.class.getSimpleName(),
			AerSaveApplicationRequestTaskActionPayload.class);
		addResolvedShemas(AerImportThirdPartyDataRequestTaskActionPayload.class.getSimpleName(),
				AerImportThirdPartyDataRequestTaskActionPayload.class);
		addResolvedShemas(AerVerificationImportThirdPartyDataRequestTaskActionPayload.class.getSimpleName(),
			AerVerificationImportThirdPartyDataRequestTaskActionPayload.class);
		addResolvedShemas(AerSaveApplicationVerificationRequestTaskActionPayload.class.getSimpleName(),
				AerSaveApplicationVerificationRequestTaskActionPayload.class);
		addResolvedShemas(AerVerificationReturnToOperatorRequestTaskActionPayload.class.getSimpleName(),
				AerVerificationReturnToOperatorRequestTaskActionPayload.class);
		addResolvedShemas(AerSaveReviewGroupDecisionRequestTaskActionPayload.class.getSimpleName(),
				AerSaveReviewGroupDecisionRequestTaskActionPayload.class);
		addResolvedShemas(AerSaveApplicationAmendRequestTaskActionPayload.class.getSimpleName(),
			AerSaveApplicationAmendRequestTaskActionPayload.class);
		addResolvedShemas(AerApplicationSkipReviewRequestTaskActionPayload.class.getSimpleName(),
				AerApplicationSkipReviewRequestTaskActionPayload.class);

		//DOE
		addResolvedShemas(DoeSaveApplicationRequestTaskActionPayload.class.getSimpleName(),
				DoeSaveApplicationRequestTaskActionPayload.class);

		//VIR
		addResolvedShemas(VirSaveApplicationRequestTaskActionPayload.class.getSimpleName(),
				VirSaveApplicationRequestTaskActionPayload.class);
		addResolvedShemas(VirSaveReviewRequestTaskActionPayload.class.getSimpleName(),
				VirSaveReviewRequestTaskActionPayload.class);
		addResolvedShemas(VirSubmitRespondToRegulatorCommentsRequestTaskActionPayload.class.getSimpleName(),
			VirSubmitRespondToRegulatorCommentsRequestTaskActionPayload.class);
		addResolvedShemas(VirSaveRespondToRegulatorCommentsRequestTaskActionPayload.class.getSimpleName(),
			VirSaveRespondToRegulatorCommentsRequestTaskActionPayload.class);

		//NON_COMPLIANCE
		addResolvedShemas(NonComplianceSaveApplicationRequestTaskActionPayload.class.getSimpleName(),
			NonComplianceSaveApplicationRequestTaskActionPayload.class);
		addResolvedShemas(NonComplianceInitialPenaltyNoticeSaveApplicationRequestTaskActionPayload.class.getSimpleName(),
			NonComplianceInitialPenaltyNoticeSaveApplicationRequestTaskActionPayload.class);
		addResolvedShemas(NonComplianceNotifyOperatorRequestTaskActionPayload.class.getSimpleName(),
			NonComplianceNotifyOperatorRequestTaskActionPayload.class);
		addResolvedShemas(NonComplianceNoticeOfIntentSaveApplicationRequestTaskActionPayload.class.getSimpleName(),
			NonComplianceNoticeOfIntentSaveApplicationRequestTaskActionPayload.class);
		addResolvedShemas(NonComplianceCivilPenaltySaveApplicationRequestTaskActionPayload.class.getSimpleName(),
			NonComplianceCivilPenaltySaveApplicationRequestTaskActionPayload.class);
		addResolvedShemas(NonComplianceFinalDeterminationSaveApplicationRequestTaskActionPayload.class.getSimpleName(),
			NonComplianceFinalDeterminationSaveApplicationRequestTaskActionPayload.class);
		addResolvedShemas(NonComplianceCloseApplicationRequestTaskActionPayload.class.getSimpleName(),
			NonComplianceCloseApplicationRequestTaskActionPayload.class);
		addResolvedShemas(NonComplianceAmendDetailsRequestTaskActionPayload.class.getSimpleName(),
			NonComplianceAmendDetailsRequestTaskActionPayload.class);

		//SITE_VISIT
		addResolvedShemas(SiteVisitApplicationSaveRequestTaskActionPayload.class.getSimpleName(),
			SiteVisitApplicationSaveRequestTaskActionPayload.class);
		addResolvedShemas(SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload.class.getSimpleName(),
			SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload.class);
		addResolvedShemas(SiteVisitSaveApplicationAmendRequestTaskActionPayload.class.getSimpleName(),
			SiteVisitSaveApplicationAmendRequestTaskActionPayload.class);
    }
    
}
