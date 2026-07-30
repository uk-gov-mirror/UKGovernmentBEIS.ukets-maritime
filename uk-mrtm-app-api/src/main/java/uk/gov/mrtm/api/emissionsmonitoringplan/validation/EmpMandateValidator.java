package uk.gov.mrtm.api.emissionsmonitoringplan.validation;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmpMandateValidator implements EmpContextValidator {

    @Override
    public EmissionsMonitoringPlanValidationResult validate(EmissionsMonitoringPlanContainer empContainer, Long accountId) {
        return validate(
            empContainer.getEmissionsMonitoringPlan().getMandate(),
            empContainer.getEmissionsMonitoringPlan().getEmissions(),
            empContainer.getEmissionsMonitoringPlan().getOperatorDetails().getImoNumber());
    }

    public EmissionsMonitoringPlanValidationResult validate(EmpMandate mandate, EmpEmissions emissions, String imoNumber) {
        List<EmissionsMonitoringPlanViolation> empViolations = new ArrayList<>();

        final Set<String> allIsmShips = getAllIsmShips(emissions);
        if (!allIsmShips.isEmpty() && Boolean.FALSE.equals(mandate.getExist())) {
            empViolations.add(new EmissionsMonitoringPlanViolation(
                "delegatedResponsibility",
                EmissionsMonitoringPlanViolation.ViolationMessage.INVALID_ISM_SHIPS_AND_REGISTERED_OWNERS,
                allIsmShips.toArray()));
        }

        if (Boolean.TRUE.equals(mandate.getExist()) && !mandate.getRegisteredOwners().isEmpty()) {

            if (validateImoNumberUniqueness(mandate, imoNumber)) {
                empViolations.add(new EmissionsMonitoringPlanViolation(
                    "delegatedResponsibility",
                    EmissionsMonitoringPlanViolation.ViolationMessage.INVALID_REGISTERED_OWNER_IMO_NUMBER_MATCH_ACCOUNT_IMO_NUMBER,
                    imoNumber));
            }

            final Set<String> invalidShipImoNumbers = validateShipImoNumbers(mandate, emissions);
            if (!invalidShipImoNumbers.isEmpty()) {
                empViolations.add(new EmissionsMonitoringPlanViolation(
                    "delegatedResponsibility",
                    EmissionsMonitoringPlanViolation.ViolationMessage.INVALID_REGISTERED_OWNER_SHIP,
                    invalidShipImoNumbers.toArray()));
            }

            final Set<String> invalidOwnerImoNumbers = validateShipImoNumbersDoNotExistInRegisteredOwner(mandate, emissions);
            if (!invalidOwnerImoNumbers.isEmpty()) {
                empViolations.add(new EmissionsMonitoringPlanViolation(
                    "delegatedResponsibility",
                    EmissionsMonitoringPlanViolation.ViolationMessage.INVALID_REGISTERED_OWNER_IMO_NUMBER_MATCH_SHIP_IMO_NUMBER,
                    invalidOwnerImoNumbers.toArray()));
            }

            final Set<String> duplicateShipImoNumbers = validateDuplicateShipsAcrossOwners(mandate);
            if (!duplicateShipImoNumbers.isEmpty()) {
                empViolations.add(new EmissionsMonitoringPlanViolation(
                    "delegatedResponsibility",
                    EmissionsMonitoringPlanViolation.ViolationMessage.DUPLICATE_SHIP_IMO_ACROSS_REGISTERED_OWNERS,
                    duplicateShipImoNumbers.toArray()));
            }
            final Set<String> invalidShipNamesImoNumbers = validateShipNames(mandate, emissions);
            if (!invalidShipNamesImoNumbers.isEmpty()) {
                empViolations.add(new EmissionsMonitoringPlanViolation(
                    "delegatedResponsibility",
                    EmissionsMonitoringPlanViolation.ViolationMessage.INVALID_REGISTERED_OWNER_SHIP_NAME,
                    invalidShipNamesImoNumbers.toArray()));
            }
            final Set<String> allShipsAssociated = validateAllShipsAssociated(mandate, emissions);
            if (!allShipsAssociated.isEmpty()) {
                empViolations.add(new EmissionsMonitoringPlanViolation(
                    "delegatedResponsibility",
                    EmissionsMonitoringPlanViolation.ViolationMessage.SHIP_NOT_ASSOCIATED_WITH_REGISTERED_OWNER,
                    allShipsAssociated.toArray()));
            }
        }

        return EmissionsMonitoringPlanValidationResult.builder()
            .valid(empViolations.isEmpty())
            .empViolations(empViolations)
            .build();
    }

    private boolean validateImoNumberUniqueness(EmpMandate mandate, String imoNumber) {
        return imoNumber != null && mandate.getRegisteredOwners().stream()
            .map(EmpRegisteredOwner::getImoNumber)
            .anyMatch(imoNumber::equals);
    }

    private Set<String> validateShipImoNumbers(EmpMandate mandate,
                                               EmpEmissions emissions) {
        final Set<String> allShipImoNumbers = emissions.getShips().stream()
                .map(EmpShipEmissions::getDetails)
                .filter(shipDetails -> ReportingResponsibilityNature.ISM_COMPANY.equals(shipDetails.getNatureOfReportingResponsibility()))
                .map(ShipDetails::getImoNumber)
                .collect(Collectors.toSet());

        return mandate.getRegisteredOwners().stream()
                .flatMap(empRegisteredOwner -> empRegisteredOwner.getShips().stream())
                .map(RegisteredOwnerShipDetails::getImoNumber)
                .filter(shipImo -> !allShipImoNumbers.contains(shipImo))
                .collect(Collectors.toSet());
    }

    private Set<String> validateShipImoNumbersDoNotExistInRegisteredOwner(EmpMandate mandate,
                                                                          EmpEmissions emissions) {
        final Set<String> shipImoNumbers = emissions.getShips().stream()
            .map(EmpShipEmissions::getDetails)
            .map(ShipDetails::getImoNumber)
            .collect(Collectors.toSet());

        final Set<String> ownerImoNumbers = mandate.getRegisteredOwners().stream()
            .map(EmpRegisteredOwner::getImoNumber)
            .collect(Collectors.toSet());

        return ownerImoNumbers.stream()
            .filter(shipImoNumbers::contains)
            .collect(Collectors.toSet());
    }

    private Set<String> validateDuplicateShipsAcrossOwners(EmpMandate mandate) {
        Set<String> seenShipImoNumbers = new HashSet<>();

        return mandate.getRegisteredOwners().stream()
                .flatMap(owner -> owner.getShips().stream())
                .map(RegisteredOwnerShipDetails::getImoNumber)
                .filter(imoShip -> !seenShipImoNumbers.add(imoShip))
                .collect(Collectors.toSet());
    }

    private Set<String> validateShipNames(EmpMandate mandate, EmpEmissions emissions) {
        final Map<String, String> allShipImoNames = emissions.getShips().stream()
                .map(EmpShipEmissions::getDetails)
                .collect(Collectors.toMap(ShipDetails::getImoNumber, ShipDetails::getName));

        return mandate.getRegisteredOwners().stream()
                .flatMap(owner -> owner.getShips().stream())
                .filter(shipDetails -> allShipImoNames.containsKey(shipDetails.getImoNumber())
                        && !allShipImoNames.get(shipDetails.getImoNumber()).equals(shipDetails.getName()))
                .map(RegisteredOwnerShipDetails::getImoNumber)
                .collect(Collectors.toSet());
    }

    private Set<String> validateAllShipsAssociated(EmpMandate mandate, EmpEmissions emissions) {

        final Set<String> allShipImoNumbers = emissions.getShips().stream()
                .map(EmpShipEmissions::getDetails)
                .filter(shipDetails -> ReportingResponsibilityNature.ISM_COMPANY.equals(shipDetails.getNatureOfReportingResponsibility()))
                .map(ShipDetails::getImoNumber)
                .collect(Collectors.toSet());

        final Set<String> associatedShipImoNumbers = mandate.getRegisteredOwners().stream()
                .flatMap(owner -> owner.getShips().stream())
                .map(RegisteredOwnerShipDetails::getImoNumber)
                .filter(allShipImoNumbers::contains)
                .collect(Collectors.toSet());

        allShipImoNumbers.removeAll(associatedShipImoNumbers);
        return allShipImoNumbers.stream()
            .filter(shipNumber -> !associatedShipImoNumbers.contains(shipNumber))
            .collect(Collectors.toSet());
    }

    private Set<String> getAllIsmShips(EmpEmissions emissions) {
        return emissions.getShips().stream()
                .map(EmpShipEmissions::getDetails)
                .filter(shipDetails -> ReportingResponsibilityNature.ISM_COMPANY.equals(shipDetails.getNatureOfReportingResponsibility()))
                .map(ShipDetails::getImoNumber)
                .collect(Collectors.toSet());
    }
}
