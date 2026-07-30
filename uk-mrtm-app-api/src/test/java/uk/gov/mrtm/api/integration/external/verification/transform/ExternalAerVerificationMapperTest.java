package uk.gov.mrtm.api.integration.external.verification.transform;

import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mapstruct.factory.Mappers;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerComplianceMonitoringReporting;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerDataGapsMethodologies;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerEmissionsReductionClaimVerification;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerEtsComplianceRules;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerInPersonSiteVisitDatesDetails;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerInformationOfOpinionRelevance;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerNotVerifiedDecisionReason;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerOpinionStatement;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerRecommendedImprovements;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerSiteVisit;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerUncorrectedMisstatements;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerUncorrectedNonCompliances;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerUncorrectedNonConformities;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerVerification;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerVerificationDecision;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerVerificationTeamDetails;
import uk.gov.mrtm.api.integration.external.verification.domain.ExternalAerVerifierContact;
import uk.gov.mrtm.api.integration.external.verification.domain.StagingAerVerification;
import uk.gov.mrtm.api.integration.external.verification.domain.common.ExternalUncorrectedItem;
import uk.gov.mrtm.api.integration.external.verification.domain.common.ExternalVerifierComment;
import uk.gov.mrtm.api.reporting.domain.common.UncorrectedItem;
import uk.gov.mrtm.api.reporting.domain.common.VerifierComment;
import uk.gov.mrtm.api.reporting.domain.verification.AerAccreditationReferenceDocumentType;
import uk.gov.mrtm.api.reporting.domain.verification.AerComplianceMonitoringReporting;
import uk.gov.mrtm.api.reporting.domain.verification.AerDataGapsMethodologies;
import uk.gov.mrtm.api.reporting.domain.verification.AerEmissionsReductionClaimVerification;
import uk.gov.mrtm.api.reporting.domain.verification.AerEtsComplianceRules;
import uk.gov.mrtm.api.reporting.domain.verification.AerInPersonSiteVisit;
import uk.gov.mrtm.api.reporting.domain.verification.AerInPersonSiteVisitDates;
import uk.gov.mrtm.api.reporting.domain.verification.AerMaterialityLevel;
import uk.gov.mrtm.api.reporting.domain.verification.AerNotVerifiedDecision;
import uk.gov.mrtm.api.reporting.domain.verification.AerNotVerifiedDecisionReason;
import uk.gov.mrtm.api.reporting.domain.verification.AerOpinionStatement;
import uk.gov.mrtm.api.reporting.domain.verification.AerRecommendedImprovements;
import uk.gov.mrtm.api.reporting.domain.verification.AerSiteVisit;
import uk.gov.mrtm.api.reporting.domain.verification.AerSiteVisitType;
import uk.gov.mrtm.api.reporting.domain.verification.AerUncorrectedMisstatements;
import uk.gov.mrtm.api.reporting.domain.verification.AerUncorrectedNonCompliances;
import uk.gov.mrtm.api.reporting.domain.verification.AerUncorrectedNonConformities;
import uk.gov.mrtm.api.reporting.domain.verification.AerVerificationDecision;
import uk.gov.mrtm.api.reporting.domain.verification.AerVerificationDecisionType;
import uk.gov.mrtm.api.reporting.domain.verification.AerVerificationTeamDetails;
import uk.gov.mrtm.api.reporting.domain.verification.AerVerifiedSatisfactoryDecision;
import uk.gov.mrtm.api.reporting.domain.verification.AerVerifiedSatisfactoryWithCommentsDecision;
import uk.gov.mrtm.api.reporting.domain.verification.AerVerifierContact;
import uk.gov.mrtm.api.reporting.domain.verification.AerVirtualSiteVisit;
import uk.gov.mrtm.api.reporting.domain.verification.NonConformities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static uk.gov.mrtm.api.reporting.domain.verification.AerNotVerifiedDecisionReasonType.UNCORRECTED_MATERIAL_MISSTATEMENT;

@ExtendWith(MockitoExtension.class)
class ExternalAerVerificationMapperTest {

    private final ExternalAerVerificationMapper mapper = Mappers.getMapper(ExternalAerVerificationMapper.class);

