package uk.gov.mrtm.api.workflow.request.flow.common.jsonprovider;

import com.fasterxml.jackson.databind.jsontype.NamedType;
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
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSaveApplicationAmendRequestTaskActionPayload;
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
import uk.gov.netz.api.common.config.jackson.JsonSubTypesProvider;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewDecisionRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewRequestTaskActionPayload;

import java.util.List;

import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.ACCOUNT_CLOSURE_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.AER_IMPORT_THIRD_PARTY_DATA_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.AER_SAVE_APPLICATION_AMEND_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.AER_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.AER_SAVE_APPLICATION_VERIFICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.AER_SAVE_REVIEW_GROUP_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.AER_SKIP_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.AER_VERIFICATION_IMPORT_THIRD_PARTY_DATA_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.AER_VERIFICATION_RETURN_TO_OPERATOR_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.DOE_REQUEST_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.DOE_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.DOE_SUBMIT_NOTIFY_OPERATOR_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.DOE_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_ISSUANCE_IMPORT_THIRD_PARTY_DATA_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_ISSUANCE_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_ISSUANCE_REQUEST_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_ISSUANCE_REVIEW_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_ISSUANCE_SAVE_APPLICATION_AMEND_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_ISSUANCE_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_ISSUANCE_SAVE_APPLICATION_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_ISSUANCE_SAVE_REVIEW_DETERMINATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_ISSUANCE_SAVE_REVIEW_GROUP_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_NOTIFICATION_FOLLOW_UP_EXTEND_DATE_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_NOTIFICATION_FOLLOW_UP_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_NOTIFICATION_FOLLOW_UP_SAVE_APPLICATION_AMEND_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_NOTIFICATION_FOLLOW_UP_SAVE_RESPONSE_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_NOTIFICATION_FOLLOW_UP_SAVE_REVIEW_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_NOTIFICATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_NOTIFICATION_REQUEST_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_NOTIFICATION_REVIEW_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_NOTIFICATION_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_NOTIFICATION_SAVE_REVIEW_GROUP_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_IMPORT_THIRD_PARTY_DATA_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_REGULATOR_LED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_REQUEST_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_REQUEST_PEER_REVIEW_REGULATOR_LED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_REVIEW_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_REVIEW_SUBMIT_PEER_REVIEW_DECISION_REGULATOR_LED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_SAVE_APPLICATION_AMEND_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_SAVE_APPLICATION_REGULATOR_LED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_SAVE_APPLICATION_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_SAVE_DETAILS_REVIEW_GROUP_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_SAVE_REVIEW_DETERMINATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_SAVE_REVIEW_GROUP_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.EMP_VARIATION_SAVE_REVIEW_GROUP_DECISION_REGULATOR_LED_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_AMEND_DETAILS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_CIVIL_PENALTY_NOTIFY_OPERATOR_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_CIVIL_PENALTY_REQUEST_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_CIVIL_PENALTY_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_CLOSE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_FINAL_DETERMINATION_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_CIVIL_PENALTY_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_NOTIFY_OPERATOR_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_REQUEST_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_NOTICE_OF_INTENT_NOTIFY_OPERATOR_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_NOTICE_OF_INTENT_REQUEST_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_NOTICE_OF_INTENT_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_NOTICE_OF_INTENT_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.NON_COMPLIANCE_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.SITE_VISIT_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.SITE_VISIT_REQUEST_PEER_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.SITE_VISIT_REVIEW_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.SITE_VISIT_SAVE_APPLICATION_AMEND_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.SITE_VISIT_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.SITE_VISIT_SAVE_REVIEW_GROUP_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.VIR_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.VIR_SAVE_APPLICATION_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.VIR_SAVE_RESPOND_TO_REGULATOR_COMMENTS_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.VIR_SAVE_REVIEW_PAYLOAD;
import static uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes.VIR_SUBMIT_RESPOND_TO_REGULATOR_COMMENTS_PAYLOAD;

@Component
public class RequestTaskActionPayloadTypesProvider implements JsonSubTypesProvider {

