package uk.gov.mrtm.api.workflow.request.flow.common.constants;

import lombok.experimental.UtilityClass;

import static uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants._EXPIRATION_DATE;

@UtilityClass
public class MrtmBpmnProcessConstants {
    public static final String NOTIFICATION_OUTCOME = "notificationOutcome";
    public static final String FOLLOW_UP_RESPONSE_NEEDED = "followUpResponseNeeded";
    public static final String FOLLOW_UP_RESPONSE_EXPIRATION_DATE = "followUpResponseExpirationDate";
    public static final String FOLLOW_UP_TIMER_EXTENDED = "followUpTimerExtended";
    
    public static final String EMP_VARIATION_SUBMIT_OUTCOME = "empVariationSubmitOutcome";
    public static final String BATCH_NUMBER_OF_ACCOUNTS_COMPLETED = "batchAccountsCompleted";
    public static final String EMP_REISSUE_REQUEST_ID = "empReissueRequestId";
    public static final String EMP_REISSUE_REQUEST_SUCCEEDED = "empReissueRequestSucceeded";
    public static final String EMP_BATCH_REQUEST_BUSINESS_KEY = "empBatchRequestBusinessKey";

    //AER
    public static final String AER_EXPIRATION_DATE = MrtmRequestExpirationType.AER + _EXPIRATION_DATE;
    public static final String AER_YEAR = "aerYear";
    public static final String AER_OUTCOME = "aerOutcome";

    public static final String AER_REVIEW_OUTCOME = "aerReviewOutcome";

    // DOE
    public static final String DOE_SUBMIT_OUTCOME = "doeSubmitOutcome";
    public static final String DOE_IS_PAYMENT_REQUIRED = "paymentRequired";

    //VIR
    public static final String VIR_EXPIRATION_DATE = MrtmRequestExpirationType.VIR + _EXPIRATION_DATE;
    public static final String VIR_NEEDS_IMPROVEMENTS = "virNeedsImprovements";
    public static final String VIR_RESPONSE_COMMENT_SUBMITTED = "virResponseCommentSubmitted";

    //NON_COMPLIANCE
    public static final String NON_COMPLIANCE_OUTCOME = "nonComplianceOutcome";
    public static final String CIVIL_PENALTY_LIABLE = "civilPenaltyLiable";
    public static final String INITIAL_PENALTY_LIABLE = "initialPenaltyLiable";
    public static final String NOI_PENALTY_LIABLE = "noiPenaltyLiable";

    //SITE_VISIT
    public static final String SITE_VISIT_SUBMIT_OUTCOME = "siteVisitSubmitOutcome";

}
