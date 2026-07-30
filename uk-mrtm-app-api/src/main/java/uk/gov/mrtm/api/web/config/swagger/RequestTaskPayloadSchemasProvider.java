package uk.gov.mrtm.api.web.config.swagger;

import org.springframework.stereotype.Component;

import uk.gov.mrtm.api.workflow.request.flow.accountclosure.domain.AccountClosureSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.review.domain.AerApplicationAmendsSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.review.domain.AerApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.submit.domain.AerApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.verify.domain.AerApplicationVerificationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.doe.submit.domain.DoeApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationAmendsSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpApplicationAmendsSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpWaitForAmendsRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationWaitForFollowUpRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceCivilPenaltyRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceFinalDeterminationRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceInitialPenaltyNoticeRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceNoticeOfIntentRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationAmendsSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirApplicationRespondToRegulatorCommentsRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirApplicationSubmitRequestTaskPayload;
import uk.gov.netz.api.swagger.SwaggerSchemasAbstractProvider;
import uk.gov.netz.api.workflow.request.flow.payment.domain.PaymentConfirmRequestTaskPayload;
import uk.gov.netz.api.workflow.request.flow.payment.domain.PaymentMakeRequestTaskPayload;
import uk.gov.netz.api.workflow.request.flow.payment.domain.PaymentTrackRequestTaskPayload;
import uk.gov.netz.api.workflow.request.flow.rde.domain.RdeForceDecisionRequestTaskPayload;
import uk.gov.netz.api.workflow.request.flow.rde.domain.RdeResponseRequestTaskPayload;
import uk.gov.netz.api.workflow.request.flow.rfi.domain.RfiResponseSubmitRequestTaskPayload;

@Component
public class RequestTaskPayloadSchemasProvider extends SwaggerSchemasAbstractProvider {
    