    @Override
    public List<NamedType> getTypes() {
        return List.of(
                new NamedType(AccountClosureSaveRequestTaskActionPayload.class, ACCOUNT_CLOSURE_SAVE_APPLICATION_PAYLOAD),

                //EMP_ISSUANCE
                new NamedType(EmpIssuanceSaveApplicationRequestTaskActionPayload.class, EMP_ISSUANCE_SAVE_APPLICATION_PAYLOAD),
                new NamedType(EmpIssuanceSaveApplicationRequestTaskActionPayload.class, EMP_ISSUANCE_IMPORT_THIRD_PARTY_DATA_APPLICATION_PAYLOAD),
                new NamedType(EmpIssuanceSaveApplicationReviewRequestTaskActionPayload.class, EMP_ISSUANCE_SAVE_APPLICATION_REVIEW_PAYLOAD),
                new NamedType(EmpIssuanceSaveReviewGroupDecisionRequestTaskActionPayload.class, EMP_ISSUANCE_SAVE_REVIEW_GROUP_DECISION_PAYLOAD),
                new NamedType(EmpIssuanceSaveReviewDeterminationRequestTaskActionPayload.class, EMP_ISSUANCE_SAVE_REVIEW_DETERMINATION_PAYLOAD),
                new NamedType(NotifyOperatorForDecisionRequestTaskActionPayload.class, EMP_ISSUANCE_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD),
                new NamedType(PeerReviewDecisionRequestTaskActionPayload.class, EMP_ISSUANCE_REVIEW_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD),
                new NamedType(PeerReviewRequestTaskActionPayload.class, EMP_ISSUANCE_REQUEST_PEER_REVIEW_PAYLOAD),
                new NamedType(EmpIssuanceSaveApplicationAmendRequestTaskActionPayload.class, EMP_ISSUANCE_SAVE_APPLICATION_AMEND_PAYLOAD),

                // EMP_NOTIFICATION
                new NamedType(EmpNotificationApplicationSaveRequestTaskActionPayload.class, EMP_NOTIFICATION_SAVE_APPLICATION_PAYLOAD),
                new NamedType(EmpNotificationSaveReviewGroupDecisionRequestTaskActionPayload.class, EMP_NOTIFICATION_SAVE_REVIEW_GROUP_DECISION_PAYLOAD),
                new NamedType(NotifyOperatorForDecisionRequestTaskActionPayload.class, EMP_NOTIFICATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD),
                new NamedType(PeerReviewRequestTaskActionPayload.class, EMP_NOTIFICATION_REQUEST_PEER_REVIEW_PAYLOAD),
                new NamedType(PeerReviewDecisionRequestTaskActionPayload.class, EMP_NOTIFICATION_REVIEW_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD),
                new NamedType(EmpNotificationFollowUpExtendDateRequestTaskActionPayload.class, EMP_NOTIFICATION_FOLLOW_UP_EXTEND_DATE_PAYLOAD),
                new NamedType(EmpNotificationFollowUpSaveResponseRequestTaskActionPayload.class, EMP_NOTIFICATION_FOLLOW_UP_SAVE_RESPONSE_PAYLOAD),
                new NamedType(EmpNotificationFollowUpSaveReviewDecisionRequestTaskActionPayload.class, EMP_NOTIFICATION_FOLLOW_UP_SAVE_REVIEW_DECISION_PAYLOAD),
                new NamedType(NotifyOperatorForDecisionRequestTaskActionPayload.class, EMP_NOTIFICATION_FOLLOW_UP_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD),
                new NamedType(EmpNotificationFollowUpSaveApplicationAmendRequestTaskActionPayload.class, EMP_NOTIFICATION_FOLLOW_UP_SAVE_APPLICATION_AMEND_PAYLOAD),

                // EMP_VARIATION
                new NamedType(EmpVariationSaveApplicationRequestTaskActionPayload.class, EMP_VARIATION_SAVE_APPLICATION_PAYLOAD),
                new NamedType(EmpVariationSaveApplicationRequestTaskActionPayload.class, EMP_VARIATION_IMPORT_THIRD_PARTY_DATA_APPLICATION_PAYLOAD),
                new NamedType(EmpVariationSaveApplicationReviewRequestTaskActionPayload.class, EMP_VARIATION_SAVE_APPLICATION_REVIEW_PAYLOAD),
                new NamedType(EmpVariationSaveDetailsReviewGroupDecisionRequestTaskActionPayload.class, EMP_VARIATION_SAVE_DETAILS_REVIEW_GROUP_DECISION_PAYLOAD),
                new NamedType(EmpVariationSaveReviewDeterminationRequestTaskActionPayload.class, EMP_VARIATION_SAVE_REVIEW_DETERMINATION_PAYLOAD),
                new NamedType(EmpVariationSaveReviewGroupDecisionRequestTaskActionPayload.class, EMP_VARIATION_SAVE_REVIEW_GROUP_DECISION_PAYLOAD),
                new NamedType(PeerReviewRequestTaskActionPayload.class, EMP_VARIATION_REQUEST_PEER_REVIEW_PAYLOAD),
                new NamedType(EmpVariationSaveApplicationRegulatorLedRequestTaskActionPayload.class, EMP_VARIATION_SAVE_APPLICATION_REGULATOR_LED_PAYLOAD),
                new NamedType(EmpVariationSaveReviewGroupDecisionRegulatorLedRequestTaskActionPayload.class, EMP_VARIATION_SAVE_REVIEW_GROUP_DECISION_REGULATOR_LED_PAYLOAD),
                new NamedType(PeerReviewDecisionRequestTaskActionPayload.class, EMP_VARIATION_REVIEW_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD),
                new NamedType(NotifyOperatorForDecisionRequestTaskActionPayload.class, EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_REGULATOR_LED_PAYLOAD),
                new NamedType(PeerReviewDecisionRequestTaskActionPayload.class, EMP_VARIATION_REVIEW_SUBMIT_PEER_REVIEW_DECISION_REGULATOR_LED_PAYLOAD),
                new NamedType(PeerReviewRequestTaskActionPayload.class, EMP_VARIATION_REQUEST_PEER_REVIEW_REGULATOR_LED_PAYLOAD),
                new NamedType(NotifyOperatorForDecisionRequestTaskActionPayload.class, EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD),
                new NamedType(EmpVariationSaveApplicationAmendRequestTaskActionPayload.class,EMP_VARIATION_SAVE_APPLICATION_AMEND_PAYLOAD),

                //AER
                new NamedType(AerSaveApplicationRequestTaskActionPayload.class, AER_SAVE_APPLICATION_PAYLOAD),
                new NamedType(AerImportThirdPartyDataRequestTaskActionPayload.class, AER_IMPORT_THIRD_PARTY_DATA_APPLICATION_PAYLOAD),
                new NamedType(AerVerificationImportThirdPartyDataRequestTaskActionPayload.class, AER_VERIFICATION_IMPORT_THIRD_PARTY_DATA_APPLICATION_PAYLOAD),
                new NamedType(AerSaveApplicationVerificationRequestTaskActionPayload.class, AER_SAVE_APPLICATION_VERIFICATION_PAYLOAD),
                new NamedType(AerVerificationReturnToOperatorRequestTaskActionPayload.class, AER_VERIFICATION_RETURN_TO_OPERATOR_PAYLOAD),
                new NamedType(AerSaveReviewGroupDecisionRequestTaskActionPayload.class, AER_SAVE_REVIEW_GROUP_DECISION_PAYLOAD),
                new NamedType(AerSaveApplicationAmendRequestTaskActionPayload.class, AER_SAVE_APPLICATION_AMEND_PAYLOAD),
                new NamedType(AerApplicationSkipReviewRequestTaskActionPayload.class, AER_SKIP_REVIEW_PAYLOAD),

                //DOE
                new NamedType(DoeSaveApplicationRequestTaskActionPayload.class, DOE_SAVE_APPLICATION_PAYLOAD),
                new NamedType(NotifyOperatorForDecisionRequestTaskActionPayload.class, DOE_SUBMIT_NOTIFY_OPERATOR_PAYLOAD),
                new NamedType(PeerReviewRequestTaskActionPayload.class, DOE_REQUEST_PEER_REVIEW_PAYLOAD),
                new NamedType(PeerReviewDecisionRequestTaskActionPayload.class, DOE_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD),

                //VIR
                new NamedType(VirSaveApplicationRequestTaskActionPayload.class, VIR_SAVE_APPLICATION_PAYLOAD),
                new NamedType(VirSaveReviewRequestTaskActionPayload.class, VIR_SAVE_REVIEW_PAYLOAD),
                new NamedType(NotifyOperatorForDecisionRequestTaskActionPayload.class, VIR_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD),
                new NamedType(VirSubmitRespondToRegulatorCommentsRequestTaskActionPayload.class, VIR_SUBMIT_RESPOND_TO_REGULATOR_COMMENTS_PAYLOAD),
                new NamedType(VirSaveRespondToRegulatorCommentsRequestTaskActionPayload.class, VIR_SAVE_RESPOND_TO_REGULATOR_COMMENTS_PAYLOAD),

                //NON_COMPLIANCE
                new NamedType(NonComplianceSaveApplicationRequestTaskActionPayload.class, NON_COMPLIANCE_SAVE_APPLICATION_PAYLOAD),
                new NamedType(NonComplianceInitialPenaltyNoticeSaveApplicationRequestTaskActionPayload.class, NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_SAVE_APPLICATION_PAYLOAD),
                new NamedType(PeerReviewRequestTaskActionPayload.class, NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_REQUEST_PEER_REVIEW_PAYLOAD),
                new NamedType(PeerReviewDecisionRequestTaskActionPayload.class, NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD),
                new NamedType(NonComplianceNotifyOperatorRequestTaskActionPayload.class, NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_NOTIFY_OPERATOR_PAYLOAD),
                new NamedType(NonComplianceNoticeOfIntentSaveApplicationRequestTaskActionPayload.class, NON_COMPLIANCE_NOTICE_OF_INTENT_SAVE_APPLICATION_PAYLOAD),
                new NamedType(PeerReviewRequestTaskActionPayload.class, NON_COMPLIANCE_NOTICE_OF_INTENT_REQUEST_PEER_REVIEW_PAYLOAD),
                new NamedType(PeerReviewDecisionRequestTaskActionPayload.class, NON_COMPLIANCE_NOTICE_OF_INTENT_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD),
                new NamedType(NonComplianceNotifyOperatorRequestTaskActionPayload.class, NON_COMPLIANCE_NOTICE_OF_INTENT_NOTIFY_OPERATOR_PAYLOAD),
                new NamedType(NonComplianceCivilPenaltySaveApplicationRequestTaskActionPayload.class, NON_COMPLIANCE_CIVIL_PENALTY_SAVE_APPLICATION_PAYLOAD),
                new NamedType(NonComplianceNotifyOperatorRequestTaskActionPayload.class, NON_COMPLIANCE_CIVIL_PENALTY_NOTIFY_OPERATOR_PAYLOAD),
                new NamedType(PeerReviewRequestTaskActionPayload.class, NON_COMPLIANCE_CIVIL_PENALTY_REQUEST_PEER_REVIEW_PAYLOAD),
                new NamedType(PeerReviewDecisionRequestTaskActionPayload.class, NON_COMPLIANCE_CIVIL_PENALTY_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD),
                new NamedType(NonComplianceFinalDeterminationSaveApplicationRequestTaskActionPayload.class, NON_COMPLIANCE_FINAL_DETERMINATION_SAVE_APPLICATION_PAYLOAD),
                new NamedType(NonComplianceCloseApplicationRequestTaskActionPayload.class, NON_COMPLIANCE_CLOSE_APPLICATION_PAYLOAD),
                new NamedType(NonComplianceAmendDetailsRequestTaskActionPayload.class, NON_COMPLIANCE_AMEND_DETAILS_PAYLOAD),

                // SITE_VISIT
                new NamedType(SiteVisitApplicationSaveRequestTaskActionPayload.class, SITE_VISIT_SAVE_APPLICATION_PAYLOAD),
                new NamedType(SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload.class, SITE_VISIT_SAVE_REVIEW_GROUP_DECISION_PAYLOAD),
                new NamedType(PeerReviewRequestTaskActionPayload.class, SITE_VISIT_REQUEST_PEER_REVIEW_PAYLOAD),
                new NamedType(PeerReviewDecisionRequestTaskActionPayload.class, SITE_VISIT_REVIEW_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD),
                new NamedType(SiteVisitSaveApplicationAmendRequestTaskActionPayload.class, SITE_VISIT_SAVE_APPLICATION_AMEND_PAYLOAD),
                new NamedType(NotifyOperatorForDecisionRequestTaskActionPayload.class, SITE_VISIT_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD)
        );
    }

}