    @ParameterizedTest
    @MethodSource
    void toStagingAerVerification(AerSiteVisit aerSiteVisit, ExternalAerSiteVisit externalAerSiteVisit,
                                  AerVerificationDecision overallDecision, ExternalAerVerificationDecision externalOverallDecision) {
        ExternalAerVerification external = getExternalAerVerification(externalAerSiteVisit, externalOverallDecision);
        StagingAerVerification expected = getStagingAerVerification(aerSiteVisit, overallDecision);

        StagingAerVerification actual = mapper.toStagingAerVerification(external, "stagingPayloadType");

        assertEquals(expected, actual);
    }

    private static Stream<Arguments> toStagingAerVerification() {
    	ExternalAerSiteVisit externalAerInPersonSiteVisit = ExternalAerSiteVisit.builder()
            .type(AerSiteVisitType.IN_PERSON)
            .teamMembers("teamMembers")
            .siteVisitDetails(List.of(ExternalAerInPersonSiteVisitDatesDetails.builder().startDate(LocalDate.now()).numberOfDays(1).build()))
            .build();

        AerInPersonSiteVisit aerInPersonSiteVisit = AerInPersonSiteVisit.builder()
            .type(AerSiteVisitType.IN_PERSON)
            .teamMembers("teamMembers")
            .visitDates(List.of(AerInPersonSiteVisitDates.builder().startDate(LocalDate.now()).numberOfDays(1).build()))
            .build();

        ExternalAerSiteVisit externalAerVirtualSiteVisit = ExternalAerSiteVisit.builder()
            .type(AerSiteVisitType.VIRTUAL)
            .inPersonVisitReason("reason")
            .build();

        AerVirtualSiteVisit aerVirtualSiteVisit = AerVirtualSiteVisit.builder()
            .type(AerSiteVisitType.VIRTUAL)
            .reason("reason")
            .build();

        ExternalAerVerificationDecision externalOverallDecisionVerifiedAsSatisfactory = ExternalAerVerificationDecision.builder()
            .type(AerVerificationDecisionType.VERIFIED_AS_SATISFACTORY)
            .build();

        AerVerificationDecision overallDecisionVerifiedAsSatisfactory = AerVerifiedSatisfactoryDecision.builder()
            .type(AerVerificationDecisionType.VERIFIED_AS_SATISFACTORY)
            .build();

        ExternalAerVerificationDecision externalOverallDecisionVerifiedSatisfactoryWithCommentsDecision = ExternalAerVerificationDecision.builder()
            .type(AerVerificationDecisionType.VERIFIED_AS_SATISFACTORY_WITH_COMMENTS)
            .build();

        AerVerificationDecision overallDecisionVerifiedSatisfactoryWithCommentsDecision = AerVerifiedSatisfactoryWithCommentsDecision.builder()
            .type(AerVerificationDecisionType.VERIFIED_AS_SATISFACTORY_WITH_COMMENTS)
            .build();

        ExternalAerVerificationDecision externalOverallDecisionNotVerifiedDecision = ExternalAerVerificationDecision.builder()
            .type(AerVerificationDecisionType.NOT_VERIFIED)
            .notVerifiedReasons(Set.of(ExternalAerNotVerifiedDecisionReason.builder().type(UNCORRECTED_MATERIAL_MISSTATEMENT).details("details").build()))
            .build();

        AerVerificationDecision overallDecisionNotVerifiedDecision = AerNotVerifiedDecision.builder()
            .type(AerVerificationDecisionType.NOT_VERIFIED)
            .notVerifiedReasons(Set.of(AerNotVerifiedDecisionReason.builder().type(UNCORRECTED_MATERIAL_MISSTATEMENT).details("details").build()))
            .build();

        return Stream.of(
            Arguments.of(aerInPersonSiteVisit, externalAerInPersonSiteVisit, overallDecisionVerifiedAsSatisfactory, externalOverallDecisionVerifiedAsSatisfactory),
            Arguments.of(aerVirtualSiteVisit, externalAerVirtualSiteVisit, overallDecisionVerifiedSatisfactoryWithCommentsDecision, externalOverallDecisionVerifiedSatisfactoryWithCommentsDecision),
            Arguments.of(aerVirtualSiteVisit, externalAerVirtualSiteVisit, overallDecisionNotVerifiedDecision, externalOverallDecisionNotVerifiedDecision)
        );
    }

