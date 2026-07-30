package uk.gov.mrtm.api.integration.external.emp.transform;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
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
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.DensityMethodBunker;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.DensityMethodTank;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.EFuelType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.EmissionSourceClass;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.EmissionSourceType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.FlagState;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.FossilFuelType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.FuelOrigin;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.IceClass;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.MonitoringMethod;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.ReportingResponsibilityNature;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.constants.ShipType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.exemptionconditions.ExemptionConditions;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.EmpFuelsAndEmissionsFactors;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.biofuel.EmpBioFuels;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.biofuel.FuelOriginBiofuelTypeName;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.efuel.EmpEFuels;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.efuel.FuelOriginEFuelTypeName;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.fossil.EmpFossilFuels;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.fuel.fossil.FuelOriginFossilTypeName;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.measurementdescription.MeasurementDescription;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.sources.EmpEmissionsSources;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.sources.MethaneSlipValueType;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.uncertainty.MethodApproach;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissions.uncertainty.UncertaintyLevel;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissionsources.EmpEmissionCompliance;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissionsources.EmpEmissionFactors;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.emissionsources.EmpEmissionSources;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.managementprocedures.EmpManagementProcedures;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.managementprocedures.EmpMonitoringReportingRole;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.mandate.EmpMandate;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.mandate.EmpRegisteredOwner;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.mandate.RegisteredOwnerShipDetails;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.monitoringreenhousegas.EmpMonitoringGreenhouseGas;
import uk.gov.mrtm.api.integration.external.common.MrtmStagingPayloadType;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.mockito.Mockito.mockStatic;

@ExtendWith(MockitoExtension.class)
class ExternalEmpMapperTest {

    private static final UUID REGISTERED_OWNER_ID = UUID.randomUUID();
    private static final UUID METHANOL_FUEL_ID = UUID.randomUUID();
    private static final UUID E_METHANOL_FUEL_ID = UUID.randomUUID();
    private static final UUID BIO_METHANOL_FUEL_ID = UUID.randomUUID();
    private static final UUID OTHER_FUEL_ID = UUID.randomUUID();
    private static final UUID EMISSION_SOURCE = UUID.randomUUID();
    private static final UUID EMP_SHIP_EMISSIONS_ID = UUID.randomUUID();

    @InjectMocks
    private ExternalEmpMapper externalEmpMapper;

    private static MockedStatic<UUID> mockedSettings;

    @BeforeAll
    public static void init() {
        mockedSettings = mockStatic(UUID.class);
    }

    @AfterAll
    public static void close() {
        mockedSettings.close();
    }

    @Test
    void toStagingEmissionsMonitoringPlan() {
        boolean captureAndStorageApplied = true;
        boolean derogationCodeUsed = true;
        boolean defaultFactorsUsed = false;
        boolean emissionsReductionClaimExists = true;
        boolean delegatedResponsibilityUsed = true;
        boolean outsourcedActivitiesExists = true;

        mockedSettings.when(UUID::randomUUID)
            .thenReturn(REGISTERED_OWNER_ID)
            .thenReturn(METHANOL_FUEL_ID)
            .thenReturn(E_METHANOL_FUEL_ID)
            .thenReturn(BIO_METHANOL_FUEL_ID)
            .thenReturn(OTHER_FUEL_ID)
            .thenReturn(EMISSION_SOURCE)
            .thenReturn(EMP_SHIP_EMISSIONS_ID);

        ExternalEmissionsMonitoringPlan expectedExternal = createExternalEmissionsMonitoringPlan(captureAndStorageApplied,
            derogationCodeUsed, defaultFactorsUsed, emissionsReductionClaimExists, delegatedResponsibilityUsed, outsourcedActivitiesExists);

        StagingEmissionsMonitoringPlan expectedStaging = createStagingEmissionsMonitoringPlan(captureAndStorageApplied,
            derogationCodeUsed, defaultFactorsUsed, emissionsReductionClaimExists, delegatedResponsibilityUsed, outsourcedActivitiesExists);

        StagingEmissionsMonitoringPlan actualStaging = externalEmpMapper.toStagingEmissionsMonitoringPlan(expectedExternal);

        assertEquals(expectedStaging, actualStaging);

        EmissionsMonitoringPlan emissionsMonitoringPlan = EmissionsMonitoringPlan.builder()
            .emissions(actualStaging.getEmissions())
            .mandate(actualStaging.getMandate())
            .sources(actualStaging.getSources())
            .greenhouseGas(actualStaging.getGreenhouseGas())
            .managementProcedures(actualStaging.getManagementProcedures())
            .controlActivities(actualStaging.getControlActivities())
            .dataGaps(actualStaging.getDataGaps())
            .build();

        ExternalEmissionsMonitoringPlan actualExternal = externalEmpMapper.toExternalEmissionsMonitoringPlan(emissionsMonitoringPlan);

        assertEquals(expectedExternal, actualExternal);
    }

