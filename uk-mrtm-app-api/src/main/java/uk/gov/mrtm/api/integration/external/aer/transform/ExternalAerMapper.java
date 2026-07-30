package uk.gov.mrtm.api.integration.external.aer.transform;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.BioFuelType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.EFuelType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.FossilFuelType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.FuelOrigin;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.biofuel.AerFuelOriginBiofuelTypeName;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.efuel.AerFuelOriginEFuelTypeName;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.fossil.AerFuelOriginFossilTypeName;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.sources.EmissionsSources;
import uk.gov.mrtm.api.integration.external.aer.domain.ExternalAer;
import uk.gov.mrtm.api.integration.external.aer.domain.StagingAer;
import uk.gov.mrtm.api.integration.external.aer.domain.aggregateddata.ExternalAerAggregatedDataEmissions;
import uk.gov.mrtm.api.integration.external.aer.domain.aggregateddata.ExternalAerAggregatedDataEmissionsMeasurements;
import uk.gov.mrtm.api.integration.external.aer.domain.aggregateddata.ExternalAerAggregatedDataFuelConsumption;
import uk.gov.mrtm.api.integration.external.aer.domain.reductionclaim.ExternalAerReductionClaim;
import uk.gov.mrtm.api.integration.external.aer.domain.reductionclaim.ExternalAerReductionClaimPurchase;
import uk.gov.mrtm.api.integration.external.aer.domain.shipemissions.ExternalAerEmissionsSources;
import uk.gov.mrtm.api.integration.external.aer.domain.shipemissions.ExternalAerFuelsAndEmissionsFactors;
import uk.gov.mrtm.api.integration.external.aer.domain.shipemissions.ExternalAerShipEmissions;
import uk.gov.mrtm.api.integration.external.common.MrtmStagingPayloadType;
import uk.gov.mrtm.api.integration.external.common.mapper.ExternalCommonMapper;
import uk.gov.mrtm.api.integration.external.emp.enums.ExternalFuelType;
import uk.gov.mrtm.api.reporting.domain.aggregateddata.AerAggregatedData;
import uk.gov.mrtm.api.reporting.domain.aggregateddata.AerAggregatedDataFuelConsumption;
import uk.gov.mrtm.api.reporting.domain.aggregateddata.AerAggregatedDataFuelOriginTypeName;
import uk.gov.mrtm.api.reporting.domain.aggregateddata.AerShipAggregatedData;
import uk.gov.mrtm.api.reporting.domain.common.AerPortEmissionsMeasurement;
import uk.gov.mrtm.api.reporting.domain.emissions.AerDerogations;
import uk.gov.mrtm.api.reporting.domain.emissions.AerEmissions;
import uk.gov.mrtm.api.reporting.domain.emissions.AerShipDetails;
import uk.gov.mrtm.api.reporting.domain.emissions.AerShipEmissions;
import uk.gov.mrtm.api.reporting.domain.emissions.fuel.AerFuelsAndEmissionsFactors;
import uk.gov.mrtm.api.reporting.domain.emissions.fuel.DataInputType;
import uk.gov.mrtm.api.reporting.domain.emissions.fuel.biofuel.AerBioFuels;
import uk.gov.mrtm.api.reporting.domain.emissions.fuel.efuel.AerEFuels;
import uk.gov.mrtm.api.reporting.domain.emissions.fuel.fossil.AerFossilFuels;
import uk.gov.mrtm.api.reporting.domain.smf.AerSmf;
import uk.gov.mrtm.api.reporting.domain.smf.AerSmfDetails;
import uk.gov.mrtm.api.reporting.domain.smf.AerSmfPurchase;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.service.AerAggregatedDataEmissionsCalculator;
import uk.gov.mrtm.api.workflow.request.flow.aer.common.service.AerSmfEmissionsCalculator;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ExternalAerMapper extends ExternalCommonMapper {

    private final AerAggregatedDataEmissionsCalculator aggregatedDataCalculator;
    private final AerSmfEmissionsCalculator smfCalculator;

    public StagingAer toStagingAer(ExternalAer external) {

        AerEmissions emissions = toAerEmissions(external.getShipParticulars());
        AerAggregatedData aggregatedData = toAerAggregatedData(external.getEmissions());
        AerSmf smf = toAerSmf(external.getReductionClaim());

        // Emissions are calculated in the importing stage to ensure the
        // calculated emissions have valid values.
        aggregatedDataCalculator.calculateEmissions(aggregatedData, emissions, null, null);
        smfCalculator.calculateEmissions(smf);

        return StagingAer.builder()
            .payloadType(MrtmStagingPayloadType.AER_STAGING_PAYLOAD)
            .emissions(emissions)
            .aggregatedData(aggregatedData)
            .smf(smf)
            .build();
    }

    private AerSmf toAerSmf(ExternalAerReductionClaim reductionClaim) {
        AerSmfDetails details = null;
        boolean reductionClaimApplied = reductionClaim.getReductionClaimApplied();

        if (reductionClaimApplied) {
            List<AerSmfPurchase> purchases = reductionClaim.getReductionClaimDetails().getFuelPurchaseList()
                .stream()
                .map(this::toAerSmfPurchase)
                .collect(Collectors.toList());

            details = AerSmfDetails.builder()
                .purchases(purchases)
                .build();
        }
        return AerSmf.builder()
            .exist(reductionClaimApplied)
            .smfDetails(details)
            .build();
    }

    private AerSmfPurchase toAerSmfPurchase(ExternalAerReductionClaimPurchase purchase) {
        return AerSmfPurchase.builder()
            .uniqueIdentifier(UUID.randomUUID())
            .dataInputType(DataInputType.EXTERNAL_PROVIDER)
            .fuelOriginTypeName(toAerAggregatedDataFuelOriginTypeName(purchase.getFuelOriginCode(),
                purchase.getFuelTypeCode(), purchase.getOtherFuelType()))
            .smfMass(purchase.getFuelMass())
            .batchNumber(purchase.getBatchNumber())
            .co2EmissionFactor(purchase.getTtwEFCarbonDioxide())
            .build();
    }

    private AerAggregatedData toAerAggregatedData(ExternalAerAggregatedDataEmissions emissions) {
        Set<AerShipAggregatedData> aerShipAggregatedData = emissions.getShipEmissions().stream().map(
            emission -> AerShipAggregatedData.builder()
                .uniqueIdentifier(UUID.randomUUID())
                .isFromFetch(false)
                .dataInputType(DataInputType.EXTERNAL_PROVIDER)
                .fuelConsumptions(toAerAggregatedDataFuelConsumption(emission.getAnnualEmission().getEmissions()))
                .imoNumber(emission.getShipImoNumber())
                .emissionsWithinUKPorts(toAerPortEmissionsMeasurement(emission.getAnnualEmission().getEtsEmissionsWithinUkPort()))
                .emissionsBetweenUKPorts(toAerPortEmissionsMeasurement(emission.getAnnualEmission().getEtsEmissionsBetweenUkPort()))
                .emissionsBetweenUKAndNIVoyages(toAerPortEmissionsMeasurement(emission.getAnnualEmission().getEtsEmissionsBetweenUkAndNiPort()))
                .build()
        ).collect(Collectors.toCollection(LinkedHashSet::new));

        return AerAggregatedData.builder().emissions(aerShipAggregatedData).build();
    }

    private Set<AerAggregatedDataFuelConsumption> toAerAggregatedDataFuelConsumption(Set<ExternalAerAggregatedDataFuelConsumption> emissions) {
        return emissions.stream().map(
            consumption -> AerAggregatedDataFuelConsumption.builder()
                .totalConsumption(consumption.getAmount())
                .fuelOriginTypeName(toAerAggregatedDataFuelOriginTypeName(consumption.getFuelOriginCode(),
                    consumption.getFuelTypeCode(), consumption.getOtherFuelType()))
                .build()
        ).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private AerPortEmissionsMeasurement toAerPortEmissionsMeasurement(ExternalAerAggregatedDataEmissionsMeasurements externalEmissions) {
        return AerPortEmissionsMeasurement.builder()
            .co2(externalEmissions.getTco2Total())
            .n2o(externalEmissions.getTn2oeqTotal())
            .ch4(externalEmissions.getTch4eqTotal())
            .build();
    }

    private AerEmissions toAerEmissions(Set<ExternalAerShipEmissions> shipParticulars) {
        return AerEmissions.builder()
            .ships(shipParticulars.stream().map(
                ship -> {

                    ship.getFuelTypes().forEach(fuel -> createFuelTypeUuids(fuel.getFuelTypeCode(), fuel.getOtherFuelType()));

                    Set<AerFuelsAndEmissionsFactors> fuelsAndEmissionsFactors =
                        ship.getFuelTypes().stream()
                            .map(this::toFuelsAndEmissionsFactors)
                            .collect(Collectors.toCollection(LinkedHashSet::new));

                    Set<EmissionsSources> emissionsSources = ship.getEmissionsSources().stream()
                            .map(this::toEmpEmissionsSources)
                        .collect(Collectors.toCollection(LinkedHashSet::new));

                    AerDerogations aerDerogations = AerDerogations.builder()
                        .exceptionFromPerVoyageMonitoring(ship.getDerogations().getExceptionFromPerVoyageMonitoring())
                        .build();

                    return AerShipEmissions.builder()
                        .uniqueIdentifier(UUID.randomUUID())
                        .details(toShipDetails(ship))
                        .fuelsAndEmissionsFactors(fuelsAndEmissionsFactors)
                        .emissionsSources(emissionsSources)
                        .dataInputType(DataInputType.EXTERNAL_PROVIDER)
                        .uncertaintyLevel(ship.getUncertaintyLevel().stream().map(
                            this::toUncertaintyLevel).collect(Collectors.toCollection(LinkedHashSet::new)))
                        .derogations(aerDerogations)
                        .build();
                }
            ).collect(Collectors.toCollection(LinkedHashSet::new)))
            .build();
    }

    private EmissionsSources toEmpEmissionsSources(ExternalAerEmissionsSources emissionsSources) {
        return EmissionsSources.builder()
            .name(emissionsSources.getName())
            .type(emissionsSources.getEmissionSourceTypeCode())
            .sourceClass(emissionsSources.getEmissionSourceClassCode())
            .fuelDetails(emissionsSources.getFuelTypeCodes().stream()
                .map(this::toFuelOriginTypeName).collect(Collectors.toCollection(LinkedHashSet::new)))
            .monitoringMethod(emissionsSources.getMonitoringMethods())
            .uniqueIdentifier(UUID.randomUUID())
            .build();
    }

    private AerAggregatedDataFuelOriginTypeName toAerAggregatedDataFuelOriginTypeName(FuelOrigin fuelOriginCode, ExternalFuelType fuelTypeCode, String otherFuelType) {
        UUID fuelTypeUuid = getFuelTypeUuids(fuelTypeCode, otherFuelType);

        return switch (fuelOriginCode) {
            case FuelOrigin.BIOFUEL -> AerFuelOriginBiofuelTypeName.builder()
                .origin(fuelOriginCode)
                .type(BioFuelType.valueOf(fuelTypeCode.name()))
                .name(otherFuelType)
                .uniqueIdentifier(fuelTypeUuid)
                .build();
            case FuelOrigin.RFNBO -> AerFuelOriginEFuelTypeName.builder()
                .origin(fuelOriginCode)
                .type(EFuelType.valueOf(fuelTypeCode.name()))
                .name(otherFuelType)
                .uniqueIdentifier(fuelTypeUuid)
                .build();
            case FuelOrigin.FOSSIL -> AerFuelOriginFossilTypeName.builder()
                .origin(fuelOriginCode)
                .type(FossilFuelType.valueOf(fuelTypeCode.name()))
                .name(otherFuelType)
                .uniqueIdentifier(fuelTypeUuid)
                .build();
        };
    }

    private AerFuelsAndEmissionsFactors toFuelsAndEmissionsFactors(ExternalAerFuelsAndEmissionsFactors fuelFactor) {
        UUID fuelTypeUuid = getFuelTypeUuids(fuelFactor.getFuelTypeCode(),
            fuelFactor.getOtherFuelType());

        return switch (fuelFactor.getFuelOriginCode()) {
            case FuelOrigin.BIOFUEL -> AerBioFuels.builder()
                .uniqueIdentifier(fuelTypeUuid)
                .origin(fuelFactor.getFuelOriginCode())
                .type(BioFuelType.valueOf(fuelFactor.getFuelTypeCode().name()))
                .name(fuelFactor.getOtherFuelType())
                .carbonDioxide(fuelFactor.getTtwEFCarbonDioxide())
                .methane(fuelFactor.getTtwEFMethane())
                .nitrousOxide(fuelFactor.getTtwEFNitrousOxide())
                .build();
            case FuelOrigin.RFNBO -> AerEFuels.builder()
                .uniqueIdentifier(fuelTypeUuid)
                .origin(fuelFactor.getFuelOriginCode())
                .type(EFuelType.valueOf(fuelFactor.getFuelTypeCode().name()))
                .name(fuelFactor.getOtherFuelType())
                .carbonDioxide(fuelFactor.getTtwEFCarbonDioxide())
                .methane(fuelFactor.getTtwEFMethane())
                .nitrousOxide(fuelFactor.getTtwEFNitrousOxide())
                .build();
            case FuelOrigin.FOSSIL -> AerFossilFuels.builder()
                .uniqueIdentifier(fuelTypeUuid)
                .origin(fuelFactor.getFuelOriginCode())
                .type(FossilFuelType.valueOf(fuelFactor.getFuelTypeCode().name()))
                .name(fuelFactor.getOtherFuelType())
                .carbonDioxide(fuelFactor.getTtwEFCarbonDioxide())
                .methane(fuelFactor.getTtwEFMethane())
                .nitrousOxide(fuelFactor.getTtwEFNitrousOxide())
                .build();
        };
    }

    private AerShipDetails toShipDetails(ExternalAerShipEmissions ship) {
        return AerShipDetails.builder()
            .imoNumber(ship.getShipDetails().getShipImoNumber())
            .name(ship.getShipDetails().getName())
            .type(ship.getShipDetails().getShipType())
            .grossTonnage(ship.getShipDetails().getGrossTonnage())
            .flagState(ship.getShipDetails().getFlag())
            .iceClass(ship.getShipDetails().getIceClassPolarCode())
            .natureOfReportingResponsibility(ship.getShipDetails().getCompanyNature())
            .allYear(ship.getShipDetails().getAllYear())
            .from(ship.getShipDetails().getFrom())
            .to(ship.getShipDetails().getTo())
            .build();
    }
}
