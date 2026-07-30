package uk.gov.mrtm.api.emissionsmonitoringplan.validation;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanValidationResult;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanViolation;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.EmpEmissions;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.EmpShipEmissions;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.ShipDetails;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.ReportingResponsibilityNature;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.mandate.EmpMandate;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.mandate.EmpRegisteredOwner;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.mandate.RegisteredOwnerShipDetails;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.operatordetails.EmpOperatorDetails;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanViolation.ViolationMessage.DUPLICATE_SHIP_IMO_ACROSS_REGISTERED_OWNERS;
import static uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanViolation.ViolationMessage.INVALID_ISM_SHIPS_AND_REGISTERED_OWNERS;
import static uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanViolation.ViolationMessage.INVALID_REGISTERED_OWNER_IMO_NUMBER_MATCH_ACCOUNT_IMO_NUMBER;
import static uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanViolation.ViolationMessage.INVALID_REGISTERED_OWNER_IMO_NUMBER_MATCH_SHIP_IMO_NUMBER;
import static uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanViolation.ViolationMessage.INVALID_REGISTERED_OWNER_SHIP;
import static uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanViolation.ViolationMessage.INVALID_REGISTERED_OWNER_SHIP_NAME;
import static uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanViolation.ViolationMessage.SHIP_NOT_ASSOCIATED_WITH_REGISTERED_OWNER;

@ExtendWith(MockitoExtension.class)
class EmpMandateValidatorTest {

    @InjectMocks
    private EmpMandateValidator validator;

    @Test
    void validate_valid() {
        Long accountId = 1L;
        String ownerImoNumber1 = "1234567";
        String ownerImoNumber2 = "8765432";
        String accountImoNumber = "0000000";
        String shipImoNumber1 = "1111111";
        String shipImoNumber2 = "2222222";
        String shipImoNumber3 = "3333333";
        String shipImoNumber4 = "4444444";

        String shipName1 = "ship1";
        String shipName2 = "ship2";
        String shipName3 = "ship3";
        String shipName4 = "ship4";

        final Set<EmpShipEmissions> shipEmissions = Set.of(buildEmpShipEmissions(shipImoNumber1, shipName1, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber2, shipName2, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber3, shipName3, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber4, shipName4, ReportingResponsibilityNature.ISM_COMPANY));
        final Map<String, String> registeredShips1 = Map.of(shipImoNumber1, shipName1, shipImoNumber2, shipName2);
        final EmpRegisteredOwner registeredOwner1 = buildRegisteredOwner(ownerImoNumber1, registeredShips1);
        final Map<String, String> registeredShips2 = Map.of(shipImoNumber3, shipName3, shipImoNumber4, shipName4);
        final EmpRegisteredOwner registeredOwner2 = buildRegisteredOwner(ownerImoNumber2, registeredShips2);
        final EmissionsMonitoringPlanContainer empContainer = buildEmissionsMonitoringPlanContainer(shipEmissions, Set.of(registeredOwner1, registeredOwner2), accountImoNumber);

        final EmissionsMonitoringPlanValidationResult result = validator.validate(empContainer, accountId);
        assertTrue(result.isValid());
        assertThat(result.getEmpViolations()).isEmpty();
    }

    @Test
    void validate_mandate_not_exist_valid() {
        Long accountId = 1L;

        EmissionsMonitoringPlanContainer empContainer = EmissionsMonitoringPlanContainer.builder()
                .emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
                        .operatorDetails(EmpOperatorDetails.builder().imoNumber("1234567").build())
                        .emissions(EmpEmissions.builder()
                                .ships(Set.of(buildEmpShipEmissions("1111111", "Ship A", ReportingResponsibilityNature.SHIPOWNER)))
                                .build())
                        .mandate(EmpMandate.builder()
                                .exist(Boolean.FALSE)
                                .build())
                        .build())
                .build();