    @Test
    void toStagingEmissionsMonitoringPlan_without_optional_fields() {
        boolean captureAndStorageApplied = false;
        boolean derogationCodeUsed = false;
        boolean defaultFactorsUsed = true;
        boolean emissionsReductionClaimExists = false;
        boolean delegatedResponsibilityUsed = false;
        boolean outsourcedActivitiesExists = false;

        mockedSettings.when(UUID::randomUUID)
            .thenReturn(METHANOL_FUEL_ID)
            .thenReturn(E_METHANOL_FUEL_ID)
            .thenReturn(BIO_METHANOL_FUEL_ID)
            .thenReturn(OTHER_FUEL_ID)
            .thenReturn(EMISSION_SOURCE)
            .thenReturn(EMP_SHIP_EMISSIONS_ID);

        ExternalEmissionsMonitoringPlan expectedExternal = createExternalEmissionsMonitoringPlan(captureAndStorageApplied,
            derogationCodeUsed, defaultFactorsUsed, emissionsReductionClaimExists, delegatedResponsibilityUsed, outsourcedActivitiesExists);

        StagingEmissionsMonitoringPlan expectedStaging = createStagingEmissionsMonitoringPlan(captureAndStorageApplied,
            derogationCodeUsed, defaultFactorsUsed, emissionsReductionClaimExists, delegatedResponsibilityUsed, outsourcedActivitiesExists);

        StagingEmissionsMonitoringPlan actualStaging = externalEmpMapper.toStagingEmissionsMonitoringPlan(expectedExternal);

        assertEquals(expectedStaging, actualStaging);

        EmissionsMonitoringPlan emissionsMonitoringPlan = EmissionsMonitoringPlan.builder()
            .emissions(actualStaging.getEmissions())
            .mandate(actualStaging.getMandate())
            .sources(actualStaging.getSources())
            .greenhouseGas(actualStaging.getGreenhouseGas())
            .managementProcedures(actualStaging.getManagementProcedures())
            .controlActivities(actualStaging.getControlActivities())
            .dataGaps(actualStaging.getDataGaps())
            .build();

        ExternalEmissionsMonitoringPlan actualExternal = externalEmpMapper.toExternalEmissionsMonitoringPlan(emissionsMonitoringPlan);

        assertEquals(expectedExternal, actualExternal);
    }

    private StagingEmissionsMonitoringPlan createStagingEmissionsMonitoringPlan(boolean captureAndStorageApplied, boolean derogationCodeUsed,
                                                                                boolean defaultFactorsUsed, boolean emissionsReductionClaimExists,
                                                                                boolean delegatedResponsibilityUsed, boolean outsourcedActivitiesExists) {
        return StagingEmissionsMonitoringPlan.builder()
            .payloadType(MrtmStagingPayloadType.EMP_STAGING_PAYLOAD)
            .emissions(EmpEmissions.builder().ships(Set.of(createEmpShipEmissions(captureAndStorageApplied, derogationCodeUsed))).build())
            .mandate(createEmpMandate(delegatedResponsibilityUsed))
            .sources(createEmpEmissionSources(defaultFactorsUsed, emissionsReductionClaimExists))
            .greenhouseGas(createEmpMonitoringGreenhouseGas())
            .managementProcedures(createEmpManagementProcedures())
            .controlActivities(createEmpControlActivities(outsourcedActivitiesExists))
            .dataGaps(createEmpDataGaps())
            .build();
    }

