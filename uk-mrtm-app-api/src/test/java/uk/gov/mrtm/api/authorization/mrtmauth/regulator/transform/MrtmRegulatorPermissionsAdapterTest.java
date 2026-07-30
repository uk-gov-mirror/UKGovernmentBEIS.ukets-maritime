package uk.gov.mrtm.api.authorization.mrtmauth.regulator.transform;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.authorization.mrtmauth.core.domain.MrtmPermission;
import uk.gov.netz.api.authorization.regulator.domain.RegulatorPermissionLevel;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
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
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.SUBMIT_NON_COMPLIANCE;
import static uk.gov.mrtm.api.authorization.mrtmauth.regulator.domain.MrtmRegulatorPermissionGroup.SUBMIT_EMP_BATCH_REISSUE;
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

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith(MockitoExtension.class)
class MrtmRegulatorPermissionsAdapterTest {
    private MrtmRegulatorPermissionsAdapter regulatorPermissionsAdapter;

    @BeforeAll
    void beforeAll() {
        regulatorPermissionsAdapter = new MrtmRegulatorPermissionsAdapter();
        regulatorPermissionsAdapter.afterPropertiesSet();
    }
    @Test
    void getPermissionsFromPermissionGroupLevels_one_permission_per_group_level() {
        Map<String, RegulatorPermissionLevel> permissionGroupLevels =
                Map.of(MANAGE_USERS_AND_CONTACTS, NONE,
                        ADD_OPERATOR_ADMIN, NONE,
                        ASSIGN_REASSIGN_TASKS, EXECUTE);

        List<String> expectedPermissions = List.of(
                PERM_TASK_ASSIGNMENT);

        assertThat(regulatorPermissionsAdapter.getPermissionsFromPermissionGroupLevels(permissionGroupLevels))
                .containsExactlyInAnyOrderElementsOf(expectedPermissions);
    }

    @Test
    void getPermissionsFromPermissionGroupLevels_multiple_permissions_per_group_level() {
        Map<String, RegulatorPermissionLevel> permissionGroupLevels =
                Map.of(REVIEW_EMP_APPLICATION, EXECUTE,
                        MANAGE_USERS_AND_CONTACTS, NONE,
                        ADD_OPERATOR_ADMIN, NONE,
                        ASSIGN_REASSIGN_TASKS, EXECUTE);

        List<String> expectedPermissions = List.of(
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_EXECUTE_TASK,
                PERM_TASK_ASSIGNMENT);

        assertThat(regulatorPermissionsAdapter.getPermissionsFromPermissionGroupLevels(permissionGroupLevels))
                .containsExactlyInAnyOrderElementsOf(expectedPermissions);
    }