    @Override
    public void afterPropertiesSet() {
    	//common
    	addResolvedShemas(RfiResponseSubmitRequestTaskPayload.class.getSimpleName(), RfiResponseSubmitRequestTaskPayload.class);
    	
    	addResolvedShemas(RdeForceDecisionRequestTaskPayload.class.getSimpleName(), RdeForceDecisionRequestTaskPayload.class);
    	addResolvedShemas(RdeResponseRequestTaskPayload.class.getSimpleName(), RdeResponseRequestTaskPayload.class);
    	
    	addResolvedShemas(PaymentMakeRequestTaskPayload.class.getSimpleName(), PaymentMakeRequestTaskPayload.class);
    	addResolvedShemas(PaymentTrackRequestTaskPayload.class.getSimpleName(), PaymentTrackRequestTaskPayload.class);
    	addResolvedShemas(PaymentConfirmRequestTaskPayload.class.getSimpleName(), PaymentConfirmRequestTaskPayload.class);
    	
    	//project specific
    	addResolvedShemas(AccountClosureSubmitRequestTaskPayload.class.getSimpleName(),
				AccountClosureSubmitRequestTaskPayload.class);
		//EMP_ISSUANCE
		addResolvedShemas(EmpIssuanceApplicationSubmitRequestTaskPayload.class.getSimpleName(),
				EmpIssuanceApplicationSubmitRequestTaskPayload.class);
		addResolvedShemas(EmpIssuanceApplicationReviewRequestTaskPayload.class.getSimpleName(),
				EmpIssuanceApplicationReviewRequestTaskPayload.class);
		addResolvedShemas(EmpIssuanceApplicationAmendsSubmitRequestTaskPayload.class.getSimpleName(),
			EmpIssuanceApplicationAmendsSubmitRequestTaskPayload.class);
		//EMP_NOTIFICATION
		addResolvedShemas(EmpNotificationApplicationSubmitRequestTaskPayload.class.getSimpleName(),
				EmpNotificationApplicationSubmitRequestTaskPayload.class);
		addResolvedShemas(EmpNotificationApplicationReviewRequestTaskPayload.class.getSimpleName(),
			EmpNotificationApplicationReviewRequestTaskPayload.class);
		addResolvedShemas(EmpNotificationFollowUpRequestTaskPayload.class.getSimpleName(),
				EmpNotificationFollowUpRequestTaskPayload.class);
		addResolvedShemas(EmpNotificationWaitForFollowUpRequestTaskPayload.class.getSimpleName(),
				EmpNotificationWaitForFollowUpRequestTaskPayload.class);
		addResolvedShemas(EmpNotificationFollowUpApplicationReviewRequestTaskPayload.class.getSimpleName(),
				EmpNotificationFollowUpApplicationReviewRequestTaskPayload.class);
		addResolvedShemas(EmpNotificationFollowUpApplicationAmendsSubmitRequestTaskPayload.class.getSimpleName(),
			EmpNotificationFollowUpApplicationAmendsSubmitRequestTaskPayload.class);
		addResolvedShemas(EmpNotificationFollowUpWaitForAmendsRequestTaskPayload.class.getSimpleName(),
			EmpNotificationFollowUpWaitForAmendsRequestTaskPayload.class);
		//EMP_VARIATION
		addResolvedShemas(EmpVariationApplicationSubmitRequestTaskPayload.class.getSimpleName(),
			EmpVariationApplicationSubmitRequestTaskPayload.class);
		addResolvedShemas(EmpVariationApplicationReviewRequestTaskPayload.class.getSimpleName(),
				EmpVariationApplicationReviewRequestTaskPayload.class);
		addResolvedShemas(EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload.class.getSimpleName(),
				EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload.class);
		//AER
		addResolvedShemas(AerApplicationSubmitRequestTaskPayload.class.getSimpleName(),
			AerApplicationSubmitRequestTaskPayload.class);
		addResolvedShemas(AerApplicationVerificationSubmitRequestTaskPayload.class.getSimpleName(),
				AerApplicationVerificationSubmitRequestTaskPayload.class);
		addResolvedShemas(AerApplicationReviewRequestTaskPayload.class.getSimpleName(),
				AerApplicationReviewRequestTaskPayload.class);
		addResolvedShemas(AerApplicationAmendsSubmitRequestTaskPayload.class.getSimpleName(),
			AerApplicationAmendsSubmitRequestTaskPayload.class);
		//DOE
		addResolvedShemas(DoeApplicationSubmitRequestTaskPayload.class.getSimpleName(),
				DoeApplicationSubmitRequestTaskPayload.class);
		//VIR
		addResolvedShemas(VirApplicationSubmitRequestTaskPayload.class.getSimpleName(),
				VirApplicationSubmitRequestTaskPayload.class);
		addResolvedShemas(VirApplicationReviewRequestTaskPayload.class.getSimpleName(),
				VirApplicationReviewRequestTaskPayload.class);
		addResolvedShemas(VirApplicationRespondToRegulatorCommentsRequestTaskPayload.class.getSimpleName(),
			VirApplicationRespondToRegulatorCommentsRequestTaskPayload.class);

		//NON_COMPLIANCE
		addResolvedShemas(NonComplianceApplicationSubmitRequestTaskPayload.class.getSimpleName(),
			NonComplianceApplicationSubmitRequestTaskPayload.class);
		addResolvedShemas(NonComplianceInitialPenaltyNoticeRequestTaskPayload.class.getSimpleName(),
			NonComplianceInitialPenaltyNoticeRequestTaskPayload.class);
		addResolvedShemas(NonComplianceNoticeOfIntentRequestTaskPayload.class.getSimpleName(),
			NonComplianceNoticeOfIntentRequestTaskPayload.class);
		addResolvedShemas(NonComplianceCivilPenaltyRequestTaskPayload.class.getSimpleName(),
			NonComplianceCivilPenaltyRequestTaskPayload.class);
		addResolvedShemas(NonComplianceFinalDeterminationRequestTaskPayload.class.getSimpleName(),
			NonComplianceFinalDeterminationRequestTaskPayload.class);

		//SITE_VISIT
		addResolvedShemas(SiteVisitApplicationSubmitRequestTaskPayload.class.getSimpleName(),
			SiteVisitApplicationSubmitRequestTaskPayload.class);
		addResolvedShemas(SiteVisitApplicationReviewRequestTaskPayload.class.getSimpleName(),
			SiteVisitApplicationReviewRequestTaskPayload.class);
		addResolvedShemas(SiteVisitApplicationAmendsSubmitRequestTaskPayload.class.getSimpleName(),
			SiteVisitApplicationAmendsSubmitRequestTaskPayload.class);
	}
    
}
