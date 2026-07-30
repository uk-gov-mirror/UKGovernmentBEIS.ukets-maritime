import { mapManagementProcedures } from '@requests/common/eu-xml-import/mappers/management-procedures.mapper';

describe('mapManagementProcedures', () => {
  it('maps E1/E2/E3 procedures and flags roles as unmapped', () => {
    const { managementProcedures, managementProceduresWarnings } = mapManagementProcedures({
      controlActivities: {
        procedureAnnexITableE1: { referenceExistingProcedure: 'REF-E1', procedures: 'Check adequacy regularly' },
        procedureAnnexITableE2: { referenceForProcedure: 'REF-E2', procedures: 'Data flow activities' },
        procedureAnnexITableE3: { referenceExistingProcedure: 'REF-E3', procedures: 'Risk assessment' },
      },
    });

    expect(managementProcedures.regularCheckOfAdequacy.reference).toBe('REF-E1');
    expect(managementProcedures.dataFlowActivities.reference).toBe('REF-E2');
    expect(managementProcedures.riskAssessmentProcedures.reference).toBe('REF-E3');
    expect(managementProcedures.monitoringReportingRoles).toEqual([]);
    expect(managementProceduresWarnings.some((w) => w.message.includes('Monitoring and reporting roles'))).toBe(true);
  });
});
