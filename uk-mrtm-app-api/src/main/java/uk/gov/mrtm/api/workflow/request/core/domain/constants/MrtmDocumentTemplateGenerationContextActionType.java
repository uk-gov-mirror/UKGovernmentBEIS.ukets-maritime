package uk.gov.mrtm.api.workflow.request.core.domain.constants;

import lombok.experimental.UtilityClass;

@UtilityClass
public class MrtmDocumentTemplateGenerationContextActionType {
    /**
     * EMP_NOTIFICATION
     */
    public static final String EMP_NOTIFICATION_GRANTED = "EMP_NOTIFICATION_GRANTED";
    public static final String EMP_NOTIFICATION_REJECTED = "EMP_NOTIFICATION_REJECTED";
    public static final String EMP_VARIATION_ACCEPTED = "EMP_VARIATION_ACCEPTED";
    public static final String EMP_VARIATION_REJECTED = "EMP_VARIATION_REJECTED";
    public static final String EMP_VARIATION_DEEMED_WITHDRAWN = "EMP_VARIATION_DEEMED_WITHDRAWN";
    public static final String EMP_VARIATION_REGULATOR_LED_APPROVED = "EMP_VARIATION_REGULATOR_LED_APPROVED";
    public static final String EMP_ISSUANCE_GRANTED = "EMP_ISSUANCE_GRANTED";
    public static final String EMP_ISSUANCE_DEEMED_WITHDRAWN = "EMP_ISSUANCE_DEEMED_WITHDRAWN";
    public static final String EMP_REISSUE = "EMP_REISSUE";

    /**
     * DOE
     */
    public static final String DOE_SUBMIT = "DOE_SUBMIT";

    /**
     * VIR
     */
    public static final String VIR_REVIEWED = "VIR_REVIEWED";

    /**
     * SITE_VISIT
     */
    public static final String SITE_VISIT = "SITE_VISIT";
}