    private ExternalEmissionsMonitoringPlan createExternalEmissionsMonitoringPlan(boolean captureAndStorageApplied, boolean derogationCodeUsed,
                                                                                  boolean defaultFactorsUsed, boolean emissionsReductionClaimExists,
                                                                                  boolean delegatedResponsibilityUsed, boolean outsourcedActivitiesExists) {
        return ExternalEmissionsMonitoringPlan.builder()
            .shipParticulars(Set.of(createExternalEmpShipEmissions(captureAndStorageApplied, derogationCodeUsed)))
            .delegatedResponsibility(createExternalEmpDelegatedResponsibility(delegatedResponsibilityUsed))
            .procedures(createExternalEmpProcedures(defaultFactorsUsed, emissionsReductionClaimExists, outsourcedActivitiesExists))
            .dataGaps(createExternalEmpDataGaps())
            .build();
    }

    private EmpMandate createEmpMandate(boolean delegatedResponsibilityUsed) {
        return EmpMandate.builder()
            .exist(delegatedResponsibilityUsed)
            .responsibilityDeclaration(delegatedResponsibilityUsed)
            .registeredOwners(delegatedResponsibilityUsed ? Set.of(EmpRegisteredOwner.builder()
                .name("name")
                .imoNumber("1234567")
                .contactName("contactName")
                .email("email@email.com")
                .effectiveDate(LocalDate.now().minusDays(1))
                .uniqueIdentifier(REGISTERED_OWNER_ID)
                .ships(Set.of(
                    RegisteredOwnerShipDetails.builder()
                        .imoNumber("7654321")
                        .name("ship name")
                        .build()
                ))
                .build()) : new HashSet<>())
            .build();
    }

    private ExternalEmpDataGaps createExternalEmpDataGaps() {
        return ExternalEmpDataGaps.builder()
            .formulaeUsed("formulaeUsed")
            .fuelConsumptionEstimationMethod("fuelConsumptionEstimationMethod")
            .responsiblePerson("responsiblePerson")
            .dataSources("dataSources")
            .locationOfRecords("locationOfRecords")
            .itSystem("itSystem")
            .build();
    }

    private EmpDataGaps createEmpDataGaps() {
        return EmpDataGaps.builder()
            .formulaeUsed("formulaeUsed")
            .fuelConsumptionEstimationMethod("fuelConsumptionEstimationMethod")
            .responsiblePersonOrPosition("responsiblePerson")
            .dataSources("dataSources")
            .recordsLocation("locationOfRecords")
            .itSystemUsed("itSystem")
            .build();
    }