    @Test
    void getPermissionsFromPermissionGroupLevels_multiple_permissions() {
        Map<String, RegulatorPermissionLevel> permissionGroupLevels = Map.ofEntries(
                Map.entry(MANAGE_USERS_AND_CONTACTS, EXECUTE),
                Map.entry(ADD_OPERATOR_ADMIN, EXECUTE),
                Map.entry(ASSIGN_REASSIGN_TASKS, EXECUTE),
                Map.entry(MANAGE_VERIFICATION_BODIES, EXECUTE),
                Map.entry(REVIEW_EMP_APPLICATION, EXECUTE),
                Map.entry(PEER_REVIEW_EMP_APPLICATION, EXECUTE),
                Map.entry(REVIEW_EMP_NOTIFICATION, EXECUTE),
                Map.entry(PEER_REVIEW_EMP_NOTIFICATION, EXECUTE),
                Map.entry(SUBMIT_REVIEW_EMP_VARIATION, EXECUTE),
                Map.entry(PEER_REVIEW_EMP_VARIATION, EXECUTE),
                Map.entry(SUBMIT_DOE, EXECUTE),
                Map.entry(PEER_REVIEW_DOE, EXECUTE),
                Map.entry(REVIEW_AER, EXECUTE),
                Map.entry(REVIEW_VIR, EXECUTE),
                Map.entry(SUBMIT_NON_COMPLIANCE, EXECUTE),
                Map.entry(PEER_REVIEW_NON_COMPLIANCE, EXECUTE),
                Map.entry(SUBMIT_EMP_BATCH_REISSUE, EXECUTE),
                Map.entry(ANNUAL_IMPROVEMENT_REPORT, EXECUTE),
                Map.entry(ACCOUNT_CLOSURE, EXECUTE));

        List<String> expectedPermissions = List.of(
                PERM_ACCOUNT_USERS_EDIT,
                PERM_CA_USERS_EDIT,
                PERM_TASK_ASSIGNMENT,
                PERM_VB_MANAGE,
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_PEER_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_PEER_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_EMP_VARIATION_SUBMIT_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_VARIATION_SUBMIT_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_EMP_VARIATION_PEER_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_VARIATION_PEER_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_EMP_NOTIFICATION_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_NOTIFICATION_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_EMP_NOTIFICATION_PEER_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_NOTIFICATION_PEER_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_DOE_APPLICATION_SUBMIT_VIEW_TASK,
                MrtmPermission.PERM_DOE_APPLICATION_SUBMIT_EXECUTE_TASK,
                MrtmPermission.PERM_DOE_PEER_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_DOE_PEER_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_AER_APPLICATION_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_AER_APPLICATION_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_VIR_APPLICATION_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_VIR_APPLICATION_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_NON_COMPLIANCE_SUBMIT_VIEW_TASK,
                MrtmPermission.PERM_NON_COMPLIANCE_SUBMIT_EXECUTE_TASK,
                MrtmPermission.PERM_NON_COMPLIANCE_PEER_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_NON_COMPLIANCE_PEER_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_EMP_BATCH_REISSUE_SUBMIT_VIEW_TASK,
                MrtmPermission.PERM_EMP_BATCH_REISSUE_SUBMIT_EXECUTE_TASK,
                MrtmPermission.PERM_ANNUAL_IMPROVEMENT_REPORT_VIEW_TASK,
                MrtmPermission.PERM_ANNUAL_IMPROVEMENT_REPORT_EXECUTE_TASK,
                MrtmPermission.PERM_ACCOUNT_CLOSURE_SUBMIT_VIEW_TASK,
                MrtmPermission.PERM_ACCOUNT_CLOSURE_SUBMIT_EXECUTE_TASK);

        assertThat(regulatorPermissionsAdapter.getPermissionsFromPermissionGroupLevels(permissionGroupLevels))
                .containsExactlyInAnyOrderElementsOf(expectedPermissions);
    }

    @Test
    void getPermissionGroupLevelsFromPermissions_one_permission_per_group_level() {
        List<String> permissions = List.of(
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_VIEW_TASK,
                PERM_TASK_ASSIGNMENT);

        Map<String, RegulatorPermissionLevel> expectedPermissionGroupLevels = new LinkedHashMap<>();
        expectedPermissionGroupLevels.put(REVIEW_EMP_APPLICATION, VIEW_ONLY);
        expectedPermissionGroupLevels.put(MANAGE_USERS_AND_CONTACTS, NONE);
        expectedPermissionGroupLevels.put(ASSIGN_REASSIGN_TASKS, EXECUTE);
        expectedPermissionGroupLevels.put(ADD_OPERATOR_ADMIN, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_APPLICATION, NONE);
        expectedPermissionGroupLevels.put(SUBMIT_REVIEW_EMP_VARIATION, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_VARIATION, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_NOTIFICATION, NONE);
        expectedPermissionGroupLevels.put(REVIEW_EMP_NOTIFICATION, NONE);
        expectedPermissionGroupLevels.put(SUBMIT_DOE, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_DOE, NONE);
        expectedPermissionGroupLevels.put(REVIEW_AER, NONE);
        expectedPermissionGroupLevels.put(REVIEW_VIR, NONE);
        expectedPermissionGroupLevels.put(SUBMIT_NON_COMPLIANCE, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_NON_COMPLIANCE, NONE);
        expectedPermissionGroupLevels.put(SUBMIT_EMP_BATCH_REISSUE, NONE);
        expectedPermissionGroupLevels.put(ANNUAL_IMPROVEMENT_REPORT, NONE);
        expectedPermissionGroupLevels.put(ACCOUNT_CLOSURE, NONE);
        expectedPermissionGroupLevels.put(MANAGE_VERIFICATION_BODIES, NONE);
        expectedPermissionGroupLevels.put(MANAGE_GUIDANCE, NONE);
        expectedPermissionGroupLevels.put(MANAGE_THIRD_PARTY_DATA_PROVIDERS, NONE);
        expectedPermissionGroupLevels.put(REVIEW_SITE_VISIT, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_SITE_VISIT, NONE);

        assertThat(regulatorPermissionsAdapter.getPermissionGroupLevelsFromPermissions(permissions))
                .containsExactlyInAnyOrderEntriesOf(expectedPermissionGroupLevels);
    }