    private ExternalAerVerification getExternalAerVerification(ExternalAerSiteVisit externalAerSiteVisit,
                                                               ExternalAerVerificationDecision overallDecision) {
        ExternalAerVerifierContact verifierContact = ExternalAerVerifierContact.builder()
            .email("email")
            .name("name")
            .phoneNumber("phoneNumber")
            .build();

        ExternalAerVerificationTeamDetails verificationTeamDetails = ExternalAerVerificationTeamDetails.builder()
            .leadEtsAuditor("leadEtsAuditor")
            .etsAuditors("etsAuditors")
            .etsTechnicalExperts("etsTechnicalExperts")
            .independentReviewer("independentReviewer")
            .technicalExperts("technicalExperts")
            .authorisedSignatoryName("authorisedSignatoryName")
            .build();

        ExternalAerOpinionStatement opinionStatement = ExternalAerOpinionStatement.builder()
            .emissionsCorrect(true)
            .manuallyProvidedTotalEmissions(new BigDecimal("1"))
            .manuallyProvidedSurrenderEmissions(new BigDecimal("2"))
            .manuallyProvidedLessVoyagesInNorthernIrelandDeduction(new BigDecimal("3"))
            .additionalChangesNotCovered(true)
            .additionalChangesNotCoveredDetails("additionalChangesNotCoveredDetails")
            .siteVisit(externalAerSiteVisit)
            .build();

        ExternalAerUncorrectedNonCompliances uncorrectedNonCompliances = ExternalAerUncorrectedNonCompliances.builder()
            .exist(true)
            .uncorrectedNonCompliances(new LinkedHashSet<>(List.of(
                ExternalUncorrectedItem.builder().materialEffect(true).explanation("uncorrectedNonCompliancesExplanation").build(),
                ExternalUncorrectedItem.builder().materialEffect(true).explanation("uncorrectedNonCompliancesExplanation2").build())
            ))
            .build();

        ExternalAerUncorrectedMisstatements uncorrectedMisstatements = ExternalAerUncorrectedMisstatements.builder()
            .exist(true)
            .uncorrectedMisstatements(new LinkedHashSet<>(List.of(
                ExternalUncorrectedItem.builder().materialEffect(true).explanation("uncorrectedMisstatementsExplanation").build(),
                ExternalUncorrectedItem.builder().materialEffect(true).explanation("uncorrectedMisstatementsExplanation2").build())))
            .build();

        ExternalAerUncorrectedNonConformities uncorrectedNonConformities = ExternalAerUncorrectedNonConformities.builder()
            .exist(true)
            .uncorrectedNonConformities(new LinkedHashSet<>(List.of(
                ExternalUncorrectedItem.builder().materialEffect(true).explanation("uncorrectedNonConformitiesExplanation").build(),
                ExternalUncorrectedItem.builder().materialEffect(true).explanation("uncorrectedNonConformitiesExplanation2").build())
            ))
            .existPriorYearIssues(true)
            .priorYearIssues(new LinkedHashSet<>(List.of(
                ExternalVerifierComment.builder().explanation("priorYearIssuesExplanation").build(),
                ExternalVerifierComment.builder().explanation("priorYearIssuesExplanation2").build())
            ))
            .build();

        ExternalAerRecommendedImprovements recommendedImprovements = ExternalAerRecommendedImprovements.builder()
            .exist(true)
            .recommendedImprovements(new LinkedHashSet<>(List.of(
                ExternalVerifierComment.builder().explanation("recommendedImprovementsExplanation").build(),
                ExternalVerifierComment.builder().explanation("recommendedImprovementsExplanation2").build())
            ))
            .build();

        ExternalAerEmissionsReductionClaimVerification emissionsReductionClaimVerification = ExternalAerEmissionsReductionClaimVerification.builder()
            .smfBatchClaimsReviewed(true)
            .batchReferencesNotReviewed("batchReferencesNotReviewed")
            .dataSampling("dataSampling")
            .reviewResults("reviewResults")
            .noDoubleCountingConfirmation("noDoubleCountingConfirmation")
            .evidenceAllCriteriaMetExist(true)
            .noCriteriaMetIssues("noCriteriaMetIssues")
            .complianceWithEmpRequirementsExist(true)
            .notCompliedWithEmpRequirementsAspects("notCompliedWithEmpRequirementsAspects")
            .build();

        ExternalAerInformationOfOpinionRelevance materialityLevel = ExternalAerInformationOfOpinionRelevance.builder()
            .materialityDetails("materialityDetails")
            .accreditationReferenceDocumentTypes(new LinkedHashSet<>(List.of(AerAccreditationReferenceDocumentType.AUTHORITY_GUIDANCE)))
            .otherReference("otherReference")
            .build();

        ExternalAerEtsComplianceRules etsComplianceRules = ExternalAerEtsComplianceRules.builder()
            .monitoringPlanRequirementsMet(true)
            .monitoringPlanRequirementsNotMetReason("monitoringPlanRequirementsNotMetReason")
            .etsOrderRequirementsMet(true)
            .etsOrderRequirementsNotMetReason("etsOrderRequirementsNotMetReason")
            .detailSourceDataVerified(true)
            .detailSourceDataNotVerifiedReason("detailSourceDataNotVerifiedReason")
            .partOfSiteVerification("partOfSiteVerification")
            .controlActivitiesDocumented(true)
            .controlActivitiesNotDocumentedReason("controlActivitiesNotDocumentedReason")
            .proceduresMonitoringPlanDocumented(true)
            .proceduresMonitoringPlanNotDocumentedReason("proceduresMonitoringPlanNotDocumentedReason")
            .dataVerificationCompleted(true)
            .dataVerificationNotCompletedReason("dataVerificationNotCompletedReason")
            .monitoringApproachAppliedCorrectly(true)
            .monitoringApproachNotAppliedCorrectlyReason("monitoringApproachNotAppliedCorrectlyReason")
            .methodsApplyingMissingDataUsed(true)
            .methodsApplyingMissingDataNotUsedReason("methodsApplyingMissingDataNotUsedReason")
            .competentAuthorityGuidanceMet(true)
            .competentAuthorityGuidanceNotMetReason("competentAuthorityGuidanceNotMetReason")
            .nonConformities(NonConformities.YES)
            .nonConformitiesDetails("nonConformitiesDetails")
            .build();

        ExternalAerComplianceMonitoringReporting complianceMonitoringReporting = ExternalAerComplianceMonitoringReporting.builder()
            .accuracyCompliant(true)
            .accuracyNonCompliantReason("accuracyNonCompliantReason")
            .completenessCompliant(true)
            .completenessNonCompliantReason("completenessNonCompliantReason")
            .consistencyCompliant(true)
            .consistencyNonCompliantReason("consistencyNonCompliantReason")
            .comparabilityCompliant(true)
            .comparabilityNonCompliantReason("comparabilityNonCompliantReason")
            .transparencyCompliant(true)
            .transparencyNonCompliantReason("transparencyNonCompliantReason")
            .integrityCompliant(true)
            .integrityNonCompliantReason("integrityNonCompliantReason")
            .build();

        ExternalAerDataGapsMethodologies dataGapsMethodologies = ExternalAerDataGapsMethodologies.builder()
            .methodRequired(true)
            .methodApproved(true)
            .methodConservative(true)
            .noConservativeMethodDetails("noConservativeMethodDetails")
            .materialMisstatementExist(true)
            .materialMisstatementDetails("materialMisstatementDetails")
            .build();

        return ExternalAerVerification.builder()
            .verifierContact(verifierContact)
            .verificationTeamDetails(verificationTeamDetails)
            .opinionStatement(opinionStatement)
            .uncorrectedNonCompliances(uncorrectedNonCompliances)
            .uncorrectedMisstatements(uncorrectedMisstatements)
            .overallDecision(overallDecision)
            .uncorrectedNonConformities(uncorrectedNonConformities)
            .recommendedImprovements(recommendedImprovements)
            .emissionsReductionClaimVerification(emissionsReductionClaimVerification)
            .informationOfOpinionRelevance(materialityLevel)
            .etsComplianceRules(etsComplianceRules)
            .complianceMonitoringReporting(complianceMonitoringReporting)
            .dataGapsMethodologies(dataGapsMethodologies)
            .build();
    }