    private ExternalEmpProcedures createExternalEmpProcedures(boolean defaultFactorsUsed, boolean emissionsReductionClaimExists,
                                                              boolean outsourcedActivitiesExists) {
        return ExternalEmpProcedures.builder()
            .emissionsProcedures(ExternalEmpEmissionsProcedures.builder()
                .emissionSourcesProcedure(createExternalEmpProcedureForm("emissionSourcesProcedure"))
                .emissionFactorsProcedure(ExternalEmpEmissionFactorsProcedure.builder()
                    .defaultFactorsUsed(defaultFactorsUsed)
                    .emissionFactorsProcedureDetails(defaultFactorsUsed ? null : createExternalEmpProcedureForm("emissionFactorsProcedure"))
                    .build())
                .reductionClaimProcedure(ExternalEmpReductionClaimProcedure.builder()
                    .emissionsReductionClaimExists(emissionsReductionClaimExists)
                    .reductionClaimProcedureDetails(emissionsReductionClaimExists ? createExternalEmpProcedureForm("reductionClaimProcedure") : null)
                    .build())
                .build())
            .fuelConsumptionProcedures(ExternalEmpFuelConsumptionProcedures.builder()
                .fuelBunkeredAndInTanksProcedure(createExternalEmpProcedureForm("fuelBunkeredAndInTanksProcedure"))
                .bunkeringCrossChecksProcedure(createExternalEmpProcedureForm("bunkeringCrossChecksProcedure"))
                .informationManagementProcedure(createExternalEmpProcedureForm("informationManagementProcedure"))
                .equipmentQualityAssuranceProcedure(createExternalEmpProcedureForm("equipmentQualityAssuranceProcedure"))
                .voyagesCompletenessProcedure(createExternalEmpProcedureForm("voyagesCompletenessProcedure"))
                .build())
            .managementProcedures(ExternalEmpManagementProcedures.builder()
                .monitoringReportingRoles(List.of(EmpMonitoringReportingRole.builder()
                    .jobTitle("jobTitle")
                    .mainDuties("mainDuties")
                    .build()))
                .adequacyCheckProcedure(createExternalEmpProcedureForm("adequacyCheckProcedure"))
                .dataFlowActivitiesProcedure(createExternalEmpProcedureForm("dataFlowActivitiesProcedure"))
                .riskAssessmentProcedure(createExternalEmpProcedureForm("riskAssessmentProcedure"))
                .build())
            .controlActivitiesProcedures(ExternalEmpControlActivitiesProcedures.builder()
                .qaItProcedure(createExternalEmpProcedureForm("qaItProcedure"))
                .dataReviewProcedure(createExternalEmpProcedureForm("dataReviewProcedure"))
                .correctionsProcedure(createExternalEmpProcedureForm("correctionsProcedure"))
                .outsourcedActivitiesProcedure(ExternalEmpOutsourcedActivitiesProcedure.builder()
                    .outsourcedActivitiesExists(outsourcedActivitiesExists)
                    .details(outsourcedActivitiesExists ? createExternalEmpProcedureForm("outsourcedActivitiesProcedure") : null)
                    .build())
                .documentationProcedure(createExternalEmpProcedureForm("documentationProcedure"))
                .build())
            .build();
    }

    private EmpEmissionSources createEmpEmissionSources(boolean defaultFactorsUsed, boolean emissionsReductionClaimExists) {
        return EmpEmissionSources.builder()
            .listCompletion(createEmpProcedureForm("emissionSourcesProcedure"))
            .emissionFactors(EmpEmissionFactors.builder()
                .exist(defaultFactorsUsed)
                .factors(defaultFactorsUsed ? null : createEmpProcedureForm("emissionFactorsProcedure"))
                .build())
            .emissionCompliance(EmpEmissionCompliance.builder()
                .exist(emissionsReductionClaimExists)
                .criteria(emissionsReductionClaimExists ? createEmpProcedureForm("reductionClaimProcedure") : null)
                .build())
            .build();
    }

    private EmpMonitoringGreenhouseGas createEmpMonitoringGreenhouseGas() {
        return EmpMonitoringGreenhouseGas.builder()
            .fuel(createEmpProcedureForm("fuelBunkeredAndInTanksProcedure"))
            .crossChecks(createEmpProcedureForm("bunkeringCrossChecksProcedure"))
            .information(createEmpProcedureForm("informationManagementProcedure"))
            .qaEquipment(createEmpProcedureForm("equipmentQualityAssuranceProcedure"))
            .voyages(createEmpProcedureForm("voyagesCompletenessProcedure"))
            .build();
    }

    private EmpManagementProcedures createEmpManagementProcedures() {
        return EmpManagementProcedures.builder()
            .monitoringReportingRoles(List.of(EmpMonitoringReportingRole.builder()
                .jobTitle("jobTitle")
                .mainDuties("mainDuties")
                .build()))
            .regularCheckOfAdequacy(createEmpProcedureForm("adequacyCheckProcedure"))
            .dataFlowActivities(createEmpProcedureFormWithFiles("dataFlowActivitiesProcedure"))
            .riskAssessmentProcedures(createEmpProcedureFormWithFiles("riskAssessmentProcedure"))
            .build();
    }