        final EmissionsMonitoringPlanValidationResult result = validator.validate(empContainer, accountId);
        assertTrue(result.isValid());
        assertThat(result.getEmpViolations()).isEmpty();
    }

    @Test
    void validate_mandate_exist_no_ism_ships_valid() {
        Long accountId = 1L;

        EmissionsMonitoringPlanContainer empContainer = EmissionsMonitoringPlanContainer.builder()
                .emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
                        .operatorDetails(EmpOperatorDetails.builder().imoNumber("1234567").build())
                        .emissions(EmpEmissions.builder()
                                .ships(Set.of(buildEmpShipEmissions("1111111", "Ship A", ReportingResponsibilityNature.SHIPOWNER)))
                                .build())
                        .mandate(EmpMandate.builder()
                                .exist(Boolean.TRUE)
                                .build())
                        .build())
                .build();

        final EmissionsMonitoringPlanValidationResult result = validator.validate(empContainer, accountId);
        assertTrue(result.isValid());
        assertThat(result.getEmpViolations()).isEmpty();
    }

    @Test
    void validate_mandate_not_exist_ISM_ship_exist_invalid() {
        Long accountId = 1L;

        final String shipImo1 = "1111111";
        final String shipImo2 = "2222222";
        EmissionsMonitoringPlanContainer empContainer = EmissionsMonitoringPlanContainer.builder()
                .emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
                        .operatorDetails(EmpOperatorDetails.builder().imoNumber("1234567").build())
                        .emissions(EmpEmissions.builder()
                                .ships(Set.of(buildEmpShipEmissions(shipImo1, "Ship A", ReportingResponsibilityNature.ISM_COMPANY),
                                        buildEmpShipEmissions(shipImo2, "Ship B", ReportingResponsibilityNature.SHIPOWNER)
                                        ))
                                .build())
                        .mandate(EmpMandate.builder()
                                .exist(Boolean.FALSE)
                                .build())
                        .build())
                .build();

        final EmissionsMonitoringPlanValidationResult result = validator.validate(empContainer, accountId);
        assertFalse(result.isValid());
        assertThat(result.getEmpViolations()).extracting(EmissionsMonitoringPlanViolation::getMessage)
                .containsExactly(INVALID_ISM_SHIPS_AND_REGISTERED_OWNERS.getMessage());
        assertThat(result.getEmpViolations()).extracting(EmissionsMonitoringPlanViolation::getData)
                .containsExactly(Set.of(shipImo1).toArray());
    }

    @Test
    void validate_invalid_registered_owner_imo_number_match_account_imo_number() {
        Long accountId = 1L;
        String ownerImoNumber1 = "1234567";
        String ownerImoNumber2 = "8765432";
        String shipImoNumber1 = "1111111";
        String shipImoNumber2 = "2222222";
        String shipImoNumber3 = "3333333";
        String shipImoNumber4 = "4444444";
        String shipImoNumber5 = "5555555";

        String shipName1 = "ship1";
        String shipName2 = "ship2";
        String shipName3 = "ship3";
        String shipName4 = "ship4";
        String shipName5 = "ship5";

        final Set<EmpShipEmissions> shipEmissions = Set.of(buildEmpShipEmissions(shipImoNumber1, shipName1, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber2, shipName2, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber3, shipName3, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber4, shipName4, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber5, shipName5, ReportingResponsibilityNature.SHIPOWNER));
        final Map<String, String> registeredShips1 = Map.of(shipImoNumber1, shipName1, shipImoNumber2, shipName2);
        final EmpRegisteredOwner registeredOwner1 = buildRegisteredOwner(ownerImoNumber1, registeredShips1);
        final Map<String, String> registeredShips2 = Map.of(shipImoNumber3, shipName3, shipImoNumber4, shipName4);
        final EmpRegisteredOwner registeredOwner2 = buildRegisteredOwner(ownerImoNumber2, registeredShips2);
        final EmissionsMonitoringPlanContainer empContainer = buildEmissionsMonitoringPlanContainer(shipEmissions, Set.of(registeredOwner1, registeredOwner2), ownerImoNumber2);

        final EmissionsMonitoringPlanValidationResult result = validator.validate(empContainer, accountId);
        assertFalse(result.isValid());
        assertThat(result.getEmpViolations())
            .singleElement()
            .satisfies(violation -> {
                assertThat(violation.getMessage())
                    .isEqualTo(INVALID_REGISTERED_OWNER_IMO_NUMBER_MATCH_ACCOUNT_IMO_NUMBER.getMessage());
                assertThat(violation.getData())
                    .containsExactly(ownerImoNumber2);
            });
    }

    @Test
    void validate_invalid_registered_owner_imo_number_match_ship_imo_number() {
        Long accountId = 1L;
        String accountImoNumber = "0000000";
        String ownerImoNumber1 = "8765432";
        String shipImoNumber1 = "1111111";
        String shipImoNumber2 = "2222222";
        String shipImoNumber3 = "3333333";
        String shipImoNumber4 = "4444444";
        String shipImoNumber5 = "5555555";

        String shipName1 = "ship1";
        String shipName2 = "ship2";
        String shipName3 = "ship3";
        String shipName4 = "ship4";
        String shipName5 = "ship5";

        final Set<EmpShipEmissions> shipEmissions = Set.of(buildEmpShipEmissions(shipImoNumber1, shipName1, ReportingResponsibilityNature.ISM_COMPANY),
            buildEmpShipEmissions(shipImoNumber2, shipName2, ReportingResponsibilityNature.ISM_COMPANY),
            buildEmpShipEmissions(shipImoNumber3, shipName3, ReportingResponsibilityNature.ISM_COMPANY),
            buildEmpShipEmissions(shipImoNumber4, shipName4, ReportingResponsibilityNature.ISM_COMPANY),
            buildEmpShipEmissions(shipImoNumber5, shipName5, ReportingResponsibilityNature.SHIPOWNER));
        final Map<String, String> registeredShips1 = Map.of(shipImoNumber1, shipName1, shipImoNumber2, shipName2);
        final EmpRegisteredOwner registeredOwner1 = buildRegisteredOwner(shipImoNumber1, registeredShips1);
        final Map<String, String> registeredShips2 = Map.of(shipImoNumber3, shipName3, shipImoNumber4, shipName4);
        final EmpRegisteredOwner registeredOwner2 = buildRegisteredOwner(ownerImoNumber1, registeredShips2);
        final EmissionsMonitoringPlanContainer empContainer = buildEmissionsMonitoringPlanContainer(shipEmissions, Set.of(registeredOwner1, registeredOwner2), accountImoNumber);

        final EmissionsMonitoringPlanValidationResult result = validator.validate(empContainer, accountId);
        assertFalse(result.isValid());
        assertThat(result.getEmpViolations()).extracting(EmissionsMonitoringPlanViolation::getMessage)
            .containsExactly(INVALID_REGISTERED_OWNER_IMO_NUMBER_MATCH_SHIP_IMO_NUMBER.getMessage());
        assertThat(result.getEmpViolations()).extracting(EmissionsMonitoringPlanViolation::getData)
            .containsExactly(Set.of(shipImoNumber1).toArray());
    }

    @Test
    void validate_invalid_ships() {
        Long accountId = 1L;
        String ownerImoNumber1 = "1234567";
        String ownerImoNumber2 = "8765432";
        String accountImoNumber = "0000000";
        String shipImoNumber1 = "1111111";
        String shipImoNumber2 = "2222222";
        String shipImoNumber3 = "3333333";
        String shipImoNumber4 = "4444444";
        String shipImoNumber5 = "5555555";
        String invalidShipImoNumber1 = "1212121";
        String invalidShipImoNumber2 = "3434343";
        String shipName1 = "ship1";
        String shipName2 = "ship2";
        String shipName3 = "ship3";
        String shipName4 = "ship4";
        String shipName5 = "ship5";

        final Set<EmpShipEmissions> shipEmissions = Set.of(buildEmpShipEmissions(shipImoNumber1, shipName1, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber2, shipName2, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber3, shipName3, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber4, shipName4, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber5, shipName5, ReportingResponsibilityNature.ISM_COMPANY));
        final Map<String, String> registeredShips1 = Map.of(shipImoNumber1, shipName1, shipImoNumber2, shipName2, invalidShipImoNumber1, "Ship A");
        final EmpRegisteredOwner registeredOwner1 = buildRegisteredOwner(ownerImoNumber1, registeredShips1);
        final Map<String, String> registeredShips2 = Map.of(shipImoNumber3, shipName3, shipImoNumber4, shipName4, shipImoNumber5, shipName5, invalidShipImoNumber2, "Ship B");
        final EmpRegisteredOwner registeredOwner2 = buildRegisteredOwner(ownerImoNumber2, registeredShips2);
        final EmissionsMonitoringPlanContainer empContainer = buildEmissionsMonitoringPlanContainer(shipEmissions, Set.of(registeredOwner1, registeredOwner2), accountImoNumber);

        final EmissionsMonitoringPlanValidationResult result = validator.validate(empContainer, accountId);
        assertFalse(result.isValid());
        assertThat(result.getEmpViolations()).extracting(EmissionsMonitoringPlanViolation::getMessage)
                .containsExactly(INVALID_REGISTERED_OWNER_SHIP.getMessage());
        assertThat(result.getEmpViolations())
                .anySatisfy(violation -> assertThat(violation.getData())
                        .containsExactlyInAnyOrder(invalidShipImoNumber1, invalidShipImoNumber2));
    }

    @Test
    void validate_duplicate_ships_across_owners() {
        Long accountId = 1L;
        String ownerImoNumber1 = "1234567";
        String ownerImoNumber2 = "8765432";
        String accountImoNumber = "0000000";
        String shipImoNumber1 = "1111111";
        String shipImoNumber2 = "2222222";
        String shipImoNumber3 = "3333333";
        String shipImoNumber4 = "4444444";
        String shipImoNumber5 = "5555555";
        String shipName1 = "ship1";
        String shipName2 = "ship2";
        String shipName3 = "ship3";
        String shipName4 = "ship4";
        String shipName5 = "ship5";

        final Set<EmpShipEmissions> shipEmissions = Set.of(buildEmpShipEmissions(shipImoNumber1, shipName1, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber2, shipName2, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber3, shipName3, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber4, shipName4, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber5, shipName5, ReportingResponsibilityNature.ISM_COMPANY));
        final Map<String, String> registeredShips1 = Map.of(shipImoNumber1, shipName1, shipImoNumber2, shipName2, shipImoNumber5, shipName5);
        final EmpRegisteredOwner registeredOwner1 = buildRegisteredOwner(ownerImoNumber1, registeredShips1);
        final Map<String, String> registeredShips2 = Map.of(shipImoNumber3, shipName3, shipImoNumber4, shipName4, shipImoNumber5, shipName5);
        final EmpRegisteredOwner registeredOwner2 = buildRegisteredOwner(ownerImoNumber2, registeredShips2);
        final EmissionsMonitoringPlanContainer empContainer = buildEmissionsMonitoringPlanContainer(shipEmissions, Set.of(registeredOwner1, registeredOwner2), accountImoNumber);

        final EmissionsMonitoringPlanValidationResult result = validator.validate(empContainer, accountId);
        assertFalse(result.isValid());
        assertThat(result.getEmpViolations()).extracting(EmissionsMonitoringPlanViolation::getMessage)
                .containsExactly(DUPLICATE_SHIP_IMO_ACROSS_REGISTERED_OWNERS.getMessage());
        assertThat(result.getEmpViolations()).extracting(EmissionsMonitoringPlanViolation::getData)
                .containsExactly(Set.of(shipImoNumber5).toArray());
    }

    @Test
    void validate_ship_name_invalid() {
        Long accountId = 1L;
        String ownerImoNumber1 = "1234567";
        String ownerImoNumber2 = "8765432";
        String accountImoNumber = "0000000";
        String shipImoNumber1 = "1111111";
        String shipImoNumber2 = "2222222";
        String shipImoNumber3 = "3333333";
        String shipImoNumber4 = "4444444";

        String shipName1 = "ship1";
        String shipName2 = "ship2";
        String shipName3 = "ship3";
        String shipName4 = "ship4";

        final Set<EmpShipEmissions> shipEmissions = Set.of(buildEmpShipEmissions(shipImoNumber1, shipName1, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber2, shipName2, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber3, shipName3, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber4, shipName4, ReportingResponsibilityNature.ISM_COMPANY));
        final Map<String, String> registeredShips1 = Map.of(shipImoNumber1, shipName1, shipImoNumber2, "Ship A");
        final EmpRegisteredOwner registeredOwner1 = buildRegisteredOwner(ownerImoNumber1, registeredShips1);
        final Map<String, String> registeredShips2 = Map.of(shipImoNumber3, shipName3, shipImoNumber4, "Ship B");
        final EmpRegisteredOwner registeredOwner2 = buildRegisteredOwner(ownerImoNumber2, registeredShips2);
        final EmissionsMonitoringPlanContainer empContainer = buildEmissionsMonitoringPlanContainer(shipEmissions, Set.of(registeredOwner1, registeredOwner2), accountImoNumber);

        final EmissionsMonitoringPlanValidationResult result = validator.validate(empContainer, accountId);
        assertFalse(result.isValid());
        assertThat(result.getEmpViolations()).extracting(EmissionsMonitoringPlanViolation::getMessage)
                .containsExactly(INVALID_REGISTERED_OWNER_SHIP_NAME.getMessage());
        assertThat(result.getEmpViolations())
                .anySatisfy(violation -> assertThat(violation.getData())
                        .containsExactlyInAnyOrder(shipImoNumber2, shipImoNumber4));
    }

    @Test
    void validate_associated_shipowner_responsibility_invalid() {
        Long accountId = 1L;
        String ownerImoNumber1 = "1234567";
        String ownerImoNumber2 = "8765432";
        String accountImoNumber = "0000000";
        String shipImoNumber1 = "1111111";
        String shipImoNumber2 = "2222222";
        String shipImoNumber3 = "3333333";
        String shipImoNumber4 = "4444444";

        String shipName1 = "ship1";
        String shipName2 = "ship2";
        String shipName3 = "ship3";
        String shipName4 = "ship4";

        final Set<EmpShipEmissions> shipEmissions = Set.of(buildEmpShipEmissions(shipImoNumber1, shipName1, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber2, shipName2, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber3, shipName3, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber4, shipName4, ReportingResponsibilityNature.SHIPOWNER));
        final Map<String, String> registeredShips1 = Map.of(shipImoNumber1, shipName1, shipImoNumber2, shipName2);
        final EmpRegisteredOwner registeredOwner1 = buildRegisteredOwner(ownerImoNumber1, registeredShips1);
        final Map<String, String> registeredShips2 = Map.of(shipImoNumber3, shipName3, shipImoNumber4, shipName4);
        final EmpRegisteredOwner registeredOwner2 = buildRegisteredOwner(ownerImoNumber2, registeredShips2);
        final EmissionsMonitoringPlanContainer empContainer = buildEmissionsMonitoringPlanContainer(shipEmissions, Set.of(registeredOwner1, registeredOwner2), accountImoNumber);

        final EmissionsMonitoringPlanValidationResult result = validator.validate(empContainer, accountId);
        assertFalse(result.isValid());
        assertThat(result.getEmpViolations()).extracting(EmissionsMonitoringPlanViolation::getMessage)
                .containsExactly(INVALID_REGISTERED_OWNER_SHIP.getMessage());
        assertThat(result.getEmpViolations())
                .anySatisfy(violation -> assertThat(violation.getData())
                        .containsExactlyInAnyOrder(shipImoNumber4));
    }

    @Test
    void validate_not_all_ships_associated_invalid() {
        Long accountId = 1L;
        String ownerImoNumber1 = "1234567";
        String ownerImoNumber2 = "8765432";
        String accountImoNumber = "0000000";
        String shipImoNumber1 = "1111111";
        String shipImoNumber2 = "2222222";
        String shipImoNumber3 = "3333333";
        String shipImoNumber4 = "4444444";
        String shipImoNumber5 = "5555555";

        String shipName1 = "ship1";
        String shipName2 = "ship2";
        String shipName3 = "ship3";
        String shipName4 = "ship4";
        String shipName5 = "ship5";

        final Set<EmpShipEmissions> shipEmissions = Set.of(buildEmpShipEmissions(shipImoNumber1, shipName1, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber2, shipName2, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber3, shipName3, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber4, shipName4, ReportingResponsibilityNature.ISM_COMPANY),
                buildEmpShipEmissions(shipImoNumber5, shipName5, ReportingResponsibilityNature.ISM_COMPANY));
        final Map<String, String> registeredShips1 = Map.of(shipImoNumber1, shipName1, shipImoNumber2, shipName2);
        final EmpRegisteredOwner registeredOwner1 = buildRegisteredOwner(ownerImoNumber1, registeredShips1);
        final Map<String, String> registeredShips2 = Map.of(shipImoNumber3, shipName3, shipImoNumber4, shipName4);
        final EmpRegisteredOwner registeredOwner2 = buildRegisteredOwner(ownerImoNumber2, registeredShips2);
        final EmissionsMonitoringPlanContainer empContainer = buildEmissionsMonitoringPlanContainer(shipEmissions, Set.of(registeredOwner1, registeredOwner2), accountImoNumber);

        final EmissionsMonitoringPlanValidationResult result = validator.validate(empContainer, accountId);
        assertFalse(result.isValid());
        assertThat(result.getEmpViolations()).extracting(EmissionsMonitoringPlanViolation::getMessage)
                .containsExactly(SHIP_NOT_ASSOCIATED_WITH_REGISTERED_OWNER.getMessage());
        assertThat(result.getEmpViolations())
            .anySatisfy(violation -> assertThat(violation.getData())
                .containsExactlyInAnyOrder(shipImoNumber5));
    }

    private EmissionsMonitoringPlanContainer buildEmissionsMonitoringPlanContainer(Set<EmpShipEmissions> ships,
                                                                                   Set<EmpRegisteredOwner> registeredOwners,
                                                                                   String accountImoNumber) {
        return EmissionsMonitoringPlanContainer.builder()
                .emissionsMonitoringPlan(EmissionsMonitoringPlan.builder()
                        .operatorDetails(EmpOperatorDetails.builder()
                                .imoNumber(accountImoNumber)
                                .build())
                        .emissions(EmpEmissions.builder()
                                .ships(ships)
                                .build())
                        .mandate(EmpMandate.builder()
                                .exist(Boolean.TRUE)
                                .registeredOwners(registeredOwners)
                                .build())
                        .build())
                .build();
    }

    private EmpRegisteredOwner buildRegisteredOwner(String imoNumber, Map<String, String> ships) {
        return EmpRegisteredOwner.builder()
                .imoNumber(imoNumber)
                .ships(buildShipDetails(ships))
                .build();
    }

    private Set<RegisteredOwnerShipDetails> buildShipDetails(Map<String, String> ships) {
        return ships.entrySet().stream()
                .map(entry ->
                        RegisteredOwnerShipDetails.builder()
                                .imoNumber(entry.getKey())
                                .name(entry.getValue())
                                .build())
                .collect(Collectors.toSet());
    }

    private EmpShipEmissions buildEmpShipEmissions(String imoShip, String shipName, ReportingResponsibilityNature responsibilityNature) {
        return EmpShipEmissions.builder()
                .details(ShipDetails.builder()
                        .imoNumber(imoShip)
                        .name(shipName)
                        .natureOfReportingResponsibility(responsibilityNature)
                        .build())
                .build();
    }
}
