package uk.gov.mrtm.api.web.config.swagger;

import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.flow.accountclosure.domain.AccountClosureSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerApplicationCompletedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.review.domain.AerApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.verify.domain.AerApplicationVerificationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.aer.verify.domain.AerVerificationReturnedToOperatorRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.doe.common.domain.DoeApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationAmendsSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationApprovedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationDeemedWithdrawnRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceSendRegistryAccountOpeningEventRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationApplicationReviewSubmittedDecisionRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpApplicationReviewSubmittedDecisionRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpResponseSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empnotification.domain.EmpNotificationFollowUpSaveReviewDecisionRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationAmendsSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationApprovedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationDeemedWithdrawnRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationRegulatorLedApprovedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationRejectedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceApplicationClosedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceCivilPenaltyApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceDetailsAmendedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceFinalDeterminationApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceInitialPenaltyNoticeApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceNoticeOfIntentApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.registry.domain.RegistryAccountUpdatedEventSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.registry.domain.RegistryRegulatorNoticeEventSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.registry.domain.RegistryUpdatedEmissionsEventSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationAmendsSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirApplicationReviewedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirApplicationSubmittedRequestActionPayload;
import uk.gov.netz.api.swagger.SwaggerSchemasAbstractProvider;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewDecisionSubmittedRequestActionPayload;
import uk.gov.netz.api.workflow.request.flow.payment.domain.PaymentCancelledRequestActionPayload;
import uk.gov.netz.api.workflow.request.flow.payment.domain.PaymentProcessedRequestActionPayload;
import uk.gov.netz.api.workflow.request.flow.rde.domain.RdeDecisionForcedRequestActionPayload;
import uk.gov.netz.api.workflow.request.flow.rde.domain.RdeRejectedRequestActionPayload;
import uk.gov.netz.api.workflow.request.flow.rde.domain.RdeSubmittedRequestActionPayload;
import uk.gov.netz.api.workflow.request.flow.rfi.domain.RfiResponseSubmittedRequestActionPayload;
import uk.gov.netz.api.workflow.request.flow.rfi.domain.RfiSubmittedRequestActionPayload;

@Component
public class RequestActionPayloadSchemasProvider extends SwaggerSchemasAbstractProvider {
    