    private EmpControlActivities createEmpControlActivities(boolean outsourcedActivitiesExists) {
        return EmpControlActivities.builder()
            .qualityAssurance(createEmpProcedureForm("qaItProcedure"))
            .internalReviews(createEmpProcedureForm("dataReviewProcedure"))
            .corrections(createEmpProcedureForm("correctionsProcedure"))
            .outsourcedActivities(EmpOutsourcedActivities.builder()
                .exist(outsourcedActivitiesExists)
                .details(outsourcedActivitiesExists ? createEmpProcedureForm("outsourcedActivitiesProcedure") : null)
                .build())
            .documentation(createEmpProcedureForm("documentationProcedure"))
            .build();
    }


    private ExternalEmpDelegatedResponsibility createExternalEmpDelegatedResponsibility(boolean delegatedResponsibilityUsed) {
        return ExternalEmpDelegatedResponsibility.builder()
            .delegatedResponsibilityUsed(delegatedResponsibilityUsed)
            .responsibilityDeclaration(delegatedResponsibilityUsed)
            .registeredOwners(delegatedResponsibilityUsed ? Set.of(ExternalEmpRegisteredOwner.builder()
                .name("name")
                .companyImoNumber("1234567")
                .contactName("contactName")
                .email("email@email.com")
                .agreementDate(LocalDate.now().minusDays(1))
                .ships(Set.of(
                    ExternalEmpRegisteredOwnerShipDetails.builder()
                        .shipImoNumber("7654321")
                        .name("ship name")
                        .build()
                ))
                .build()) : new HashSet<>())
            .build();
    }

    private ExternalEmpShipEmissions createExternalEmpShipEmissions(boolean captureAndStorageApplied, boolean derogationCodeUsed) {
        Set<ExternalEmpFuelsAndEmissionsFactors> fuelTypes = new LinkedHashSet<>();
        fuelTypes.add(createExternalEmpFuelsAndEmissionsFactors(FuelOrigin.FOSSIL, ExternalFuelType.METHANOL, null));
        fuelTypes.add(createExternalEmpFuelsAndEmissionsFactors(FuelOrigin.RFNBO, ExternalFuelType.E_METHANOL, null));
        fuelTypes.add(createExternalEmpFuelsAndEmissionsFactors(FuelOrigin.BIOFUEL, ExternalFuelType.BIO_METHANOL, null));
        fuelTypes.add(createExternalEmpFuelsAndEmissionsFactors(FuelOrigin.BIOFUEL, ExternalFuelType.OTHER, "otherFuelType"));


        return ExternalEmpShipEmissions.builder()
            .shipDetails(ExternalEmpShipDetails.builder()
                .shipImoNumber("9876543")
                .name("ship details name")
                .shipType(ShipType.BULK)
                .grossTonnage(5000)
                .flag(FlagState.GR)
                .iceClassPolarCode(IceClass.IC)
                .companyNature(ReportingResponsibilityNature.ISM_COMPANY)
                .build())
            .fuelTypes(fuelTypes)
            .emissionsSources(Set.of(
                ExternalEmpEmissionsSources.builder()
                    .name("emissions sources name")
                    .emissionSourceTypeCode(EmissionSourceType.AUX_ENGINE)
                    .emissionSourceClassCode(EmissionSourceClass.BOILERS)
                    .fuelTypeCodes(Set.of(
                        createExternalEmpFuelOriginTypeName(FuelOrigin.FOSSIL, ExternalFuelType.METHANOL, null, null),
                        createExternalEmpFuelOriginTypeName(FuelOrigin.RFNBO, ExternalFuelType.E_METHANOL, null, new BigDecimal("0.0310")),
                        createExternalEmpFuelOriginTypeName(FuelOrigin.BIOFUEL, ExternalFuelType.BIO_METHANOL, null, new BigDecimal("0.017")),
                        createExternalEmpFuelOriginTypeName(FuelOrigin.BIOFUEL, ExternalFuelType.OTHER, "otherFuelType", new BigDecimal("0.0"))
                    ))
                    .monitoringMethods(Set.of(MonitoringMethod.BDN))
                    .identificationNumber("identificationNumber")
                    .build()
            ))
            .uncertaintyLevel(Set.of(ExternalEmpUncertaintyLevel.builder()
                .monitoringMethodCode(MonitoringMethod.BDN)
                .levelOfUncertaintyTypeCode(MethodApproach.DEFAULT)
                .shipSpecificUncertainty(new BigDecimal("1"))
                .build()))
            .ccsCcu(ExternalEmpCarbonCapture.builder()
                .captureAndStorageApplied(captureAndStorageApplied)
                .technology(captureAndStorageApplied ? "technology" : null)
                .emissionSourceName(captureAndStorageApplied ? Set.of("ccs ccu emission source name"): new HashSet<>())
                .build())
            .measuringEquipment(Set.of(
                ExternalEmpMeasurementDescription.builder()
                    .name("measuring equipment name")
                    .technicalDescription("technical description")
                    .emissionSourceName(Set.of("measuring equipment emission source name"))
                    .build()
            ))
            .conditionsOfExemption(ExternalEmpExemptionConditions.builder()
                .derogationCodeUsed(derogationCodeUsed)
                .minimumNumberOfVoyages(derogationCodeUsed ? 301 : null)
                .build())
            .build();
    }

