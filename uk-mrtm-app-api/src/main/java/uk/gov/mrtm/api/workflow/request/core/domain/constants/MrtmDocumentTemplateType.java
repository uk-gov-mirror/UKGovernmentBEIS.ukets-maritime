package uk.gov.mrtm.api.workflow.request.core.domain.constants;

import lombok.experimental.UtilityClass;

@UtilityClass
public class MrtmDocumentTemplateType {
    /**
     * EMP_NOTIFICATION
     */
    public static final String EMP_NOTIFICATION_REFUSED = "EMP_NOTIFICATION_REFUSED";
    public static final String EMP_NOTIFICATION_ACCEPTED = "EMP_NOTIFICATION_ACCEPTED";

    /**
     * EMP
     */
    public static final String EMP = "EMP";
    public static final String EMP_ISSUANCE_GRANTED = "EMP_ISSUANCE_GRANTED";
    public static final String EMP_ISSUANCE_DEEMED_WITHDRAWN = "EMP_ISSUANCE_DEEMED_WITHDRAWN";
    public static final String EMP_REISSUE = "EMP_REISSUE";

    /**
     * EMP VARIATION
     */
    public static final String EMP_VARIATION_REGULATOR_LED_APPROVED = "EMP_VARIATION_REGULATOR_LED_APPROVED";
    public static final String EMP_VARIATION_ACCEPTED = "EMP_VARIATION_ACCEPTED";
    public static final String EMP_VARIATION_REJECTED = "EMP_VARIATION_REJECTED";
    public static final String EMP_VARIATION_DEEMED_WITHDRAWN = "EMP_VARIATION_DEEMED_WITHDRAWN";

    /**
     * DOE
     */
    public static final String DOE_SUBMITTED = "DOE_SUBMITTED";
    public static final String DOE_EFSN_SUBMITTED = "DOE_EFSN_SUBMITTED";

    /**
     * VIR
     */
    public static final String VIR_REVIEWED = "VIR_REVIEWED";

    /**
     * SITE_VISIT
     */
    public static final String SITE_VISIT_APPROVED = "SITE_VISIT_APPROVED";
    public static final String SITE_VISIT_REJECTED = "SITE_VISIT_REJECTED";

}
