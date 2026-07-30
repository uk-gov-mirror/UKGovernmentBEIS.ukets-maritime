package uk.gov.mrtm.api.reporting.validation;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.reporting.domain.AerContainer;
import uk.gov.mrtm.api.reporting.domain.aggregateddata.AerAggregatedData;
import uk.gov.mrtm.api.reporting.domain.aggregateddata.AerAggregatedDataFuelConsumption;
import uk.gov.mrtm.api.reporting.domain.aggregateddata.AerShipAggregatedData;
import uk.gov.mrtm.api.reporting.domain.emissions.AerEmissions;
import uk.gov.mrtm.api.reporting.domain.emissions.AerShipEmissions;
import uk.gov.mrtm.api.reporting.domain.emissions.fuel.AerFuelsAndEmissionsFactors;
import uk.gov.mrtm.api.reporting.domain.ports.AerPort;
import uk.gov.mrtm.api.reporting.domain.voyages.AerVoyage;
import uk.gov.mrtm.api.reporting.enumeration.PortType;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerValidationResult;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.domain.AerViolation;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.service.AerEmissionsCalculatorUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static uk.gov.mrtm.api.reporting.validation.AerValidatorHelper.getUniqueFuelName;
import static uk.gov.mrtm.api.reporting.validation.AerValidatorHelper.validateShipExistsInListOfShips;
import static uk.gov.mrtm.api.workflow.request.flow.aer.common.service.AerEmissionsCalculatorUtils.sumAndScale;

@Service
@RequiredArgsConstructor
public class AerShipAggregatedDataValidator implements AerContextValidator {

    @Override
    public AerValidationResult validate(AerContainer aerContainer, Long accountId) {
        return validate(
            aerContainer.getAer().getAggregatedData(),
            aerContainer.getAer().getEmissions(),
            aerContainer.getAer().getPortEmissions().getPorts(),
            aerContainer.getAer().getVoyageEmissions().getVoyages());
    }

    public AerValidationResult validate(AerAggregatedData aggregatedData,
                                        AerEmissions emissions,
                                        Set<AerPort> ports,
                                        Set<AerVoyage> voyages) {
        List<AerViolation> aerViolations = new ArrayList<>();

        Set<String> eligibleShipsForFetch = getShipsEligibleForFetch(emissions, ports, voyages);

        for (AerShipAggregatedData data : aggregatedData.getEmissions()) {
            validateAggregatedData(emissions, data, eligibleShipsForFetch, aerViolations);
        }

        return AerValidationResult.builder()
                .valid(aerViolations.isEmpty())
                .aerViolations(aerViolations)
                .build();
    }

    private void validateAggregatedData(AerEmissions emissions,
                                        AerShipAggregatedData aggregatedData,
                                        Set<String> eligibleShipsForFetch,
                                        List<AerViolation> aerViolations) {

        if (!aggregatedData.isFromFetch()) {
            validateInputEmissionsArePositiveOrZero(aggregatedData, aerViolations);
        }

        AerShipEmissions ship = emissions.getShips().stream()
                .filter(s -> s.getDetails().getImoNumber().equals(aggregatedData.getImoNumber()))
                .findFirst()
                .orElse(null);

        validateShipExistsInListOfShips(ship, aggregatedData.getImoNumber(), aerViolations, "emissions");

        validateFetchedShipInPortsOrVoyages(aggregatedData, eligibleShipsForFetch, aerViolations);

        if (ship != null) {
            validateFuelConsumptions(ship, aggregatedData, aerViolations);
        }
    }

    private void validateFetchedShipInPortsOrVoyages(AerShipAggregatedData aggregatedData,
                                                     Set<String> eligibleShipsForFetch,
                                                     List<AerViolation> aerViolations) {
        boolean fetchedShipNotIncludedInPortsOrVoyages = aggregatedData.isFromFetch()
                && !eligibleShipsForFetch.contains(aggregatedData.getImoNumber());

        if (fetchedShipNotIncludedInPortsOrVoyages) {
            aerViolations.add(new AerViolation(
                    AerShipAggregatedData.class.getSimpleName(),
                    AerViolation.ViolationMessage.AGGREGATED_DATA_FETCHED_SHIP_NOT_FOUND_IN_PORTS_OR_VOYAGES,
                    aggregatedData.getImoNumber()));
        }
    }