    @Test
    void getPermissionGroupLevelsFromPermissions_multiple_permissions_per_group_level() {
        List<String> permissions = List.of(
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_EXECUTE_TASK,
                PERM_TASK_ASSIGNMENT);

        Map<String, RegulatorPermissionLevel> expectedPermissionGroupLevels = new LinkedHashMap<>();
        expectedPermissionGroupLevels.put(REVIEW_EMP_APPLICATION, EXECUTE);
        expectedPermissionGroupLevels.put(MANAGE_USERS_AND_CONTACTS, NONE);
        expectedPermissionGroupLevels.put(ASSIGN_REASSIGN_TASKS, EXECUTE);
        expectedPermissionGroupLevels.put(ADD_OPERATOR_ADMIN, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_APPLICATION, NONE);
        expectedPermissionGroupLevels.put(SUBMIT_REVIEW_EMP_VARIATION, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_VARIATION, NONE);
        expectedPermissionGroupLevels.put(REVIEW_EMP_NOTIFICATION, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_NOTIFICATION, NONE);
        expectedPermissionGroupLevels.put(SUBMIT_DOE, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_DOE, NONE);
        expectedPermissionGroupLevels.put(REVIEW_AER, NONE);
        expectedPermissionGroupLevels.put(REVIEW_VIR, NONE);
        expectedPermissionGroupLevels.put(SUBMIT_NON_COMPLIANCE, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_NON_COMPLIANCE, NONE);
        expectedPermissionGroupLevels.put(SUBMIT_EMP_BATCH_REISSUE, NONE);
        expectedPermissionGroupLevels.put(ANNUAL_IMPROVEMENT_REPORT, NONE);
        expectedPermissionGroupLevels.put(ACCOUNT_CLOSURE, NONE);
        expectedPermissionGroupLevels.put(MANAGE_VERIFICATION_BODIES, NONE);
        expectedPermissionGroupLevels.put(MANAGE_GUIDANCE, NONE);
        expectedPermissionGroupLevels.put(MANAGE_THIRD_PARTY_DATA_PROVIDERS, NONE);
        expectedPermissionGroupLevels.put(REVIEW_SITE_VISIT, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_SITE_VISIT, NONE);

        assertThat(regulatorPermissionsAdapter.getPermissionGroupLevelsFromPermissions(permissions))
                .containsExactlyInAnyOrderEntriesOf(expectedPermissionGroupLevels);
    }

