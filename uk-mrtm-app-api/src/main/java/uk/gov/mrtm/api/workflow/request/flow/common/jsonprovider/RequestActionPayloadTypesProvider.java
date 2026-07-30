package uk.gov.mrtm.api.workflow.request.flow.common.jsonprovider;

import com.fasterxml.jackson.databind.jsontype.NamedType;
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
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpBatchReissueSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpEmpBatchReissueCompletedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpReissueCompletedRequestActionPayload;
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
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirApplicationRespondedToRegulatorCommentsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirApplicationReviewedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.vir.domain.VirApplicationSubmittedRequestActionPayload;
import uk.gov.netz.api.common.config.jackson.JsonSubTypesProvider;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewDecisionSubmittedRequestActionPayload;

import java.util.List;

import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.ACCOUNT_CLOSURE_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.AER_APPLICATION_AMENDS_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.AER_APPLICATION_COMPLETED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.AER_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.AER_APPLICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.AER_APPLICATION_VERIFICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.AER_VERIFICATION_RETURNED_TO_OPERATOR_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.DOE_APPLICATION_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.DOE_APPLICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_BATCH_REISSUE_COMPLETED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_BATCH_REISSUE_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_ISSUANCE_APPLICATION_AMENDS_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_ISSUANCE_APPLICATION_APPROVED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_ISSUANCE_APPLICATION_DEEMED_WITHDRAWN_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_ISSUANCE_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_ISSUANCE_APPLICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_ISSUANCE_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_ISSUANCE_REGISTRY_ACCOUNT_OPENING_EVENT_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_NOTIFICATION_APPLICATION_COMPLETED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_NOTIFICATION_APPLICATION_GRANTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_NOTIFICATION_APPLICATION_REJECTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_NOTIFICATION_APPLICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_NOTIFICATION_FOLLOW_UP_RESPONSE_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_NOTIFICATION_FOLLOW_UP_RETURNED_FOR_AMENDS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_NOTIFICATION_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_REISSUE_COMPLETED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_VARIATION_APPLICATION_AMENDS_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_VARIATION_APPLICATION_APPROVED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_VARIATION_APPLICATION_DEEMED_WITHDRAWN_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_VARIATION_APPLICATION_REGULATOR_LED_APPROVED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_VARIATION_APPLICATION_REJECTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_VARIATION_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_VARIATION_APPLICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_VARIATION_PEER_REVIEW_DECISION_REGULATOR_LED_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.EMP_VARIATION_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.NON_COMPLIANCE_APPLICATION_CLOSED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.NON_COMPLIANCE_APPLICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.NON_COMPLIANCE_CIVIL_PENALTY_APPLICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.NON_COMPLIANCE_DETAILS_AMENDED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.NON_COMPLIANCE_FINAL_DETERMINATION_APPLICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_APPLICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.NON_COMPLIANCE_NOTICE_OF_INTENT_APPLICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.REGISTRY_REGULATOR_NOTICE_EVENT_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.REGISTRY_UPDATED_ACCOUNT_EVENT_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.REGISTRY_UPDATED_EMISSIONS_EVENT_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_AMENDS_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_REVIEW_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.SITE_VISIT_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.VIR_APPLICATION_RESPONDED_TO_REGULATOR_COMMENTS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.VIR_APPLICATION_REVIEWED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType.VIR_APPLICATION_SUBMITTED_PAYLOAD;

@Component
public class RequestActionPayloadTypesProvider implements JsonSubTypesProvider {

