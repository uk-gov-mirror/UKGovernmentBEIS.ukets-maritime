package uk.gov.mrtm.api.authorization.mrtmauth.regulator.transform;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.authorization.mrtmauth.core.domain.MrtmPermission;
import uk.gov.netz.api.authorization.regulator.domain.RegulatorPermissionGroupLevel;
import uk.gov.netz.api.authorization.regulator.transform.AbstarctRegulatorPermissionsAdapter;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.ACCOUNT_CLOSURE;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.ANNUAL_IMPROVEMENT_REPORT;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.MANAGE_GUIDANCE;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.MANAGE_THIRD_PARTY_DATA_PROVIDERS;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.PEER_REVIEW_DOE;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.PEER_REVIEW_EMP_APPLICATION;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.PEER_REVIEW_EMP_NOTIFICATION;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.PEER_REVIEW_EMP_VARIATION;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.PEER_REVIEW_NON_COMPLIANCE;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.PEER_REVIEW_SITE_VISIT;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.REVIEW_AER;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.REVIEW_EMP_APPLICATION;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.REVIEW_EMP_NOTIFICATION;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.REVIEW_SITE_VISIT;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.REVIEW_VIR;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.SUBMIT_DOE;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.SUBMIT_EMP_BATCH_REISSUE;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.SUBMIT_NON_COMPLIANCE;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.SUBMIT_REVIEW_EMP_VARIATION;
import static uk.gov.netz.api.authorization.core.domain.Permission.PERM_ACCOUNT_USERS_EDIT;
import static uk.gov.netz.api.authorization.core.domain.Permission.PERM_CA_USERS_EDIT;
import static uk.gov.netz.api.authorization.core.domain.Permission.PERM_TASK_ASSIGNMENT;
import static uk.gov.netz.api.authorization.core.domain.Permission.PERM_VB_MANAGE;
import static uk.gov.netz.api.authorization.regulator.domain.RegulatorPermissionGroup.ADD_OPERATOR_ADMIN;
import static uk.gov.netz.api.authorization.regulator.domain.RegulatorPermissionGroup.ASSIGN_REASSIGN_TASKS;
import static uk.gov.netz.api.authorization.regulator.domain.RegulatorPermissionGroup.MANAGE_USERS_AND_CONTACTS;
import static uk.gov.netz.api.authorization.regulator.domain.RegulatorPermissionGroup.MANAGE_VERIFICATION_BODIES;
import static uk.gov.netz.api.authorization.regulator.domain.RegulatorPermissionLevel.EXECUTE;
import static uk.gov.netz.api.authorization.regulator.domain.RegulatorPermissionLevel.NONE;
import static uk.gov.netz.api.authorization.regulator.domain.RegulatorPermissionLevel.VIEW_ONLY;

@Component
public class MrtmRegulatorPermissionsAdapter extends AbstarctRegulatorPermissionsAdapter implements InitializingBean {
    private final Map<RegulatorPermissionGroupLevel, List<String>> permissionGroupLevelsConfig = new LinkedHashMap<>();