    @Test
    void getPermissionGroupLevelsFromPermissions() {
        List<String> permissions = List.of(
                PERM_ACCOUNT_USERS_EDIT,
                PERM_TASK_ASSIGNMENT,
                PERM_CA_USERS_EDIT,
                PERM_VB_MANAGE,
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_PEER_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_ISSUANCE_APPLICATION_PEER_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_EMP_VARIATION_SUBMIT_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_VARIATION_SUBMIT_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_EMP_VARIATION_PEER_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_VARIATION_PEER_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_EMP_NOTIFICATION_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_NOTIFICATION_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_EMP_NOTIFICATION_PEER_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_EMP_NOTIFICATION_PEER_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_DOE_APPLICATION_SUBMIT_VIEW_TASK,
                MrtmPermission.PERM_DOE_APPLICATION_SUBMIT_EXECUTE_TASK,
                MrtmPermission.PERM_DOE_PEER_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_DOE_PEER_REVIEW_EXECUTE_TASK,
                MrtmPermission.PERM_AER_APPLICATION_REVIEW_VIEW_TASK,
                MrtmPermission.PERM_AER_APPLICATION_REVIEW_EXECUTE_TASK);

        Map<String, RegulatorPermissionLevel> expectedPermissionGroupLevels = new LinkedHashMap<>();
        expectedPermissionGroupLevels.put(MANAGE_USERS_AND_CONTACTS, EXECUTE);
        expectedPermissionGroupLevels.put(ASSIGN_REASSIGN_TASKS, EXECUTE);
        expectedPermissionGroupLevels.put(ADD_OPERATOR_ADMIN, EXECUTE);
        expectedPermissionGroupLevels.put(MANAGE_VERIFICATION_BODIES, EXECUTE);
        expectedPermissionGroupLevels.put(REVIEW_EMP_APPLICATION, EXECUTE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_APPLICATION, EXECUTE);
        expectedPermissionGroupLevels.put(SUBMIT_REVIEW_EMP_VARIATION, EXECUTE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_VARIATION, EXECUTE);
        expectedPermissionGroupLevels.put(REVIEW_EMP_NOTIFICATION, EXECUTE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_NOTIFICATION, EXECUTE);
        expectedPermissionGroupLevels.put(SUBMIT_DOE, EXECUTE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_DOE, EXECUTE);
        expectedPermissionGroupLevels.put(REVIEW_AER, EXECUTE);
        expectedPermissionGroupLevels.put(REVIEW_VIR, NONE);
        expectedPermissionGroupLevels.put(SUBMIT_NON_COMPLIANCE, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_NON_COMPLIANCE, NONE);
        expectedPermissionGroupLevels.put(SUBMIT_EMP_BATCH_REISSUE, NONE);
        expectedPermissionGroupLevels.put(ANNUAL_IMPROVEMENT_REPORT, NONE);
        expectedPermissionGroupLevels.put(ACCOUNT_CLOSURE, NONE);
        expectedPermissionGroupLevels.put(MANAGE_GUIDANCE, NONE);
        expectedPermissionGroupLevels.put(MANAGE_THIRD_PARTY_DATA_PROVIDERS, NONE);
        expectedPermissionGroupLevels.put(REVIEW_SITE_VISIT, NONE);
        expectedPermissionGroupLevels.put(PEER_REVIEW_SITE_VISIT, NONE);

        assertThat(regulatorPermissionsAdapter.getPermissionGroupLevelsFromPermissions(permissions))
                .containsExactlyInAnyOrderEntriesOf(expectedPermissionGroupLevels);
    }

    @Test
    void getPermissionGroupLevels() {
        Map<String, List<RegulatorPermissionLevel>> expectedPermissionGroupLevels = new LinkedHashMap<>();
        expectedPermissionGroupLevels.put(MANAGE_USERS_AND_CONTACTS, List.of(NONE, EXECUTE));
        expectedPermissionGroupLevels.put(ADD_OPERATOR_ADMIN, List.of(NONE, EXECUTE));
        expectedPermissionGroupLevels.put(MANAGE_VERIFICATION_BODIES, List.of(NONE, EXECUTE));
        expectedPermissionGroupLevels.put(ASSIGN_REASSIGN_TASKS, List.of(NONE, EXECUTE));
        expectedPermissionGroupLevels.put(REVIEW_EMP_APPLICATION, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_APPLICATION, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(REVIEW_EMP_NOTIFICATION, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_NOTIFICATION, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(SUBMIT_REVIEW_EMP_VARIATION, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(PEER_REVIEW_EMP_VARIATION, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(SUBMIT_DOE, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(PEER_REVIEW_DOE, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(REVIEW_AER, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(REVIEW_VIR, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(SUBMIT_NON_COMPLIANCE, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(PEER_REVIEW_NON_COMPLIANCE, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(SUBMIT_EMP_BATCH_REISSUE, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(ANNUAL_IMPROVEMENT_REPORT, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(ACCOUNT_CLOSURE, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(MANAGE_GUIDANCE, List.of(NONE, EXECUTE));
        expectedPermissionGroupLevels.put(MANAGE_THIRD_PARTY_DATA_PROVIDERS, List.of(NONE, EXECUTE));
        expectedPermissionGroupLevels.put(REVIEW_SITE_VISIT, List.of(NONE, VIEW_ONLY, EXECUTE));
        expectedPermissionGroupLevels.put(PEER_REVIEW_SITE_VISIT, List.of(NONE, VIEW_ONLY, EXECUTE));

        Map<String, List<RegulatorPermissionLevel>> actualPermissionGroupLevels =
                regulatorPermissionsAdapter.getPermissionGroupLevels();

        assertThat(actualPermissionGroupLevels.keySet())
                .containsExactlyInAnyOrderElementsOf(expectedPermissionGroupLevels.keySet());
        actualPermissionGroupLevels.forEach((group, levels) ->
                assertThat(levels).containsExactlyElementsOf(expectedPermissionGroupLevels.get(group)));
    }
}