	@Override
	public List<NamedType> getTypes() {
		return List.of(
				new NamedType(AccountClosureSubmittedRequestActionPayload.class, ACCOUNT_CLOSURE_SUBMITTED_PAYLOAD),

				//EMP_ISSUANCE
				new NamedType(EmpIssuanceApplicationSubmittedRequestActionPayload.class, EMP_ISSUANCE_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(EmpIssuanceApplicationApprovedRequestActionPayload.class, EMP_ISSUANCE_APPLICATION_APPROVED_PAYLOAD),
				new NamedType(EmpIssuanceApplicationDeemedWithdrawnRequestActionPayload.class, EMP_ISSUANCE_APPLICATION_DEEMED_WITHDRAWN_PAYLOAD),
				new NamedType(PeerReviewDecisionSubmittedRequestActionPayload.class, EMP_ISSUANCE_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD),
				new NamedType(EmpIssuanceApplicationReturnedForAmendsRequestActionPayload.class, EMP_ISSUANCE_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD),
				new NamedType(EmpIssuanceApplicationAmendsSubmittedRequestActionPayload.class, EMP_ISSUANCE_APPLICATION_AMENDS_SUBMITTED_PAYLOAD),
				new NamedType(EmpIssuanceSendRegistryAccountOpeningEventRequestActionPayload.class, EMP_ISSUANCE_REGISTRY_ACCOUNT_OPENING_EVENT_SUBMITTED_PAYLOAD),

				// EMP_NOTIFICATION
				new NamedType(EmpNotificationApplicationSubmittedRequestActionPayload.class, EMP_NOTIFICATION_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(EmpNotificationApplicationReviewSubmittedDecisionRequestActionPayload.class, EMP_NOTIFICATION_APPLICATION_GRANTED_PAYLOAD),
				new NamedType(EmpNotificationApplicationReviewSubmittedDecisionRequestActionPayload.class, EMP_NOTIFICATION_APPLICATION_REJECTED_PAYLOAD),
				new NamedType(EmpNotificationFollowUpApplicationReviewSubmittedDecisionRequestActionPayload.class, EMP_NOTIFICATION_APPLICATION_COMPLETED_PAYLOAD),
				new NamedType(PeerReviewDecisionSubmittedRequestActionPayload.class, EMP_NOTIFICATION_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD),
		        new NamedType(EmpNotificationFollowUpResponseSubmittedRequestActionPayload.class, EMP_NOTIFICATION_FOLLOW_UP_RESPONSE_SUBMITTED_PAYLOAD),
                new NamedType(EmpNotificationFollowUpReturnedForAmendsRequestActionPayload.class, EMP_NOTIFICATION_FOLLOW_UP_RETURNED_FOR_AMENDS_PAYLOAD),

				//EMP_VARIATION
                new NamedType(EmpVariationApplicationSubmittedRequestActionPayload.class, EMP_VARIATION_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(PeerReviewDecisionSubmittedRequestActionPayload.class, EMP_VARIATION_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD),
				new NamedType(EmpVariationApplicationRegulatorLedApprovedRequestActionPayload.class, EMP_VARIATION_APPLICATION_REGULATOR_LED_APPROVED_PAYLOAD ),
		        new NamedType(PeerReviewDecisionSubmittedRequestActionPayload.class, EMP_VARIATION_PEER_REVIEW_DECISION_REGULATOR_LED_SUBMITTED_PAYLOAD),
				new NamedType(EmpVariationApplicationApprovedRequestActionPayload.class, EMP_VARIATION_APPLICATION_APPROVED_PAYLOAD ),
				new NamedType(EmpVariationApplicationRejectedRequestActionPayload.class, EMP_VARIATION_APPLICATION_REJECTED_PAYLOAD ),
				new NamedType(EmpVariationApplicationDeemedWithdrawnRequestActionPayload.class, EMP_VARIATION_APPLICATION_DEEMED_WITHDRAWN_PAYLOAD ),
				new NamedType(EmpVariationApplicationReturnedForAmendsRequestActionPayload.class, EMP_VARIATION_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD),
				new NamedType(EmpVariationApplicationAmendsSubmittedRequestActionPayload.class, EMP_VARIATION_APPLICATION_AMENDS_SUBMITTED_PAYLOAD),

				//BATCH_REISSUE
				new NamedType(EmpBatchReissueSubmittedRequestActionPayload.class, EMP_BATCH_REISSUE_SUBMITTED_PAYLOAD),
				new NamedType(EmpEmpBatchReissueCompletedRequestActionPayload.class, EMP_BATCH_REISSUE_COMPLETED_PAYLOAD),
				new NamedType(EmpReissueCompletedRequestActionPayload.class, EMP_REISSUE_COMPLETED_PAYLOAD),

				// DOE
				new NamedType(DoeApplicationSubmittedRequestActionPayload.class, DOE_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(PeerReviewDecisionSubmittedRequestActionPayload.class, DOE_APPLICATION_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD),

				//AER
				new NamedType(AerApplicationSubmittedRequestActionPayload.class, AER_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(AerApplicationVerificationSubmittedRequestActionPayload.class, AER_APPLICATION_VERIFICATION_SUBMITTED_PAYLOAD),
				new NamedType(AerVerificationReturnedToOperatorRequestActionPayload.class, AER_VERIFICATION_RETURNED_TO_OPERATOR_PAYLOAD),
				new NamedType(AerApplicationCompletedRequestActionPayload.class, AER_APPLICATION_COMPLETED_PAYLOAD),
				new NamedType(AerApplicationReturnedForAmendsRequestActionPayload.class, AER_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD),
				new NamedType(AerApplicationSubmittedRequestActionPayload.class, AER_APPLICATION_AMENDS_SUBMITTED_PAYLOAD),

                //VIR
				new NamedType(VirApplicationSubmittedRequestActionPayload.class, VIR_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(VirApplicationReviewedRequestActionPayload.class, VIR_APPLICATION_REVIEWED_PAYLOAD),
				new NamedType(VirApplicationRespondedToRegulatorCommentsRequestActionPayload.class, VIR_APPLICATION_RESPONDED_TO_REGULATOR_COMMENTS_PAYLOAD),

				//Registry
				new NamedType(RegistryUpdatedEmissionsEventSubmittedRequestActionPayload.class, REGISTRY_UPDATED_EMISSIONS_EVENT_SUBMITTED_PAYLOAD),
				new NamedType(RegistryAccountUpdatedEventSubmittedRequestActionPayload.class, REGISTRY_UPDATED_ACCOUNT_EVENT_SUBMITTED_PAYLOAD),
				new NamedType(RegistryRegulatorNoticeEventSubmittedRequestActionPayload.class, REGISTRY_REGULATOR_NOTICE_EVENT_SUBMITTED_PAYLOAD),

				//NON_COMPLIANCE
				new NamedType(NonComplianceApplicationSubmittedRequestActionPayload.class, NON_COMPLIANCE_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(PeerReviewDecisionSubmittedRequestActionPayload.class, NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD),
				new NamedType(NonComplianceInitialPenaltyNoticeApplicationSubmittedRequestActionPayload.class, NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(PeerReviewDecisionSubmittedRequestActionPayload.class, NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD),
				new NamedType(NonComplianceNoticeOfIntentApplicationSubmittedRequestActionPayload.class, NON_COMPLIANCE_NOTICE_OF_INTENT_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(NonComplianceCivilPenaltyApplicationSubmittedRequestActionPayload.class, NON_COMPLIANCE_CIVIL_PENALTY_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(PeerReviewDecisionSubmittedRequestActionPayload.class, NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD),
				new NamedType(NonComplianceFinalDeterminationApplicationSubmittedRequestActionPayload.class, NON_COMPLIANCE_FINAL_DETERMINATION_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(NonComplianceApplicationClosedRequestActionPayload.class, NON_COMPLIANCE_APPLICATION_CLOSED_PAYLOAD),
				new NamedType(NonComplianceDetailsAmendedRequestActionPayload.class, NON_COMPLIANCE_DETAILS_AMENDED_PAYLOAD),

			    //SITE_VISIT
			    new NamedType(SiteVisitApplicationSubmittedRequestActionPayload.class, SITE_VISIT_APPLICATION_SUBMITTED_PAYLOAD),
				new NamedType(PeerReviewDecisionSubmittedRequestActionPayload.class, SITE_VISIT_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD),
				new NamedType(SiteVisitApplicationReturnedForAmendsRequestActionPayload.class, SITE_VISIT_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD),
				new NamedType(SiteVisitApplicationAmendsSubmittedRequestActionPayload.class, SITE_VISIT_APPLICATION_AMENDS_SUBMITTED_PAYLOAD),
				new NamedType(SiteVisitApplicationReviewSubmittedRequestActionPayload.class, SITE_VISIT_APPLICATION_REVIEW_SUBMITTED_PAYLOAD)
		);
	}

}