    private ExternalEmpFuelOriginTypeName createExternalEmpFuelOriginTypeName(FuelOrigin fossil, ExternalFuelType methanol,
                                                                              String otherFuelType, BigDecimal slipPercentage) {
        return ExternalEmpFuelOriginTypeName.builder()
            .fuelOriginCode(fossil)
            .fuelTypeCode(methanol)
            .otherFuelType(otherFuelType)
            .slipPercentage(slipPercentage)
            .build();
    }

    private FuelOriginFossilTypeName createFuelOriginFossilTypeName() {
        return FuelOriginFossilTypeName.builder()
            .uniqueIdentifier(METHANOL_FUEL_ID)
            .origin(FuelOrigin.FOSSIL)
            .type(FossilFuelType.METHANOL)
            .build();
    }

    private FuelOriginBiofuelTypeName createFuelOriginBiofuelTypeName(BioFuelType fuelType, String otherFuelType,
                                                                      UUID uuid, BigDecimal slipPercentage) {
        return FuelOriginBiofuelTypeName.builder()
            .uniqueIdentifier(uuid)
            .origin(FuelOrigin.BIOFUEL)
            .type(fuelType)
            .name(otherFuelType)
            .methaneSlipValueType(MethaneSlipValueType.PRESELECTED)
            .methaneSlip(slipPercentage)
            .build();
    }

    private FuelOriginEFuelTypeName createFuelOriginEFuelTypeName() {
        return FuelOriginEFuelTypeName.builder()
            .uniqueIdentifier(E_METHANOL_FUEL_ID)
            .origin(FuelOrigin.RFNBO)
            .type(EFuelType.E_METHANOL)
            .methaneSlipValueType(MethaneSlipValueType.PRESELECTED)
            .methaneSlip(new BigDecimal("3.1"))
            .build();
    }

    private EmpFossilFuels createEmpFossilFuels() {
        return EmpFossilFuels.builder()
            .uniqueIdentifier(METHANOL_FUEL_ID)
            .origin(FuelOrigin.FOSSIL)
            .type(FossilFuelType.METHANOL)
            .carbonDioxide(new BigDecimal("1"))
            .methane(new BigDecimal("2"))
            .nitrousOxide(new BigDecimal("3"))
            .densityMethodBunker(DensityMethodBunker.LABORATORY_TEST)
            .densityMethodTank(DensityMethodTank.FUEL_SUPPLIER)
            .build();
    }