    private StagingAerVerification getStagingAerVerification(AerSiteVisit siteVisit, AerVerificationDecision overallDecision) {
        AerVerifierContact verifierContact = AerVerifierContact.builder()
            .email("email")
            .name("name")
            .phoneNumber("phoneNumber")
            .build();

        AerVerificationTeamDetails verificationTeamDetails = AerVerificationTeamDetails.builder()
            .leadEtsAuditor("leadEtsAuditor")
            .etsAuditors("etsAuditors")
            .etsTechnicalExperts("etsTechnicalExperts")
            .independentReviewer("independentReviewer")
            .technicalExperts("technicalExperts")
            .authorisedSignatoryName("authorisedSignatoryName")
            .build();

        AerOpinionStatement opinionStatement = AerOpinionStatement.builder()
            .emissionsCorrect(true)
            .manuallyProvidedTotalEmissions(new BigDecimal("1"))
            .manuallyProvidedSurrenderEmissions(new BigDecimal("2"))
            .manuallyProvidedLessVoyagesInNorthernIrelandDeduction(new BigDecimal("3"))
            .additionalChangesNotCovered(true)
            .additionalChangesNotCoveredDetails("additionalChangesNotCoveredDetails")
            .siteVisit(siteVisit)
            .build();

        AerUncorrectedNonCompliances uncorrectedNonCompliances = AerUncorrectedNonCompliances.builder()
            .exist(true)
            .uncorrectedNonCompliances(
            		new LinkedHashSet<>(
            				List.of(UncorrectedItem.builder().materialEffect(true).reference("C1").explanation("uncorrectedNonCompliancesExplanation").build(),
                            UncorrectedItem.builder().materialEffect(true).reference("C2").explanation("uncorrectedNonCompliancesExplanation2").build())
                
            ))
            .build();

        AerUncorrectedMisstatements uncorrectedMisstatements = AerUncorrectedMisstatements.builder()
            .exist(true)
            .uncorrectedMisstatements(
            		new LinkedHashSet<>(List.of(
                UncorrectedItem.builder().materialEffect(true).reference("A1").explanation("uncorrectedMisstatementsExplanation").build(),
                UncorrectedItem.builder().materialEffect(true).reference("A2").explanation("uncorrectedMisstatementsExplanation2").build()
                )
            ))
            .build();

        AerUncorrectedNonConformities uncorrectedNonConformities = AerUncorrectedNonConformities.builder()
            .exist(true)
            .uncorrectedNonConformities(new LinkedHashSet<>(List.of(
                UncorrectedItem.builder().materialEffect(true).reference("B1").explanation("uncorrectedNonConformitiesExplanation").build(),
                UncorrectedItem.builder().materialEffect(true).reference("B2").explanation("uncorrectedNonConformitiesExplanation2").build())
            ))
            .existPriorYearIssues(true)
            .priorYearIssues(new LinkedHashSet<>(List.of(
                VerifierComment.builder().reference("E1").explanation("priorYearIssuesExplanation").build(),
                VerifierComment.builder().reference("E2").explanation("priorYearIssuesExplanation2").build())
            ))
            .build();

        AerRecommendedImprovements recommendedImprovements = AerRecommendedImprovements.builder()
            .exist(true)
            .recommendedImprovements(new LinkedHashSet<>(List.of(
                VerifierComment.builder().reference("D1").explanation("recommendedImprovementsExplanation").build(),
                VerifierComment.builder().reference("D2").explanation("recommendedImprovementsExplanation2").build())
            ))
            .build();

        AerEmissionsReductionClaimVerification emissionsReductionClaimVerification = AerEmissionsReductionClaimVerification.builder()
            .smfBatchClaimsReviewed(true)
            .batchReferencesNotReviewed("batchReferencesNotReviewed")
            .dataSampling("dataSampling")
            .reviewResults("reviewResults")
            .noDoubleCountingConfirmation("noDoubleCountingConfirmation")
            .evidenceAllCriteriaMetExist(true)
            .noCriteriaMetIssues("noCriteriaMetIssues")
            .complianceWithEmpRequirementsExist(true)
            .notCompliedWithEmpRequirementsAspects("notCompliedWithEmpRequirementsAspects")
            .build();

        AerMaterialityLevel materialityLevel = AerMaterialityLevel.builder()
            .materialityDetails("materialityDetails")
            .accreditationReferenceDocumentTypes(new LinkedHashSet<>(List.of(AerAccreditationReferenceDocumentType.AUTHORITY_GUIDANCE)))
            .otherReference("otherReference")
            .build();

        AerEtsComplianceRules etsComplianceRules = AerEtsComplianceRules.builder()
            .monitoringPlanRequirementsMet(true)
            .monitoringPlanRequirementsNotMetReason("monitoringPlanRequirementsNotMetReason")
            .etsOrderRequirementsMet(true)
            .etsOrderRequirementsNotMetReason("etsOrderRequirementsNotMetReason")
            .detailSourceDataVerified(true)
            .detailSourceDataNotVerifiedReason("detailSourceDataNotVerifiedReason")
            .partOfSiteVerification("partOfSiteVerification")
            .controlActivitiesDocumented(true)
            .controlActivitiesNotDocumentedReason("controlActivitiesNotDocumentedReason")
            .proceduresMonitoringPlanDocumented(true)
            .proceduresMonitoringPlanNotDocumentedReason("proceduresMonitoringPlanNotDocumentedReason")
            .dataVerificationCompleted(true)
            .dataVerificationNotCompletedReason("dataVerificationNotCompletedReason")
            .monitoringApproachAppliedCorrectly(true)
            .monitoringApproachNotAppliedCorrectlyReason("monitoringApproachNotAppliedCorrectlyReason")
            .methodsApplyingMissingDataUsed(true)
            .methodsApplyingMissingDataNotUsedReason("methodsApplyingMissingDataNotUsedReason")
            .competentAuthorityGuidanceMet(true)
            .competentAuthorityGuidanceNotMetReason("competentAuthorityGuidanceNotMetReason")
            .nonConformities(NonConformities.YES)
            .nonConformitiesDetails("nonConformitiesDetails")
            .build();

        AerComplianceMonitoringReporting complianceMonitoringReporting = AerComplianceMonitoringReporting.builder()
            .accuracyCompliant(true)
            .accuracyNonCompliantReason("accuracyNonCompliantReason")
            .completenessCompliant(true)
            .completenessNonCompliantReason("completenessNonCompliantReason")
            .consistencyCompliant(true)
            .consistencyNonCompliantReason("consistencyNonCompliantReason")
            .comparabilityCompliant(true)
            .comparabilityNonCompliantReason("comparabilityNonCompliantReason")
            .transparencyCompliant(true)
            .transparencyNonCompliantReason("transparencyNonCompliantReason")
            .integrityCompliant(true)
            .integrityNonCompliantReason("integrityNonCompliantReason")
            .build();

        AerDataGapsMethodologies dataGapsMethodologies = AerDataGapsMethodologies.builder()
            .methodRequired(true)
            .methodApproved(true)
            .methodConservative(true)
            .noConservativeMethodDetails("noConservativeMethodDetails")
            .materialMisstatementExist(true)
            .materialMisstatementDetails("materialMisstatementDetails")
            .build();

        return StagingAerVerification.builder()
            .payloadType("stagingPayloadType")
            .verifierContact(verifierContact)
            .verificationTeamDetails(verificationTeamDetails)
            .opinionStatement(opinionStatement)
            .uncorrectedNonCompliances(uncorrectedNonCompliances)
            .uncorrectedMisstatements(uncorrectedMisstatements)
            .overallDecision(overallDecision)
            .uncorrectedNonConformities(uncorrectedNonConformities)
            .recommendedImprovements(recommendedImprovements)
            .emissionsReductionClaimVerification(emissionsReductionClaimVerification)
            .materialityLevel(materialityLevel)
            .etsComplianceRules(etsComplianceRules)
            .complianceMonitoringReporting(complianceMonitoringReporting)
            .dataGapsMethodologies(dataGapsMethodologies)
            .build();
    }
}