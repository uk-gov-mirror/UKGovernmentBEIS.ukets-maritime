import {
  AerApplicationVerificationSubmittedRequestActionPayload,
  AerComplianceMonitoringReporting,
  AerDataGapsMethodologies,
  AerEtsComplianceRules,
  AerMaterialityLevel,
  AerOpinionStatement,
  AerRecommendedImprovements,
  AerSiteVisit,
  AerTotalReportableEmissions,
  AerUncorrectedMisstatements,
  AerUncorrectedNonCompliances,
  AerUncorrectedNonConformities,
  AerVerificationDecision,
  AerVerificationReport,
  AerVerificationTeamDetails,
  AerVerifiedSatisfactoryDecision,
  AerVerifierContact,
  RequestActionDTO,
  VerificationBodyDetails,
} from '@mrtm/api';

import { RequestActionState } from '@netz/common/store';

import { mockAerSubmittedPayload } from '@requests/common/aer/testing/aer-submitted.mock';

const mockVerificationBodyDetails: VerificationBodyDetails = {
  name: 'Verification Body 2',
  accreditationReferenceNumber: 'ACC1',
  address: {
    line1: 'Some address',
    city: 'London',
    country: 'GB',
    postcode: 'HU 34 ST 5',
  },
  emissionTradingSchemes: ['UK_MARITIME_EMISSION_TRADING_SCHEME'],
};

const mockAerVerifierContact: AerVerifierContact = {
  name: 'Some verifier contact1',
  email: 'contact1@v.com',
  phoneNumber: '1234567890',
};

const mockOpinionStatement: AerOpinionStatement = {
  emissionsCorrect: false,
  manuallyProvidedTotalEmissions: '1',
  manuallyProvidedSurrenderEmissions: '1',
  additionalChangesNotCovered: true,
  additionalChangesNotCoveredDetails: 'asdf',
  siteVisit: {
    type: 'IN_PERSON',
    visitDates: [
      {
        startDate: '2025-01-01',
        numberOfDays: 2,
      },
    ],
    teamMembers: 'member 1\nmember 2',
  } as AerSiteVisit,
};

const mockUncorrectedNonCompliances: AerUncorrectedNonCompliances = {
  exist: false,
};

const mockVerificationTeamDetails: AerVerificationTeamDetails = {
  leadEtsAuditor: 'Ets audit lead',
  etsAuditors: '- auditor 1\n- auditor 2',
  etsTechnicalExperts: 'tech expert 1',
  independentReviewer: 'Some ind reviewer',
  technicalExperts: 'Tech ind reviewer',
  authorisedSignatoryName: 'Authorised Name',
};

const mockUncorrectedMisstatements: AerUncorrectedMisstatements = {
  exist: false,
};

const mockOverallDecision: AerVerificationDecision = {
  type: 'VERIFIED_AS_SATISFACTORY_WITH_COMMENTS',
  reasons: ['asdf'],
} as AerVerifiedSatisfactoryDecision;

const mockUncorrectedNonConformities: AerUncorrectedNonConformities = {
  exist: false,
  existPriorYearIssues: false,
};

const mockRecommendedImprovements: AerRecommendedImprovements = {
  exist: false,
};

const mockMaterialityLevel: AerMaterialityLevel = {
  materialityDetails: 'Some materiality level',
  accreditationReferenceDocumentTypes: ['SI_2020_1265', 'EN_ISO_14065_2020'],
};

const mockEtsComplianceRules: AerEtsComplianceRules = {
  monitoringPlanRequirementsMet: true,
  etsOrderRequirementsMet: true,
  detailSourceDataVerified: true,
  partOfSiteVerification: 'yes',
  controlActivitiesDocumented: true,
  proceduresMonitoringPlanDocumented: false,
  proceduresMonitoringPlanNotDocumentedReason: 'some reason',
  dataVerificationCompleted: false,
  dataVerificationNotCompletedReason: 'asdf',
  monitoringApproachAppliedCorrectly: true,
  methodsApplyingMissingDataUsed: true,
  competentAuthorityGuidanceMet: true,
  nonConformities: 'YES',
};

const mockComplianceMonitoringReporting: AerComplianceMonitoringReporting = {
  accuracyCompliant: true,
  completenessCompliant: true,
  consistencyCompliant: true,
  comparabilityCompliant: true,
  transparencyCompliant: false,
  transparencyNonCompliantReason: 'not compliant for some reason',
  integrityCompliant: true,
};

const mockDataGapsMethodologies: AerDataGapsMethodologies = {
  methodRequired: false,
};

const mockAerVerificationReport: AerVerificationReport = {
  verificationBodyId: 2,
  verificationBodyDetails: mockVerificationBodyDetails,
  verifierContact: mockAerVerifierContact,
  verificationTeamDetails: mockVerificationTeamDetails,
  opinionStatement: mockOpinionStatement,
  uncorrectedNonCompliances: mockUncorrectedNonCompliances,
  uncorrectedMisstatements: mockUncorrectedMisstatements,
  overallDecision: mockOverallDecision,
  uncorrectedNonConformities: mockUncorrectedNonConformities,
  recommendedImprovements: mockRecommendedImprovements,
  materialityLevel: mockMaterialityLevel,
  etsComplianceRules: mockEtsComplianceRules,
  complianceMonitoringReporting: mockComplianceMonitoringReporting,
  dataGapsMethodologies: mockDataGapsMethodologies,
};

const mockTotalReportableEmissions: AerTotalReportableEmissions = {
  surrenderEmissions: '33',
  totalEmissions: '90',
};

export const mockAerVerificationSubmittedPayload: AerApplicationVerificationSubmittedRequestActionPayload = {
  payloadType: 'AER_APPLICATION_SUBMITTED_PAYLOAD',
  reportingRequired: true,
  aer: mockAerSubmittedPayload.aer,
  reportingYear: 2022,
  verificationPerformed: false,
  aerAttachments: {
    '11111111-1111-4111-a111-111111111111': '1.png',
    '22222222-2222-4222-a222-222222222222': '2.png',
    '33333333-3333-4333-a333-333333333333': '3.png',
    '44444444-4444-4444-a444-444444444444': '4.png',
  },
  verificationReport: mockAerVerificationReport,
  totalEmissions: mockTotalReportableEmissions,
  verificationAttachments: {},
};

export const mockRequestActionAerVerificationSubmittedState: RequestActionState = {
  action: {
    id: 1,
    type: 'AER_APPLICATION_VERIFICATION_SUBMITTED',
    payload: mockAerVerificationSubmittedPayload,
    requestId: 'MAR00009-2022',
    requestType: 'AER',
    requestAccountId: 1,
    competentAuthority: 'ENGLAND',
    submitter: 'Verifier1 England',
    creationDate: '2024-04-29T11:26:48.735269Z',
  } as RequestActionDTO,
};