    private EmpBioFuels createEmpBioFuels(BioFuelType fuelType, String otherFuelType, UUID uuid) {
        return EmpBioFuels.builder()
            .uniqueIdentifier(uuid)
            .origin(FuelOrigin.BIOFUEL)
            .type(fuelType)
            .name(otherFuelType)
            .carbonDioxide(new BigDecimal("1"))
            .methane(new BigDecimal("2"))
            .nitrousOxide(new BigDecimal("3"))
            .densityMethodBunker(DensityMethodBunker.LABORATORY_TEST)
            .densityMethodTank(DensityMethodTank.FUEL_SUPPLIER)
            .build();
    }

    private EmpEFuels createEmpEFuels() {
        return EmpEFuels.builder()
            .uniqueIdentifier(E_METHANOL_FUEL_ID)
            .origin(FuelOrigin.RFNBO)
            .type(EFuelType.E_METHANOL)
            .carbonDioxide(new BigDecimal("1"))
            .methane(new BigDecimal("2"))
            .nitrousOxide(new BigDecimal("3"))
            .densityMethodBunker(DensityMethodBunker.LABORATORY_TEST)
            .densityMethodTank(DensityMethodTank.FUEL_SUPPLIER)
            .build();
    }

    private ExternalEmpFuelsAndEmissionsFactors createExternalEmpFuelsAndEmissionsFactors(FuelOrigin fossil, ExternalFuelType methanol, String otherFuelType) {
        return ExternalEmpFuelsAndEmissionsFactors.builder()
            .fuelOriginCode(fossil)
            .fuelTypeCode(methanol)
            .otherFuelType(otherFuelType)
            .ttwEFCarbonDioxide(new BigDecimal("1"))
            .ttwEFMethane(new BigDecimal("2"))
            .ttwEFNitrousOxide(new BigDecimal("3"))
            .methodDensityBunkerCode(DensityMethodBunker.LABORATORY_TEST)
            .methodDensityTankCode(DensityMethodTank.FUEL_SUPPLIER)
            .build();
    }

    private ExternalEmpProcedureForm createExternalEmpProcedureForm(String source) {
        return ExternalEmpProcedureForm.builder()
            .referenceExistingProcedure(source + "referenceExistingProcedure")
            .versionExistingProcedure(source + "versionExistingProcedure")
            .description(source + "description")
            .responsiblePerson(source + "responsiblePerson")
            .locationOfRecords(source + "locationOfRecords")
            .itSystem(source + "itSystem")
            .build();
    }

    private EmpProcedureForm createEmpProcedureForm(String source) {
        return EmpProcedureForm.builder()
            .reference(source + "referenceExistingProcedure")
            .version(source + "versionExistingProcedure")
            .description(source + "description")
            .responsiblePersonOrPosition(source + "responsiblePerson")
            .recordsLocation(source + "locationOfRecords")
            .itSystemUsed(source + "itSystem")
            .build();
    }

    private EmpProcedureFormWithFiles createEmpProcedureFormWithFiles(String source) {
        return EmpProcedureFormWithFiles.builder()
            .reference(source + "referenceExistingProcedure")
            .version(source + "versionExistingProcedure")
            .description(source + "description")
            .responsiblePersonOrPosition(source + "responsiblePerson")
            .recordsLocation(source + "locationOfRecords")
            .itSystemUsed(source + "itSystem")
            .build();
    }

