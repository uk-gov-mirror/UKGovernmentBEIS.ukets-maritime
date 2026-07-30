package uk.gov.mrtm.api.workflow.request.flow.common.jsonprovider;

import com.fasterxml.jackson.databind.jsontype.NamedType;
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
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationAmendsSubmitRequestTaskPayload;
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
import uk.gov.netz.api.common.config.jackson.JsonSubTypesProvider;

import java.util.List;

import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.ACCOUNT_CLOSURE_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.AER_APPLICATION_AMENDS_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.AER_APPLICATION_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.AER_APPLICATION_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.AER_APPLICATION_VERIFICATION_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.AER_WAIT_FOR_AMENDS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.DOE_APPLICATION_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.DOE_APPLICATION_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.DOE_WAIT_FOR_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_ISSUANCE_APPLICATION_AMENDS_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_ISSUANCE_APPLICATION_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_ISSUANCE_APPLICATION_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_ISSUANCE_APPLICATION_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_ISSUANCE_WAIT_FOR_AMENDS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_ISSUANCE_WAIT_FOR_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_ISSUANCE_WAIT_FOR_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_NOTIFICATION_APPLICATION_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_NOTIFICATION_APPLICATION_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_NOTIFICATION_APPLICATION_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_NOTIFICATION_FOLLOW_UP_APPLICATION_AMENDS_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_NOTIFICATION_FOLLOW_UP_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_NOTIFICATION_FOLLOW_UP_WAIT_FOR_AMENDS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_NOTIFICATION_WAIT_FOR_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_NOTIFICATION_WAIT_FOR_FOLLOW_UP_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_VARIATION_APPLICATION_AMENDS_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_VARIATION_APPLICATION_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_VARIATION_APPLICATION_PEER_REVIEW_REGULATOR_LED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_VARIATION_APPLICATION_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_VARIATION_APPLICATION_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_NOTIFICATION_FOLLOW_UP_APPLICATION_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_VARIATION_APPLICATION_WAIT_FOR_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_VARIATION_APPLICATION_SUBMIT_REGULATOR_LED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_VARIATION_WAIT_FOR_AMENDS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_VARIATION_WAIT_FOR_PEER_REVIEW_REGULATOR_LED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.EMP_VARIATION_WAIT_FOR_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.NON_COMPLIANCE_APPLICATION_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.NON_COMPLIANCE_CIVIL_PENALTY_APPLICATION_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.NON_COMPLIANCE_CIVIL_PENALTY_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.NON_COMPLIANCE_CIVIL_PENALTY_WAIT_FOR_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.NON_COMPLIANCE_FINAL_DETERMINATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_APPLICATION_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_WAIT_FOR_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.NON_COMPLIANCE_NOTICE_OF_INTENT_APPLICATION_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.NON_COMPLIANCE_NOTICE_OF_INTENT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.NON_COMPLIANCE_NOTICE_OF_INTENT_WAIT_FOR_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.SITE_VISIT_APPLICATION_AMENDS_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.SITE_VISIT_APPLICATION_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.SITE_VISIT_APPLICATION_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.SITE_VISIT_APPLICATION_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.SITE_VISIT_WAIT_FOR_AMENDS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.SITE_VISIT_WAIT_FOR_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.SITE_VISIT_WAIT_FOR_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.VIR_APPLICATION_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.VIR_APPLICATION_SUBMIT_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskPayloadType.VIR_RESPOND_TO_REGULATOR_COMMENTS_PAYLOAD;

@Component
public class RequestTaskPayloadTypesProvider implements JsonSubTypesProvider {

