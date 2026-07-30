package uk.gov.mrtm.api.integration.external.emp.transform;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlan;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmpProcedureForm;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmpProcedureFormWithFiles;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.controlactivities.EmpControlActivities;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.controlactivities.EmpOutsourcedActivities;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.datagaps.EmpDataGaps;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.EmpCarbonCapture;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.EmpCarbonCaptureTechnologies;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.EmpEmissions;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.EmpShipEmissions;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.ShipDetails;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.BioFuelType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.EFuelType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.FossilFuelType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.FuelOrigin;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.exemptionconditions.ExemptionConditions;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.EmpFuelsAndEmissionsFactors;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.biofuel.EmpBioFuels;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.efuel.EmpEFuels;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.fossil.EmpFossilFuels;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.measurementdescription.MeasurementDescription;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.sources.EmpEmissionsSources;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.sources.FuelOriginTypeName;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.uncertainty.UncertaintyLevel;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissionsources.EmpEmissionCompliance;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissionsources.EmpEmissionFactors;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissionsources.EmpEmissionSources;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.managementprocedures.EmpManagementProcedures;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.mandate.EmpMandate;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.mandate.EmpRegisteredOwner;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.mandate.RegisteredOwnerShipDetails;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.monitoringreenhousegas.EmpMonitoringGreenhouseGas;
import uk.gov.mrtm.api.integration.external.common.MrtmStagingPayloadType;
import uk.gov.mrtm.api.integration.external.common.mapper.ExternalCommonMapper;
import uk.gov.mrtm.api.integration.external.emp.domain.ExternalEmissionsMonitoringPlan;
import uk.gov.mrtm.api.integration.external.emp.domain.StagingEmissionsMonitoringPlan;
import uk.gov.mrtm.api.integration.external.emp.domain.datagaps.ExternalEmpDataGaps;
import uk.gov.mrtm.api.integration.external.emp.domain.delegatedresponsibility.ExternalEmpDelegatedResponsibility;
import uk.gov.mrtm.api.integration.external.emp.domain.delegatedresponsibility.ExternalEmpRegisteredOwner;
import uk.gov.mrtm.api.integration.external.emp.domain.delegatedresponsibility.ExternalEmpRegisteredOwnerShipDetails;
import uk.gov.mrtm.api.integration.external.emp.domain.procedures.ExternalEmpControlActivitiesProcedures;
import uk.gov.mrtm.api.integration.external.emp.domain.procedures.ExternalEmpEmissionFactorsProcedure;
import uk.gov.mrtm.api.integration.external.emp.domain.procedures.ExternalEmpEmissionsProcedures;
import uk.gov.mrtm.api.integration.external.emp.domain.procedures.ExternalEmpFuelConsumptionProcedures;
import uk.gov.mrtm.api.integration.external.emp.domain.procedures.ExternalEmpManagementProcedures;
import uk.gov.mrtm.api.integration.external.emp.domain.procedures.ExternalEmpOutsourcedActivitiesProcedure;
import uk.gov.mrtm.api.integration.external.emp.domain.procedures.ExternalEmpProcedureForm;
import uk.gov.mrtm.api.integration.external.emp.domain.procedures.ExternalEmpProcedures;
import uk.gov.mrtm.api.integration.external.emp.domain.procedures.ExternalEmpReductionClaimProcedure;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpCarbonCapture;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpEmissionsSources;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpExemptionConditions;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpFuelOriginTypeName;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpFuelsAndEmissionsFactors;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpMeasurementDescription;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpShipDetails;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpShipEmissions;
import uk.gov.mrtm.api.integration.external.emp.domain.shipemissions.ExternalEmpUncertaintyLevel;
import uk.gov.mrtm.api.integration.external.emp.enums.ExternalFuelType;