    private EmpShipEmissions createEmpShipEmissions(boolean captureAndStorageApplied, boolean derogationCodeUsed) {
        Set<EmpFuelsAndEmissionsFactors> fuelTypes = new LinkedHashSet<>();
        fuelTypes.add(createEmpFossilFuels());
        fuelTypes.add(createEmpEFuels());
        fuelTypes.add(createEmpBioFuels(BioFuelType.BIO_METHANOL, null, BIO_METHANOL_FUEL_ID));
        fuelTypes.add(createEmpBioFuels(BioFuelType.OTHER, "otherFuelType", OTHER_FUEL_ID));

        return EmpShipEmissions.builder()
            .uniqueIdentifier(EMP_SHIP_EMISSIONS_ID)
            .details(ShipDetails.builder()
                .imoNumber("9876543")
                .name("ship details name")
                .type(ShipType.BULK)
                .grossTonnage(5000)
                .flagState(FlagState.GR)
                .iceClass(IceClass.IC)
                .natureOfReportingResponsibility(ReportingResponsibilityNature.ISM_COMPANY)
                .build())
            .fuelsAndEmissionsFactors(fuelTypes)
            .emissionsSources(Set.of(
                EmpEmissionsSources.builder()
                    .uniqueIdentifier(EMISSION_SOURCE)
                    .name("emissions sources name")
                    .type(EmissionSourceType.AUX_ENGINE)
                    .sourceClass(EmissionSourceClass.BOILERS)
                    .fuelDetails(Set.of(
                        createFuelOriginFossilTypeName(),
                        createFuelOriginEFuelTypeName(),
                        createFuelOriginBiofuelTypeName(BioFuelType.BIO_METHANOL, null, BIO_METHANOL_FUEL_ID, new BigDecimal("1.7")),
                        createFuelOriginBiofuelTypeName(BioFuelType.OTHER, "otherFuelType", OTHER_FUEL_ID, new BigDecimal("0"))
                    ))
                    .monitoringMethod(Set.of(MonitoringMethod.BDN))
                    .referenceNumber("identificationNumber")
                    .build()
            ))
            .uncertaintyLevel(Set.of(UncertaintyLevel.builder()
                .monitoringMethod(MonitoringMethod.BDN)
                .methodApproach(MethodApproach.DEFAULT)
                .value(new BigDecimal("1"))
                .build()))
            .carbonCapture(EmpCarbonCapture.builder()
                .exist(captureAndStorageApplied)
                .technologies(captureAndStorageApplied ?
                    EmpCarbonCaptureTechnologies.builder()
                        .description("technology")
                        .technologyEmissionSources(Set.of("ccs ccu emission source name"))
                        .build() : null)
                .build())
            .measurements(Set.of(
                MeasurementDescription.builder()
                    .name("measuring equipment name")
                    .technicalDescription("technical description")
                    .emissionSources(Set.of("measuring equipment emission source name"))
                    .build()
            ))
            .exemptionConditions(ExemptionConditions.builder()
                .exist(derogationCodeUsed)
                .minVoyages(derogationCodeUsed ? 301 : null)
                .build())
            .build();
    }

    @Test
    void toExternalEmissionsMonitoringPlan_preservesShipParticularsOrder() {
        EmpShipEmissions zebraShip = createEmpShipEmissions(false, false);
        zebraShip.setUniqueIdentifier(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        zebraShip.getDetails().setImoNumber("1111111");
        zebraShip.getDetails().setName("Zebra");

        EmpShipEmissions alphaShip = createEmpShipEmissions(false, false);
        alphaShip.setUniqueIdentifier(UUID.fromString("00000000-0000-0000-0000-000000000002"));
        alphaShip.getDetails().setImoNumber("2222222");
        alphaShip.getDetails().setName("Alpha");

        Set<EmpShipEmissions> ships = new LinkedHashSet<>();
        ships.add(zebraShip);
        ships.add(alphaShip);

        EmissionsMonitoringPlan emp = EmissionsMonitoringPlan.builder()
            .emissions(EmpEmissions.builder().ships(ships).build())
            .mandate(createEmpMandate(false))
            .sources(createEmpEmissionSources(true, false))
            .greenhouseGas(createEmpMonitoringGreenhouseGas())
            .managementProcedures(createEmpManagementProcedures())
            .controlActivities(createEmpControlActivities(false))
            .dataGaps(createEmpDataGaps())
            .build();

        ExternalEmissionsMonitoringPlan external = externalEmpMapper.toExternalEmissionsMonitoringPlan(emp);

        assertEquals(2, external.getShipParticulars().size());

        List<String> exposedImoNumbers = new ArrayList<>();
        external.getShipParticulars().forEach(ship -> exposedImoNumbers.add(ship.getShipDetails().getShipImoNumber()));

        assertIterableEquals(List.of("1111111", "2222222"), exposedImoNumbers);
    }
}