    @Override
    public void afterPropertiesSet() {
    	//common
    	addResolvedShemas(RfiResponseSubmittedRequestActionPayload.class.getSimpleName(), RfiResponseSubmittedRequestActionPayload.class);
    	addResolvedShemas(RfiSubmittedRequestActionPayload.class.getSimpleName(), RfiSubmittedRequestActionPayload.class);
    	
    	addResolvedShemas(RdeDecisionForcedRequestActionPayload.class.getSimpleName(), RdeDecisionForcedRequestActionPayload.class);
    	addResolvedShemas(RdeRejectedRequestActionPayload.class.getSimpleName(), RdeRejectedRequestActionPayload.class);
    	addResolvedShemas(RdeSubmittedRequestActionPayload.class.getSimpleName(), RdeSubmittedRequestActionPayload.class);
    	
    	addResolvedShemas(PaymentProcessedRequestActionPayload.class.getSimpleName(), PaymentProcessedRequestActionPayload.class);
    	addResolvedShemas(PaymentCancelledRequestActionPayload.class.getSimpleName(), PaymentCancelledRequestActionPayload.class);
    	
    	//project specific
    	addResolvedShemas(AccountClosureSubmittedRequestActionPayload.class.getSimpleName(),
				AccountClosureSubmittedRequestActionPayload.class);
		//EMP_ISSUANCE
		addResolvedShemas(EmpIssuanceApplicationSubmittedRequestActionPayload.class.getSimpleName(),
				EmpIssuanceApplicationSubmittedRequestActionPayload.class);
		addResolvedShemas(EmpIssuanceApplicationApprovedRequestActionPayload.class.getSimpleName(),
			EmpIssuanceApplicationApprovedRequestActionPayload.class);
		addResolvedShemas(EmpIssuanceApplicationDeemedWithdrawnRequestActionPayload.class.getSimpleName(),
			EmpIssuanceApplicationDeemedWithdrawnRequestActionPayload.class);
		addResolvedShemas(PeerReviewDecisionSubmittedRequestActionPayload.class.getSimpleName(),
				PeerReviewDecisionSubmittedRequestActionPayload.class);
		addResolvedShemas(EmpIssuanceApplicationReturnedForAmendsRequestActionPayload.class.getSimpleName(),
			EmpIssuanceApplicationReturnedForAmendsRequestActionPayload.class);
		addResolvedShemas(EmpIssuanceApplicationAmendsSubmittedRequestActionPayload.class.getSimpleName(),
			EmpIssuanceApplicationAmendsSubmittedRequestActionPayload.class);
		addResolvedShemas(EmpIssuanceSendRegistryAccountOpeningEventRequestActionPayload.class.getSimpleName(),
			EmpIssuanceSendRegistryAccountOpeningEventRequestActionPayload.class);
		//EMP_NOTIFICATION
		addResolvedShemas(EmpNotificationApplicationSubmittedRequestActionPayload.class.getSimpleName(),
				EmpNotificationApplicationSubmittedRequestActionPayload.class);
		addResolvedShemas(EmpNotificationApplicationReviewSubmittedDecisionRequestActionPayload.class.getSimpleName(),
				EmpNotificationApplicationReviewSubmittedDecisionRequestActionPayload.class);
		addResolvedShemas(EmpNotificationFollowUpApplicationReviewSubmittedDecisionRequestActionPayload.class.getSimpleName(),
				EmpNotificationFollowUpApplicationReviewSubmittedDecisionRequestActionPayload.class);
		addResolvedShemas(EmpNotificationFollowUpResponseSubmittedRequestActionPayload.class.getSimpleName(),
				EmpNotificationFollowUpResponseSubmittedRequestActionPayload.class);
		addResolvedShemas(EmpNotificationFollowUpSaveReviewDecisionRequestTaskActionPayload.class.getSimpleName(),
				EmpNotificationFollowUpSaveReviewDecisionRequestTaskActionPayload.class);
        addResolvedShemas(EmpNotificationFollowUpReturnedForAmendsRequestActionPayload.class.getSimpleName(),
            EmpNotificationFollowUpReturnedForAmendsRequestActionPayload.class);
        //EMP_VARIATION
        addResolvedShemas(EmpVariationApplicationSubmittedRequestActionPayload.class.getSimpleName(),
				EmpVariationApplicationSubmittedRequestActionPayload.class);
		addResolvedShemas(EmpVariationApplicationApprovedRequestActionPayload.class.getSimpleName(),
				EmpVariationApplicationApprovedRequestActionPayload.class);
		addResolvedShemas(EmpVariationApplicationRejectedRequestActionPayload.class.getSimpleName(),
				EmpVariationApplicationRejectedRequestActionPayload.class);
		addResolvedShemas(EmpVariationApplicationDeemedWithdrawnRequestActionPayload.class.getSimpleName(),
				EmpVariationApplicationDeemedWithdrawnRequestActionPayload.class);
		addResolvedShemas(EmpVariationApplicationRegulatorLedApprovedRequestActionPayload.class.getSimpleName(),
				EmpVariationApplicationRegulatorLedApprovedRequestActionPayload.class);
		addResolvedShemas(EmpVariationApplicationReturnedForAmendsRequestActionPayload.class.getSimpleName(),
				EmpVariationApplicationReturnedForAmendsRequestActionPayload.class);
		addResolvedShemas(EmpVariationApplicationAmendsSubmittedRequestActionPayload.class.getSimpleName(),
				EmpVariationApplicationAmendsSubmittedRequestActionPayload.class);

		//DOE
		addResolvedShemas(DoeApplicationSubmittedRequestActionPayload.class.getSimpleName(),
				DoeApplicationSubmittedRequestActionPayload.class);

		//AER
		addResolvedShemas(AerApplicationSubmittedRequestActionPayload.class.getSimpleName(),
				AerApplicationSubmittedRequestActionPayload.class);
		addResolvedShemas(AerApplicationVerificationSubmittedRequestActionPayload.class.getSimpleName(),
				AerApplicationVerificationSubmittedRequestActionPayload.class);
		addResolvedShemas(AerVerificationReturnedToOperatorRequestActionPayload.class.getSimpleName(),
				AerVerificationReturnedToOperatorRequestActionPayload.class);
		addResolvedShemas(AerApplicationCompletedRequestActionPayload.class.getSimpleName(),
				AerApplicationCompletedRequestActionPayload.class);
		addResolvedShemas(AerApplicationReturnedForAmendsRequestActionPayload.class.getSimpleName(),
			AerApplicationReturnedForAmendsRequestActionPayload.class);

		//VIR
		addResolvedShemas(VirApplicationSubmittedRequestActionPayload.class.getSimpleName(),
				VirApplicationSubmittedRequestActionPayload.class);
		addResolvedShemas(VirApplicationReviewedRequestActionPayload.class.getSimpleName(),
				VirApplicationReviewedRequestActionPayload.class);

		//Registry
		addResolvedShemas(RegistryUpdatedEmissionsEventSubmittedRequestActionPayload.class.getSimpleName(),
			RegistryUpdatedEmissionsEventSubmittedRequestActionPayload.class);
		addResolvedShemas(RegistryAccountUpdatedEventSubmittedRequestActionPayload.class.getSimpleName(),
			RegistryAccountUpdatedEventSubmittedRequestActionPayload.class);
		addResolvedShemas(RegistryRegulatorNoticeEventSubmittedRequestActionPayload.class.getSimpleName(),
			RegistryRegulatorNoticeEventSubmittedRequestActionPayload.class);

		//NON_COMPLIANCE
		addResolvedShemas(NonComplianceApplicationSubmittedRequestActionPayload.class.getSimpleName(),
			NonComplianceApplicationSubmittedRequestActionPayload.class);
		addResolvedShemas(NonComplianceInitialPenaltyNoticeApplicationSubmittedRequestActionPayload.class.getSimpleName(),
			NonComplianceInitialPenaltyNoticeApplicationSubmittedRequestActionPayload.class);
		addResolvedShemas(NonComplianceNoticeOfIntentApplicationSubmittedRequestActionPayload.class.getSimpleName(),
			NonComplianceNoticeOfIntentApplicationSubmittedRequestActionPayload.class);
		addResolvedShemas(NonComplianceCivilPenaltyApplicationSubmittedRequestActionPayload.class.getSimpleName(),
			NonComplianceCivilPenaltyApplicationSubmittedRequestActionPayload.class);
		addResolvedShemas(NonComplianceFinalDeterminationApplicationSubmittedRequestActionPayload.class.getSimpleName(),
			NonComplianceFinalDeterminationApplicationSubmittedRequestActionPayload.class);
		addResolvedShemas(NonComplianceApplicationClosedRequestActionPayload.class.getSimpleName(),
			NonComplianceApplicationClosedRequestActionPayload.class);
		addResolvedShemas(NonComplianceDetailsAmendedRequestActionPayload.class.getSimpleName(),
			NonComplianceDetailsAmendedRequestActionPayload.class);

		//SITE_VISIT
		addResolvedShemas(SiteVisitApplicationSubmittedRequestActionPayload.class.getSimpleName(),
			SiteVisitApplicationSubmittedRequestActionPayload.class);
		addResolvedShemas(SiteVisitApplicationReturnedForAmendsRequestActionPayload.class.getSimpleName(),
			SiteVisitApplicationReturnedForAmendsRequestActionPayload.class);
		addResolvedShemas(SiteVisitApplicationAmendsSubmittedRequestActionPayload.class.getSimpleName(),
			SiteVisitApplicationAmendsSubmittedRequestActionPayload.class);
		addResolvedShemas(SiteVisitApplicationReviewSubmittedRequestActionPayload.class.getSimpleName(),
			SiteVisitApplicationReviewSubmittedRequestActionPayload.class);
    }
    
}