    private void validateFuelConsumptions(AerShipEmissions ship,
                                          AerShipAggregatedData aggregatedData,
                                          List<AerViolation> aerViolations) {
        Set<String> invalidFuelOriginTypeNames =
                getInvalidFuelConsumptions(ship.getFuelsAndEmissionsFactors(), aggregatedData.getFuelConsumptions());

        if (!invalidFuelOriginTypeNames.isEmpty()) {
            aerViolations.add(new AerViolation(
                    "emissions",
                    AerViolation.ViolationMessage.INVALID_FUEL_CONSUMPTION,
                    invalidFuelOriginTypeNames.toArray()));
        }

        Set<String> duplicateFuelNames = getDuplicateFuelNames(aggregatedData.getFuelConsumptions());
        if (!duplicateFuelNames.isEmpty()) {
            aerViolations.add(new AerViolation(
                "emissions",
                AerViolation.ViolationMessage.DUPLICATE_FUEL_ENTRIES,
                duplicateFuelNames.toArray()));
        }
    }

    private Set<String> getShipsEligibleForFetch(AerEmissions emissions, Set<AerPort> ports, Set<AerVoyage> voyages) {

        return emissions.getShips()
            .stream().filter(data -> {
                boolean hasPorts = ports.stream().anyMatch(
                    aerPort -> aerPort.getImoNumber().equals(data.getDetails().getImoNumber())
                );

                boolean hasNIOrGBVoyages = voyages.stream().anyMatch(
                    aerVoyage -> aerVoyage.getImoNumber().equals(data.getDetails().getImoNumber())
                        && (
                        AerEmissionsCalculatorUtils.filterByJourneyType(aerVoyage, PortType.GB)
                            || AerEmissionsCalculatorUtils.filterByJourneyType(aerVoyage, PortType.NI)
                    )
                );

                return hasPorts || hasNIOrGBVoyages;
            })
            .map(aerShipEmissions -> aerShipEmissions.getDetails().getImoNumber())
            .collect(Collectors.toSet());
    }

    private Set<String> getInvalidFuelConsumptions(Set<AerFuelsAndEmissionsFactors> fuelsAndEmissionsFactors,
                                                               Set<AerAggregatedDataFuelConsumption> fuelConsumptions) {
        Set<String> invalidFuelOriginTypeNames = new HashSet<>();
        final Set<String> fuelOriginTypeNames = fuelsAndEmissionsFactors
            .stream()
            .map(e -> getUniqueFuelName(e.getName(), e.getTypeAsString()))
            .collect(Collectors.toSet());

        invalidFuelOriginTypeNames.addAll(
            fuelConsumptions.stream()
                .map(fuelConsumption -> getUniqueFuelName(fuelConsumption.getFuelOriginTypeName().getName(), fuelConsumption.getFuelOriginTypeName().getTypeAsString()))
                .filter(empFuelOriginTypeName -> !fuelOriginTypeNames.contains(empFuelOriginTypeName))
                .collect(Collectors.toSet())
        );

        return invalidFuelOriginTypeNames;
    }


    private Set<String> getDuplicateFuelNames(Set<AerAggregatedDataFuelConsumption> ships) {

        List<String> allNames = ships.stream()
            .map(e -> getUniqueFuelName(e.getFuelOriginTypeName().getName(), e.getFuelOriginTypeName().getTypeAsString()))
            .toList();

        Set<String> seen = new HashSet<>();


        return allNames.stream()
            .filter(str -> !seen.add(str))
            .collect(Collectors.toSet());
    }

    private void validateInputEmissionsArePositiveOrZero(AerShipAggregatedData aggregatedData, List<AerViolation> aerViolations) {
        AerValidatorHelper.validateEmissionsInputIsPositiveOrZero(
            aggregatedData.getEmissionsWithinUKPorts(),
            aerViolations,
            AerShipAggregatedData.class
        );

        AerValidatorHelper.validateEmissionsInputIsPositiveOrZero(
            aggregatedData.getEmissionsBetweenUKPorts(),
            aerViolations,
            AerShipAggregatedData.class
        );

        AerValidatorHelper.validateEmissionsInputIsPositiveOrZero(
            aggregatedData.getEmissionsBetweenUKAndNIVoyages(),
            aerViolations,
            AerShipAggregatedData.class
        );
    }
}