import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ExternalEmpMapper extends ExternalCommonMapper {

    public StagingEmissionsMonitoringPlan toStagingEmissionsMonitoringPlan(ExternalEmissionsMonitoringPlan external) {

        EmpMandate empMandate = toEmpMandate(external.getDelegatedResponsibility());
        EmpMonitoringGreenhouseGas greenhouseGas = toEmpMonitoringGreenhouseGas(external.getProcedures().getFuelConsumptionProcedures());
        EmpManagementProcedures managementProcedures = toEmpManagementProcedures(external.getProcedures().getManagementProcedures());
        EmpControlActivities controlActivities = toEmpControlActivities(external.getProcedures().getControlActivitiesProcedures());
        EmpDataGaps dataGaps = toEmpDataGaps(external.getDataGaps());
        EmpEmissionSources sources = toEmpEmissionSources(external.getProcedures().getEmissionsProcedures());
        EmpEmissions emissions = toEmpEmissions(external.getShipParticulars());

        return StagingEmissionsMonitoringPlan.builder()
            .payloadType(MrtmStagingPayloadType.EMP_STAGING_PAYLOAD)
            .mandate(empMandate)
            .greenhouseGas(greenhouseGas)
            .managementProcedures(managementProcedures)
            .controlActivities(controlActivities)
            .dataGaps(dataGaps)
            .sources(sources)
            .emissions(emissions)
            .build();
    }

    public ExternalEmissionsMonitoringPlan toExternalEmissionsMonitoringPlan(EmissionsMonitoringPlan emp) {

        Set<ExternalEmpShipEmissions> shipParticulars = toExternalEmpShipEmissions(emp.getEmissions());
        ExternalEmpDelegatedResponsibility delegatedResponsibility = toExternalEmpDelegatedResponsibility(emp.getMandate());
        ExternalEmpProcedures procedures = toExternalEmpProcedures(emp.getGreenhouseGas(), emp.getManagementProcedures(), emp.getControlActivities(), emp.getSources());
        ExternalEmpDataGaps dataGaps = toExternalEmpDataGaps(emp.getDataGaps());

        return ExternalEmissionsMonitoringPlan.builder()
            .shipParticulars(shipParticulars)
            .delegatedResponsibility(delegatedResponsibility)
            .procedures(procedures)
            .dataGaps(dataGaps)
            .build();
    }

    private Set<ExternalEmpShipEmissions> toExternalEmpShipEmissions(EmpEmissions emissions) {
        return emissions.getShips().stream()
            .map(ship -> ExternalEmpShipEmissions.builder()
                .shipDetails(toExternalEmpShipDetails(ship.getDetails()))
                .fuelTypes(toExternalEmpFuelsAndEmissionsFactors(ship.getFuelsAndEmissionsFactors()))
                .emissionsSources(toExternalEmpEmissionsSources(ship.getEmissionsSources()))
                .uncertaintyLevel(toExternalEmpUncertaintyLevel(ship.getUncertaintyLevel()))
                .ccsCcu(toExternalEmpCarbonCapture(ship.getCarbonCapture()))
                .measuringEquipment(toExternalEmpMeasurementDescription(ship.getMeasurements()))
                .conditionsOfExemption(toExternalEmpExemptionConditions(ship.getExemptionConditions()))
                .build())
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<ExternalEmpFuelsAndEmissionsFactors> toExternalEmpFuelsAndEmissionsFactors(Set<EmpFuelsAndEmissionsFactors> fuelsAndEmissionsFactors) {
        return fuelsAndEmissionsFactors.stream()
            .map(factors ->
                ExternalEmpFuelsAndEmissionsFactors.builder()
                    .fuelOriginCode(factors.getOrigin())
                    .fuelTypeCode(ExternalFuelType.valueOf(factors.getTypeAsString()))
                    .otherFuelType(factors.getName())
                    .ttwEFCarbonDioxide(factors.getCarbonDioxide())
                    .ttwEFMethane(factors.getMethane())
                    .ttwEFNitrousOxide(factors.getNitrousOxide())
                    .methodDensityBunkerCode(factors.getDensityMethodBunker())
                    .methodDensityTankCode(factors.getDensityMethodTank())
                    .build()
            )
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<ExternalEmpEmissionsSources> toExternalEmpEmissionsSources(Set<EmpEmissionsSources> emissionsSources) {
        return emissionsSources.stream()
            .map(source ->
                ExternalEmpEmissionsSources.builder()
                    .name(source.getName())
                    .emissionSourceTypeCode(source.getType())
                    .emissionSourceClassCode(source.getSourceClass())
                    .fuelTypeCodes(toExternalEmpFuelOriginTypeName(source.getFuelDetails()))
                    .monitoringMethods(source.getMonitoringMethod())
                    .identificationNumber(source.getReferenceNumber())
                    .build())
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<ExternalEmpFuelOriginTypeName> toExternalEmpFuelOriginTypeName(Set<FuelOriginTypeName> fuelDetails) {
        return fuelDetails.stream()
            .map(fuelOriginTypeName ->
                ExternalEmpFuelOriginTypeName.builder()
                    .fuelOriginCode(fuelOriginTypeName.getOrigin())
                    .fuelTypeCode(ExternalFuelType.valueOf(fuelOriginTypeName.getTypeAsString()))
                    .otherFuelType(fuelOriginTypeName.getName())
                    .slipPercentage(fuelOriginTypeName.getMethaneSlip())
                    .build())
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<ExternalEmpUncertaintyLevel> toExternalEmpUncertaintyLevel(Set<UncertaintyLevel> uncertaintyLevel) {
        return uncertaintyLevel.stream()
            .map(level ->
                ExternalEmpUncertaintyLevel.builder()
                    .monitoringMethodCode(level.getMonitoringMethod())
                    .levelOfUncertaintyTypeCode(level.getMethodApproach())
                    .shipSpecificUncertainty(level.getValue())
                    .build())
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private ExternalEmpCarbonCapture toExternalEmpCarbonCapture(EmpCarbonCapture carbonCapture) {
        return ExternalEmpCarbonCapture.builder()
            .captureAndStorageApplied(carbonCapture.getExist())
            .technology(Optional.ofNullable(carbonCapture.getTechnologies()).map(EmpCarbonCaptureTechnologies::getDescription).orElse(null))
            .emissionSourceName(Optional.ofNullable(carbonCapture.getTechnologies()).map(EmpCarbonCaptureTechnologies::getTechnologyEmissionSources).orElse(new LinkedHashSet<>()))
            .build();
    }

    private Set<ExternalEmpMeasurementDescription> toExternalEmpMeasurementDescription(Set<MeasurementDescription> measurements) {
        return measurements.stream().map(measurement ->
                ExternalEmpMeasurementDescription.builder()
                    .name(measurement.getName())
                    .technicalDescription(measurement.getTechnicalDescription())
                    .emissionSourceName(measurement.getEmissionSources())
                    .build())
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private ExternalEmpExemptionConditions toExternalEmpExemptionConditions(ExemptionConditions exemptionConditions) {
        return ExternalEmpExemptionConditions.builder()
            .derogationCodeUsed(exemptionConditions.getExist())
            .minimumNumberOfVoyages(exemptionConditions.getMinVoyages())
            .build();
    }

    private ExternalEmpShipDetails toExternalEmpShipDetails(ShipDetails details) {
        return ExternalEmpShipDetails.builder()
            .shipImoNumber(details.getImoNumber())
            .name(details.getName())
            .shipType(details.getType())
            .grossTonnage(details.getGrossTonnage())
            .flag(details.getFlagState())
            .iceClassPolarCode(details.getIceClass())
            .companyNature(details.getNatureOfReportingResponsibility())
            .build();
    }

    private ExternalEmpProcedures toExternalEmpProcedures(EmpMonitoringGreenhouseGas greenhouseGas,
                                                          EmpManagementProcedures managementProcedures,
                                                          EmpControlActivities controlActivities,
                                                          EmpEmissionSources sources) {

        return ExternalEmpProcedures.builder()
            .emissionsProcedures(toEmissionsProcedures(sources))
            .fuelConsumptionProcedures(toFuelConsumptionProcedures(greenhouseGas))
            .managementProcedures(toManagementProcedures(managementProcedures))
            .controlActivitiesProcedures(toControlActivitiesProcedures(controlActivities))
            .build();
    }

    private ExternalEmpEmissionsProcedures toEmissionsProcedures(EmpEmissionSources sources) {
        return ExternalEmpEmissionsProcedures.builder()
            .emissionSourcesProcedure(toExternalEmpProcedureForm(sources.getListCompletion()))
            .emissionFactorsProcedure(toExternalEmpEmissionFactorsProcedure(sources.getEmissionFactors()))
            .reductionClaimProcedure(toExternalEmpReductionClaimProcedure(sources.getEmissionCompliance()))
            .build();
    }

    private ExternalEmpReductionClaimProcedure toExternalEmpReductionClaimProcedure(EmpEmissionCompliance emissionCompliance) {
        return ExternalEmpReductionClaimProcedure.builder()
            .emissionsReductionClaimExists(emissionCompliance.isExist())
            .reductionClaimProcedureDetails(toExternalEmpProcedureForm(emissionCompliance.getCriteria()))
            .build();
    }

    private ExternalEmpEmissionFactorsProcedure toExternalEmpEmissionFactorsProcedure(EmpEmissionFactors emissionFactors) {
        return ExternalEmpEmissionFactorsProcedure.builder()
            .defaultFactorsUsed(emissionFactors.isExist())
            .emissionFactorsProcedureDetails(toExternalEmpProcedureForm(emissionFactors.getFactors()))
            .build();
    }

    private ExternalEmpManagementProcedures toManagementProcedures(EmpManagementProcedures managementProcedures) {
        return ExternalEmpManagementProcedures.builder()
            .monitoringReportingRoles(managementProcedures.getMonitoringReportingRoles())
            .adequacyCheckProcedure(toExternalEmpProcedureForm(managementProcedures.getRegularCheckOfAdequacy()))
            .dataFlowActivitiesProcedure(toExternalEmpProcedureForm(managementProcedures.getDataFlowActivities()))
            .riskAssessmentProcedure(toExternalEmpProcedureForm(managementProcedures.getRiskAssessmentProcedures()))
            .build();
    }

    private ExternalEmpControlActivitiesProcedures toControlActivitiesProcedures(EmpControlActivities controlActivities) {
        return ExternalEmpControlActivitiesProcedures.builder()
            .qaItProcedure(toExternalEmpProcedureForm(controlActivities.getQualityAssurance()))
            .dataReviewProcedure(toExternalEmpProcedureForm(controlActivities.getInternalReviews()))
            .correctionsProcedure(toExternalEmpProcedureForm(controlActivities.getCorrections()))
            .outsourcedActivitiesProcedure(toExternalEmpOutsourcedActivitiesProcedure(controlActivities.getOutsourcedActivities()))
            .documentationProcedure(toExternalEmpProcedureForm(controlActivities.getDocumentation()))
            .build();
    }

    private ExternalEmpOutsourcedActivitiesProcedure toExternalEmpOutsourcedActivitiesProcedure(EmpOutsourcedActivities outsourcedActivities) {
        return ExternalEmpOutsourcedActivitiesProcedure.builder()
            .outsourcedActivitiesExists(outsourcedActivities.getExist())
            .details(toExternalEmpProcedureForm(outsourcedActivities.getDetails()))
            .build();
    }

    private ExternalEmpFuelConsumptionProcedures toFuelConsumptionProcedures(EmpMonitoringGreenhouseGas greenhouseGas) {
        return ExternalEmpFuelConsumptionProcedures.builder()
            .fuelBunkeredAndInTanksProcedure(toExternalEmpProcedureForm(greenhouseGas.getFuel()))
            .bunkeringCrossChecksProcedure(toExternalEmpProcedureForm(greenhouseGas.getCrossChecks()))
            .informationManagementProcedure(toExternalEmpProcedureForm(greenhouseGas.getInformation()))
            .equipmentQualityAssuranceProcedure(toExternalEmpProcedureForm(greenhouseGas.getQaEquipment()))
            .voyagesCompletenessProcedure(toExternalEmpProcedureForm(greenhouseGas.getVoyages()))
            .build();
    }

    private ExternalEmpProcedureForm toExternalEmpProcedureForm(EmpProcedureForm empProcedureForm) {
        if (empProcedureForm == null) {
            return null;
        }

        return ExternalEmpProcedureForm.builder()
            .referenceExistingProcedure(empProcedureForm.getReference())
            .versionExistingProcedure(empProcedureForm.getVersion())
            .description(empProcedureForm.getDescription())
            .responsiblePerson(empProcedureForm.getResponsiblePersonOrPosition())
            .locationOfRecords(empProcedureForm.getRecordsLocation())
            .itSystem(empProcedureForm.getItSystemUsed())
            .build();
    }

    private ExternalEmpDelegatedResponsibility toExternalEmpDelegatedResponsibility(EmpMandate mandate) {
        return ExternalEmpDelegatedResponsibility.builder()
            .delegatedResponsibilityUsed(mandate.getExist())
            .registeredOwners(toExternalEmpRegisteredOwner(mandate.getRegisteredOwners()))
            .responsibilityDeclaration(mandate.getResponsibilityDeclaration())
            .build();
    }

    private Set<ExternalEmpRegisteredOwner> toExternalEmpRegisteredOwner(Set<EmpRegisteredOwner> registeredOwners) {
        return registeredOwners.stream().map(owner ->
            ExternalEmpRegisteredOwner.builder()
                .name(owner.getName())
                .companyImoNumber(owner.getImoNumber())
                .contactName(owner.getContactName())
                .email(owner.getEmail())
                .agreementDate(owner.getEffectiveDate())
                .ships(toExternalEmpRegisteredOwnerShipDetails(owner.getShips()))
                .build()
        ).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<ExternalEmpRegisteredOwnerShipDetails> toExternalEmpRegisteredOwnerShipDetails(Set<RegisteredOwnerShipDetails> ships) {
        return ships.stream().map(ship ->
            ExternalEmpRegisteredOwnerShipDetails.builder()
                .name(ship.getName())
                .shipImoNumber(ship.getImoNumber())
                .build()
        ).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private ExternalEmpDataGaps toExternalEmpDataGaps(EmpDataGaps dataGaps) {
        return ExternalEmpDataGaps.builder()
            .formulaeUsed(dataGaps.getFormulaeUsed())
            .fuelConsumptionEstimationMethod(dataGaps.getFuelConsumptionEstimationMethod())
            .responsiblePerson(dataGaps.getResponsiblePersonOrPosition())
            .dataSources(dataGaps.getDataSources())
            .locationOfRecords(dataGaps.getRecordsLocation())
            .itSystem(dataGaps.getItSystemUsed())
            .build();
    }

    private EmpMandate toEmpMandate(ExternalEmpDelegatedResponsibility delegatedResponsibility) {

        Set<EmpRegisteredOwner> registeredOwners = new LinkedHashSet<>();
        Boolean delegatedResponsibilityUsed = delegatedResponsibility.getDelegatedResponsibilityUsed();

        if (delegatedResponsibilityUsed) {
            registeredOwners = delegatedResponsibility.getRegisteredOwners().stream().map(
                registeredOwner -> EmpRegisteredOwner.builder()
                    .uniqueIdentifier(UUID.randomUUID())
                    .name(registeredOwner.getName())
                    .imoNumber(registeredOwner.getCompanyImoNumber())
                    .contactName(registeredOwner.getContactName())
                    .email(registeredOwner.getEmail())
                    .effectiveDate(registeredOwner.getAgreementDate())
                    .ships(registeredOwner.getShips().stream().map(
                        ship -> RegisteredOwnerShipDetails.builder()
                            .name(ship.getName())
                            .imoNumber(ship.getShipImoNumber())
                            .build()
                    ).collect(Collectors.toCollection(LinkedHashSet::new)))
                    .build()
            ).collect(Collectors.toCollection(LinkedHashSet::new));
        }

        return EmpMandate.builder()
            .exist(delegatedResponsibilityUsed)
            .responsibilityDeclaration(delegatedResponsibility.getResponsibilityDeclaration())
            .registeredOwners(registeredOwners)
            .build();
    }

    private EmpMonitoringGreenhouseGas toEmpMonitoringGreenhouseGas(ExternalEmpFuelConsumptionProcedures greenhouseGas) {
        return EmpMonitoringGreenhouseGas.builder()
            .fuel(toEmpProcedureForm(greenhouseGas.getFuelBunkeredAndInTanksProcedure()))
            .crossChecks(toEmpProcedureForm(greenhouseGas.getBunkeringCrossChecksProcedure()))
            .information(toEmpProcedureForm(greenhouseGas.getInformationManagementProcedure()))
            .qaEquipment(toEmpProcedureForm(greenhouseGas.getEquipmentQualityAssuranceProcedure()))
            .voyages(toEmpProcedureForm(greenhouseGas.getVoyagesCompletenessProcedure()))
            .build();
    }

    private EmpManagementProcedures toEmpManagementProcedures(ExternalEmpManagementProcedures managementProcedures) {
        return EmpManagementProcedures.builder()
            .monitoringReportingRoles(managementProcedures.getMonitoringReportingRoles())
            .regularCheckOfAdequacy(toEmpProcedureForm(managementProcedures.getAdequacyCheckProcedure()))
            .dataFlowActivities(toEmpProcedureFormWithFiles(managementProcedures.getDataFlowActivitiesProcedure()))
            .riskAssessmentProcedures(toEmpProcedureFormWithFiles(managementProcedures.getRiskAssessmentProcedure()))
            .build();
    }

    private EmpControlActivities toEmpControlActivities(ExternalEmpControlActivitiesProcedures controlActivities) {
        Boolean activitiesExists = controlActivities.getOutsourcedActivitiesProcedure().getOutsourcedActivitiesExists();
        EmpProcedureForm details = toEmpProcedureForm(controlActivities.getOutsourcedActivitiesProcedure().getDetails());

        return EmpControlActivities.builder()
            .qualityAssurance(toEmpProcedureForm(controlActivities.getQaItProcedure()))
            .internalReviews(toEmpProcedureForm(controlActivities.getDataReviewProcedure()))
            .corrections(toEmpProcedureForm(controlActivities.getCorrectionsProcedure()))
            .outsourcedActivities(EmpOutsourcedActivities.builder()
                .exist(activitiesExists)
                .details(details)
                .build())
            .documentation(toEmpProcedureForm(controlActivities.getDocumentationProcedure()))
            .build();
    }

    private EmpDataGaps toEmpDataGaps(ExternalEmpDataGaps dataGaps) {
        return EmpDataGaps.builder()
            .formulaeUsed(dataGaps.getFormulaeUsed())
            .fuelConsumptionEstimationMethod(dataGaps.getFuelConsumptionEstimationMethod())
            .responsiblePersonOrPosition(dataGaps.getResponsiblePerson())
            .dataSources(dataGaps.getDataSources())
            .recordsLocation(dataGaps.getLocationOfRecords())
            .itSystemUsed(dataGaps.getItSystem())
            .build();
    }

    private EmpEmissionSources toEmpEmissionSources(ExternalEmpEmissionsProcedures emissionsProcedures) {
        Boolean defaultFactorsUsed = emissionsProcedures.getEmissionFactorsProcedure().getDefaultFactorsUsed();
        EmpProcedureForm factors = toEmpProcedureForm(emissionsProcedures.getEmissionFactorsProcedure().getEmissionFactorsProcedureDetails());

        Boolean emissionsReductionClaimExists = emissionsProcedures.getReductionClaimProcedure().getEmissionsReductionClaimExists();
        EmpProcedureForm criteria = toEmpProcedureForm(emissionsProcedures.getReductionClaimProcedure().getReductionClaimProcedureDetails());

        return EmpEmissionSources.builder()
            .listCompletion(toEmpProcedureForm(emissionsProcedures.getEmissionSourcesProcedure()))
            .emissionFactors(EmpEmissionFactors.builder()
                .exist(defaultFactorsUsed)
                .factors(factors)
                .build())
            .emissionCompliance(EmpEmissionCompliance.builder()
                .exist(emissionsReductionClaimExists)
                .criteria(criteria)
                .build())
            .build();
    }

    private EmpEmissions toEmpEmissions(Set<ExternalEmpShipEmissions> shipParticulars) {
        return EmpEmissions.builder()
            .ships(shipParticulars.stream().map(
                ship -> {

                    ship.getFuelTypes().forEach(fuel -> createFuelTypeUuids(fuel.getFuelTypeCode(), fuel.getOtherFuelType()));

                    Set<EmpFuelsAndEmissionsFactors> fuelsAndEmissionsFactors =
                        ship.getFuelTypes().stream()
                            .map(this::toFuelsAndEmissionsFactors)
                            .collect(Collectors.toCollection(LinkedHashSet::new));

                    Set<EmpEmissionsSources> emissionsSources = ship.getEmissionsSources().stream()
                            .map(this::toEmpEmissionsSources)
                        .collect(Collectors.toCollection(LinkedHashSet::new));

                    return EmpShipEmissions.builder()
                        .uniqueIdentifier(UUID.randomUUID())
                        .details(toShipDetails(ship))
                        .fuelsAndEmissionsFactors(fuelsAndEmissionsFactors)
                        .emissionsSources(emissionsSources)
                        .uncertaintyLevel(ship.getUncertaintyLevel().stream().map(
                            this::toUncertaintyLevel).collect(Collectors.toCollection(LinkedHashSet::new)))
                        .carbonCapture(toEmpCarbonCapture(ship))
                        .measurements(ship.getMeasuringEquipment().stream().map(this::toMeasurementDescription).collect(Collectors.toCollection(LinkedHashSet::new)))
                        .exemptionConditions(toExemptionConditions(ship))
                        .build();
                }
            ).collect(Collectors.toCollection(LinkedHashSet::new)))
            .build();
    }

    private EmpEmissionsSources toEmpEmissionsSources(ExternalEmpEmissionsSources emissionsSources) {
        return EmpEmissionsSources.builder()
            .name(emissionsSources.getName())
            .type(emissionsSources.getEmissionSourceTypeCode())
            .sourceClass(emissionsSources.getEmissionSourceClassCode())
            .fuelDetails(emissionsSources.getFuelTypeCodes().stream()
                .map(this::toFuelOriginTypeName).collect(Collectors.toCollection(LinkedHashSet::new)))
            .monitoringMethod(emissionsSources.getMonitoringMethods())
            .referenceNumber(emissionsSources.getIdentificationNumber())
            .uniqueIdentifier(UUID.randomUUID())
            .build();
    }


    private EmpFuelsAndEmissionsFactors toFuelsAndEmissionsFactors(ExternalEmpFuelsAndEmissionsFactors fuelFactor) {
        UUID fuelTypeUuid = getFuelTypeUuids(fuelFactor.getFuelTypeCode(),
            fuelFactor.getOtherFuelType());

        return switch (fuelFactor.getFuelOriginCode()) {
            case FuelOrigin.BIOFUEL -> EmpBioFuels.builder()
                .uniqueIdentifier(fuelTypeUuid)
                .origin(fuelFactor.getFuelOriginCode())
                .type(BioFuelType.valueOf(fuelFactor.getFuelTypeCode().name()))
                .name(fuelFactor.getOtherFuelType())
                .carbonDioxide(fuelFactor.getTtwEFCarbonDioxide())
                .methane(fuelFactor.getTtwEFMethane())
                .nitrousOxide(fuelFactor.getTtwEFNitrousOxide())
                .densityMethodBunker(fuelFactor.getMethodDensityBunkerCode())
                .densityMethodTank(fuelFactor.getMethodDensityTankCode())
                .build();
            case FuelOrigin.RFNBO -> EmpEFuels.builder()
                .uniqueIdentifier(fuelTypeUuid)
                .origin(fuelFactor.getFuelOriginCode())
                .type(EFuelType.valueOf(fuelFactor.getFuelTypeCode().name()))
                .name(fuelFactor.getOtherFuelType())
                .carbonDioxide(fuelFactor.getTtwEFCarbonDioxide())
                .methane(fuelFactor.getTtwEFMethane())
                .nitrousOxide(fuelFactor.getTtwEFNitrousOxide())
                .densityMethodBunker(fuelFactor.getMethodDensityBunkerCode())
                .densityMethodTank(fuelFactor.getMethodDensityTankCode())
                .build();
            case FuelOrigin.FOSSIL -> EmpFossilFuels.builder()
                .uniqueIdentifier(fuelTypeUuid)
                .origin(fuelFactor.getFuelOriginCode())
                .type(FossilFuelType.valueOf(fuelFactor.getFuelTypeCode().name()))
                .name(fuelFactor.getOtherFuelType())
                .carbonDioxide(fuelFactor.getTtwEFCarbonDioxide())
                .methane(fuelFactor.getTtwEFMethane())
                .nitrousOxide(fuelFactor.getTtwEFNitrousOxide())
                .densityMethodBunker(fuelFactor.getMethodDensityBunkerCode())
                .densityMethodTank(fuelFactor.getMethodDensityTankCode())
                .build();
        };
    }

    private ExemptionConditions toExemptionConditions(ExternalEmpShipEmissions ship) {
        return ExemptionConditions.builder()
            .exist(ship.getConditionsOfExemption().getDerogationCodeUsed())
            .minVoyages(ship.getConditionsOfExemption().getMinimumNumberOfVoyages())
            .build();
    }

    private MeasurementDescription toMeasurementDescription(ExternalEmpMeasurementDescription equipment) {
        return MeasurementDescription.builder()
            .name(equipment.getName())
            .technicalDescription(equipment.getTechnicalDescription())
            .emissionSources(equipment.getEmissionSourceName())
            .build();
    }

    private EmpCarbonCapture toEmpCarbonCapture(ExternalEmpShipEmissions ship) {
        EmpCarbonCaptureTechnologies technologies = null;

        Boolean captureAndStorageApplied = ship.getCcsCcu().getCaptureAndStorageApplied();
        if (captureAndStorageApplied) {
            technologies = EmpCarbonCaptureTechnologies.builder()
                .description(ship.getCcsCcu().getTechnology())
                .technologyEmissionSources(ship.getCcsCcu().getEmissionSourceName())
                .build();
        }

        return EmpCarbonCapture.builder()
            .exist(captureAndStorageApplied)
            .technologies(technologies)
            .build();
    }

    private ShipDetails toShipDetails(ExternalEmpShipEmissions ship) {
        return ShipDetails.builder()
            .imoNumber(ship.getShipDetails().getShipImoNumber())
            .name(ship.getShipDetails().getName())
            .type(ship.getShipDetails().getShipType())
            .grossTonnage(ship.getShipDetails().getGrossTonnage())
            .flagState(ship.getShipDetails().getFlag())
            .iceClass(ship.getShipDetails().getIceClassPolarCode())
            .natureOfReportingResponsibility(ship.getShipDetails().getCompanyNature())
            .build();
    }

    private EmpProcedureForm toEmpProcedureForm(ExternalEmpProcedureForm empProcedureForm) {
        if (empProcedureForm == null) {
            return null;
        }

        return EmpProcedureForm.builder()
            .reference(empProcedureForm.getReferenceExistingProcedure())
            .version(empProcedureForm.getVersionExistingProcedure())
            .description(empProcedureForm.getDescription())
            .responsiblePersonOrPosition(empProcedureForm.getResponsiblePerson())
            .recordsLocation(empProcedureForm.getLocationOfRecords())
            .itSystemUsed(empProcedureForm.getItSystem())
            .build();
    }

    private EmpProcedureFormWithFiles toEmpProcedureFormWithFiles(ExternalEmpProcedureForm empProcedureForm) {
        return EmpProcedureFormWithFiles.builder()
            .reference(empProcedureForm.getReferenceExistingProcedure())
            .version(empProcedureForm.getVersionExistingProcedure())
            .description(empProcedureForm.getDescription())
            .responsiblePersonOrPosition(empProcedureForm.getResponsiblePerson())
            .recordsLocation(empProcedureForm.getLocationOfRecords())
            .itSystemUsed(empProcedureForm.getItSystem())
            .build();
    }
}