	@Override
	public List<NamedType> getTypes() {
		return List.of(
				new NamedType(AccountClosureSubmitRequestTaskPayload.class, ACCOUNT_CLOSURE_SUBMIT_PAYLOAD),

				//EMP_ISSUANCE
				new NamedType(EmpIssuanceApplicationSubmitRequestTaskPayload.class, EMP_ISSUANCE_APPLICATION_SUBMIT_PAYLOAD),
				new NamedType(EmpIssuanceApplicationSubmitRequestTaskPayload.class, EMP_ISSUANCE_WAIT_FOR_REVIEW_PAYLOAD),
				new NamedType(EmpIssuanceApplicationReviewRequestTaskPayload.class, EMP_ISSUANCE_APPLICATION_REVIEW_PAYLOAD),
				new NamedType(EmpIssuanceApplicationReviewRequestTaskPayload.class, EMP_ISSUANCE_APPLICATION_PEER_REVIEW_PAYLOAD),
				new NamedType(EmpIssuanceApplicationReviewRequestTaskPayload.class, EMP_ISSUANCE_WAIT_FOR_PEER_REVIEW_PAYLOAD),
				new NamedType(EmpIssuanceApplicationAmendsSubmitRequestTaskPayload.class, EMP_ISSUANCE_APPLICATION_AMENDS_SUBMIT_PAYLOAD),
				new NamedType(EmpIssuanceApplicationReviewRequestTaskPayload.class, EMP_ISSUANCE_WAIT_FOR_AMENDS_PAYLOAD),

				// EMP_NOTIFICATION
				new NamedType(EmpNotificationApplicationSubmitRequestTaskPayload.class, EMP_NOTIFICATION_APPLICATION_SUBMIT_PAYLOAD),
				new NamedType(EmpNotificationApplicationReviewRequestTaskPayload.class, EMP_NOTIFICATION_APPLICATION_REVIEW_PAYLOAD),
				new NamedType(EmpNotificationApplicationReviewRequestTaskPayload.class, EMP_NOTIFICATION_APPLICATION_PEER_REVIEW_PAYLOAD),
				new NamedType(EmpNotificationApplicationReviewRequestTaskPayload.class, EMP_NOTIFICATION_WAIT_FOR_PEER_REVIEW_PAYLOAD),
		        new NamedType(EmpNotificationFollowUpRequestTaskPayload.class, EMP_NOTIFICATION_FOLLOW_UP_PAYLOAD),
				new NamedType(EmpNotificationWaitForFollowUpRequestTaskPayload.class, EMP_NOTIFICATION_WAIT_FOR_FOLLOW_UP_PAYLOAD),
				new NamedType(EmpNotificationFollowUpApplicationReviewRequestTaskPayload.class, EMP_NOTIFICATION_FOLLOW_UP_APPLICATION_REVIEW_PAYLOAD),
				new NamedType(EmpNotificationFollowUpApplicationAmendsSubmitRequestTaskPayload.class, EMP_NOTIFICATION_FOLLOW_UP_APPLICATION_AMENDS_SUBMIT_PAYLOAD),
				new NamedType(EmpNotificationFollowUpWaitForAmendsRequestTaskPayload.class, EMP_NOTIFICATION_FOLLOW_UP_WAIT_FOR_AMENDS_PAYLOAD),

				//EMP_VARIATION
				new NamedType(EmpVariationApplicationSubmitRequestTaskPayload.class, EMP_VARIATION_APPLICATION_SUBMIT_PAYLOAD),
				new NamedType(EmpVariationApplicationSubmitRequestTaskPayload.class, EMP_VARIATION_WAIT_FOR_REVIEW_PAYLOAD),
				new NamedType(EmpVariationApplicationReviewRequestTaskPayload.class, EMP_VARIATION_APPLICATION_REVIEW_PAYLOAD),
				new NamedType(EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload.class, EMP_VARIATION_APPLICATION_SUBMIT_REGULATOR_LED_PAYLOAD),
                new NamedType(EmpVariationApplicationReviewRequestTaskPayload.class, EMP_VARIATION_APPLICATION_PEER_REVIEW_PAYLOAD),
                new NamedType(EmpVariationApplicationReviewRequestTaskPayload.class, EMP_VARIATION_APPLICATION_WAIT_FOR_PEER_REVIEW_PAYLOAD),
		        new NamedType(EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload.class, EMP_VARIATION_APPLICATION_PEER_REVIEW_REGULATOR_LED_PAYLOAD),
				new NamedType(EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload.class, EMP_VARIATION_WAIT_FOR_PEER_REVIEW_REGULATOR_LED_PAYLOAD),
				new NamedType(EmpVariationApplicationAmendsSubmitRequestTaskPayload.class, EMP_VARIATION_APPLICATION_AMENDS_SUBMIT_PAYLOAD),
				new NamedType(EmpVariationApplicationReviewRequestTaskPayload.class, EMP_VARIATION_WAIT_FOR_AMENDS_PAYLOAD),
				//AER
				new NamedType(AerApplicationSubmitRequestTaskPayload.class, AER_APPLICATION_SUBMIT_PAYLOAD),
				new NamedType(AerApplicationVerificationSubmitRequestTaskPayload.class, AER_APPLICATION_VERIFICATION_SUBMIT_PAYLOAD),
				new NamedType(AerApplicationReviewRequestTaskPayload.class, AER_APPLICATION_REVIEW_PAYLOAD),
				new NamedType(AerApplicationAmendsSubmitRequestTaskPayload.class, AER_APPLICATION_AMENDS_SUBMIT_PAYLOAD),
				new NamedType(AerApplicationReviewRequestTaskPayload.class, AER_WAIT_FOR_AMENDS_PAYLOAD),
				//DOE
				new NamedType(DoeApplicationSubmitRequestTaskPayload.class, DOE_APPLICATION_SUBMIT_PAYLOAD),
				new NamedType(DoeApplicationSubmitRequestTaskPayload.class, DOE_WAIT_FOR_PEER_REVIEW_PAYLOAD),
				new NamedType(DoeApplicationSubmitRequestTaskPayload.class, DOE_APPLICATION_PEER_REVIEW_PAYLOAD),
				//VIR
				new NamedType(VirApplicationSubmitRequestTaskPayload.class, VIR_APPLICATION_SUBMIT_PAYLOAD),
				new NamedType(VirApplicationReviewRequestTaskPayload.class, VIR_APPLICATION_REVIEW_PAYLOAD),
				new NamedType(VirApplicationRespondToRegulatorCommentsRequestTaskPayload.class, VIR_RESPOND_TO_REGULATOR_COMMENTS_PAYLOAD),

				//NON_COMPLIANCE
				new NamedType(NonComplianceApplicationSubmitRequestTaskPayload.class, NON_COMPLIANCE_APPLICATION_SUBMIT_PAYLOAD),
				new NamedType(NonComplianceInitialPenaltyNoticeRequestTaskPayload.class, NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PAYLOAD),
				new NamedType(NonComplianceInitialPenaltyNoticeRequestTaskPayload.class, NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_APPLICATION_PEER_REVIEW_PAYLOAD),
				new NamedType(NonComplianceInitialPenaltyNoticeRequestTaskPayload.class, NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_WAIT_FOR_PEER_REVIEW_PAYLOAD),
				new NamedType(NonComplianceNoticeOfIntentRequestTaskPayload.class, NON_COMPLIANCE_NOTICE_OF_INTENT_PAYLOAD),
				new NamedType(NonComplianceNoticeOfIntentRequestTaskPayload.class, NON_COMPLIANCE_NOTICE_OF_INTENT_APPLICATION_PEER_REVIEW_PAYLOAD),
				new NamedType(NonComplianceNoticeOfIntentRequestTaskPayload.class, NON_COMPLIANCE_NOTICE_OF_INTENT_WAIT_FOR_PEER_REVIEW_PAYLOAD),
				new NamedType(NonComplianceCivilPenaltyRequestTaskPayload.class, NON_COMPLIANCE_CIVIL_PENALTY_PAYLOAD),
				new NamedType(NonComplianceCivilPenaltyRequestTaskPayload.class, NON_COMPLIANCE_CIVIL_PENALTY_APPLICATION_PEER_REVIEW_PAYLOAD),
				new NamedType(NonComplianceCivilPenaltyRequestTaskPayload.class, NON_COMPLIANCE_CIVIL_PENALTY_WAIT_FOR_PEER_REVIEW_PAYLOAD),
				new NamedType(NonComplianceFinalDeterminationRequestTaskPayload.class, NON_COMPLIANCE_FINAL_DETERMINATION_PAYLOAD),

				//SITE_VISIT
				new NamedType(SiteVisitApplicationSubmitRequestTaskPayload.class, SITE_VISIT_APPLICATION_SUBMIT_PAYLOAD),
				new NamedType(SiteVisitApplicationReviewRequestTaskPayload.class, SITE_VISIT_APPLICATION_REVIEW_PAYLOAD),
				new NamedType(SiteVisitApplicationSubmitRequestTaskPayload.class, SITE_VISIT_WAIT_FOR_REVIEW_PAYLOAD),
				new NamedType(SiteVisitApplicationReviewRequestTaskPayload.class, SITE_VISIT_APPLICATION_PEER_REVIEW_PAYLOAD),
				new NamedType(SiteVisitApplicationReviewRequestTaskPayload.class, SITE_VISIT_WAIT_FOR_PEER_REVIEW_PAYLOAD),
				new NamedType(SiteVisitApplicationAmendsSubmitRequestTaskPayload.class, SITE_VISIT_APPLICATION_AMENDS_SUBMIT_PAYLOAD),
				new NamedType(SiteVisitApplicationReviewRequestTaskPayload.class, SITE_VISIT_WAIT_FOR_AMENDS_PAYLOAD)
		);
	}

}