    @Override
    public void afterPropertiesSet() {
        //MANAGE_USERS_AND_CONTACTS
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(MANAGE_USERS_AND_CONTACTS, NONE),
                        Collections.emptyList());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(MANAGE_USERS_AND_CONTACTS, EXECUTE),
                        List.of(PERM_CA_USERS_EDIT));

        //ADD_OPERATOR_ADMIN
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(ADD_OPERATOR_ADMIN, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(ADD_OPERATOR_ADMIN, EXECUTE),
                        List.of(PERM_ACCOUNT_USERS_EDIT));

        //MANAGE_VERIFICATION_BODIES
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(MANAGE_VERIFICATION_BODIES, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(MANAGE_VERIFICATION_BODIES, EXECUTE),
                        List.of(PERM_VB_MANAGE));

        //ASSIGN_REASSIGN TASKS
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(ASSIGN_REASSIGN_TASKS, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(ASSIGN_REASSIGN_TASKS, EXECUTE),
                        List.of(PERM_TASK_ASSIGNMENT));

        // REVIEW_EMP_APPLICATION
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_EMP_APPLICATION, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_EMP_APPLICATION, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_EMP_APPLICATION, EXECUTE),
                        List.of(MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_VIEW_TASK,
                                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_EXECUTE_TASK));

        // PEER_REVIEW_EMP_APPLICATION
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_EMP_APPLICATION, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_EMP_APPLICATION, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_PEER_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_EMP_APPLICATION, EXECUTE),
                        List.of(MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_PEER_REVIEW_VIEW_TASK,
                                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_PEER_REVIEW_EXECUTE_TASK));

        // SUBMIT_REVIEW_EMP_VARIATION
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(SUBMIT_REVIEW_EMP_VARIATION, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(SUBMIT_REVIEW_EMP_VARIATION, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_EMP_VARIATION_SUBMIT_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(SUBMIT_REVIEW_EMP_VARIATION, EXECUTE),
                        List.of(MrtmPermission.PERM_EMP_VARIATION_SUBMIT_REVIEW_VIEW_TASK,
                                MrtmPermission.PERM_EMP_VARIATION_SUBMIT_REVIEW_EXECUTE_TASK));

        // PEER_REVIEW_EMP_VARIATION
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_EMP_VARIATION, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_EMP_VARIATION, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_EMP_VARIATION_PEER_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_EMP_VARIATION, EXECUTE),
                        List.of(MrtmPermission.PERM_EMP_VARIATION_PEER_REVIEW_VIEW_TASK,
                                MrtmPermission.PERM_EMP_VARIATION_PEER_REVIEW_EXECUTE_TASK));

        // REVIEW_EMP_NOTIFICATION
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_EMP_NOTIFICATION, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_EMP_NOTIFICATION, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_EMP_NOTIFICATION_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_EMP_NOTIFICATION, EXECUTE),
                        List.of(MrtmPermission.PERM_EMP_NOTIFICATION_REVIEW_VIEW_TASK,
                                MrtmPermission.PERM_EMP_NOTIFICATION_REVIEW_EXECUTE_TASK));

        // PEER_REVIEW_EMP_NOTIFICATION
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_EMP_NOTIFICATION, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_EMP_NOTIFICATION, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_EMP_NOTIFICATION_PEER_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_EMP_NOTIFICATION, EXECUTE),
                        List.of(MrtmPermission.PERM_EMP_NOTIFICATION_PEER_REVIEW_VIEW_TASK,
                                MrtmPermission.PERM_EMP_NOTIFICATION_PEER_REVIEW_EXECUTE_TASK));

        // SUBMIT_DOE
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(SUBMIT_DOE, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(SUBMIT_DOE, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_DOE_APPLICATION_SUBMIT_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(SUBMIT_DOE, EXECUTE),
                        List.of(MrtmPermission.PERM_DOE_APPLICATION_SUBMIT_VIEW_TASK,
                                MrtmPermission.PERM_DOE_APPLICATION_SUBMIT_EXECUTE_TASK));

        // PEER_REVIEW_DOE
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_DOE, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_DOE, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_DOE_PEER_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_DOE, EXECUTE),
                        List.of(MrtmPermission.PERM_DOE_PEER_REVIEW_VIEW_TASK, MrtmPermission.PERM_DOE_PEER_REVIEW_EXECUTE_TASK));

        // REVIEW_AER
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_AER, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_AER, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_AER_APPLICATION_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_AER, EXECUTE),
                        List.of(MrtmPermission.PERM_AER_APPLICATION_REVIEW_VIEW_TASK,
                                MrtmPermission.PERM_AER_APPLICATION_REVIEW_EXECUTE_TASK));

        // REVIEW_VIR
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_VIR, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_VIR, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_VIR_APPLICATION_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(REVIEW_VIR, EXECUTE),
                        List.of(MrtmPermission.PERM_VIR_APPLICATION_REVIEW_VIEW_TASK,
                                MrtmPermission.PERM_VIR_APPLICATION_REVIEW_EXECUTE_TASK));

        // SUBMIT_NON_COMPLIANCE
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(SUBMIT_NON_COMPLIANCE, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(SUBMIT_NON_COMPLIANCE, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_NON_COMPLIANCE_SUBMIT_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(SUBMIT_NON_COMPLIANCE, EXECUTE),
                        List.of(MrtmPermission.PERM_NON_COMPLIANCE_SUBMIT_VIEW_TASK, MrtmPermission.PERM_NON_COMPLIANCE_SUBMIT_EXECUTE_TASK));

        // PEER_REVIEW_NON_COMPLIANCE
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_NON_COMPLIANCE, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_NON_COMPLIANCE, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_NON_COMPLIANCE_PEER_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_NON_COMPLIANCE, EXECUTE),
                        List.of(MrtmPermission.PERM_NON_COMPLIANCE_PEER_REVIEW_VIEW_TASK,
                                MrtmPermission.PERM_NON_COMPLIANCE_PEER_REVIEW_EXECUTE_TASK));

        // SUBMIT_EMP_BATCH_REISSUE
        permissionGroupLevelsConfig.put(
                new RegulatorPermissionGroupLevel(SUBMIT_EMP_BATCH_REISSUE, NONE),
                List.of());
        permissionGroupLevelsConfig.put(
                new RegulatorPermissionGroupLevel(SUBMIT_EMP_BATCH_REISSUE, VIEW_ONLY),
                List.of(MrtmPermission.PERM_EMP_BATCH_REISSUE_SUBMIT_VIEW_TASK));
        permissionGroupLevelsConfig.put(
                new RegulatorPermissionGroupLevel(SUBMIT_EMP_BATCH_REISSUE, EXECUTE),
                List.of(MrtmPermission.PERM_EMP_BATCH_REISSUE_SUBMIT_VIEW_TASK,
                        MrtmPermission.PERM_EMP_BATCH_REISSUE_SUBMIT_EXECUTE_TASK));

        // ANNUAL_IMPROVEMENT_REPORT
        permissionGroupLevelsConfig.put(
                new RegulatorPermissionGroupLevel(ANNUAL_IMPROVEMENT_REPORT, NONE),
                List.of());
        permissionGroupLevelsConfig.put(
                new RegulatorPermissionGroupLevel(ANNUAL_IMPROVEMENT_REPORT, VIEW_ONLY),
                List.of(MrtmPermission.PERM_ANNUAL_IMPROVEMENT_REPORT_VIEW_TASK));
        permissionGroupLevelsConfig.put(
                new RegulatorPermissionGroupLevel(ANNUAL_IMPROVEMENT_REPORT, EXECUTE),
                List.of(MrtmPermission.PERM_ANNUAL_IMPROVEMENT_REPORT_VIEW_TASK,
                        MrtmPermission.PERM_ANNUAL_IMPROVEMENT_REPORT_EXECUTE_TASK));

        // ACCOUNT_CLOSURE
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(ACCOUNT_CLOSURE, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(ACCOUNT_CLOSURE, VIEW_ONLY),
                        List.of(MrtmPermission.PERM_ACCOUNT_CLOSURE_SUBMIT_VIEW_TASK));
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(ACCOUNT_CLOSURE, EXECUTE),
                        List.of(MrtmPermission.PERM_ACCOUNT_CLOSURE_SUBMIT_VIEW_TASK,
                                MrtmPermission.PERM_ACCOUNT_CLOSURE_SUBMIT_EXECUTE_TASK));

        //MANAGE_GUIDANCE
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(MANAGE_GUIDANCE, NONE), List.of());
        permissionGroupLevelsConfig
                .put(new RegulatorPermissionGroupLevel(MANAGE_GUIDANCE, EXECUTE),
                        List.of(MrtmPermission.PERM_MANAGE_GUIDANCE));

        //THIRD_PARTY_DATA_PROVIDERS
        permissionGroupLevelsConfig
            .put(new RegulatorPermissionGroupLevel(MANAGE_THIRD_PARTY_DATA_PROVIDERS, NONE), List.of());
        permissionGroupLevelsConfig
            .put(new RegulatorPermissionGroupLevel(MANAGE_THIRD_PARTY_DATA_PROVIDERS, EXECUTE),
                List.of(MrtmPermission.PERM_MANAGE_THIRD_PARTY_DATA_PROVIDERS));

        // REVIEW_SITE_VISIT
        permissionGroupLevelsConfig
            .put(new RegulatorPermissionGroupLevel(REVIEW_SITE_VISIT, NONE), List.of());
        permissionGroupLevelsConfig
            .put(new RegulatorPermissionGroupLevel(REVIEW_SITE_VISIT, VIEW_ONLY),
                List.of(MrtmPermission.PERM_SITE_VISIT_APPLICATION_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
            .put(new RegulatorPermissionGroupLevel(REVIEW_SITE_VISIT, EXECUTE),
                List.of(MrtmPermission.PERM_SITE_VISIT_APPLICATION_REVIEW_VIEW_TASK,
                    MrtmPermission.PERM_SITE_VISIT_APPLICATION_REVIEW_EXECUTE_TASK));

        // PEER_REVIEW_SITE_VISIT
        permissionGroupLevelsConfig
            .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_SITE_VISIT, NONE), List.of());
        permissionGroupLevelsConfig
            .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_SITE_VISIT, VIEW_ONLY),
                List.of(MrtmPermission.PERM_SITE_VISIT_PEER_REVIEW_VIEW_TASK));
        permissionGroupLevelsConfig
            .put(new RegulatorPermissionGroupLevel(PEER_REVIEW_SITE_VISIT, EXECUTE),
                List.of(MrtmPermission.PERM_SITE_VISIT_PEER_REVIEW_VIEW_TASK,
                    MrtmPermission.PERM_SITE_VISIT_PEER_REVIEW_EXECUTE_TASK));
    }


    @Override
    public Map<RegulatorPermissionGroupLevel, List<String>> getPermissionGroupLevelsConfig() {
        return permissionGroupLevelsConfig;
    }
}
