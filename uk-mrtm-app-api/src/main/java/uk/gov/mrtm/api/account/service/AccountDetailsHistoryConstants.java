package uk.gov.mrtm.api.account.service;

import lombok.experimental.UtilityClass;

@UtilityClass
public class AccountDetailsHistoryConstants {

    public static final String SUBMITTED_BY_SYSTEM = "SYSTEM";
    public static final String WORKFLOW_NAME_EMP_ISSUANCE = "Emissions monitoring plan";
    public static final String WORKFLOW_NAME_EMP_VARIATION = "EMP variation";
    public static final String REASON_REGISTRY_SET_OPERATOR = "Updated automatically from the Registry";

    public static String updatedThroughWorkflow(String workflowName, String workflowId) {
        return String.format("Updated through %s %s", workflowName, workflowId);
    }
}
