import { mapEmissionSources } from '@requests/common/eu-xml-import/mappers/emission-sources.mapper';

describe('mapEmissionSources', () => {
  it('maps the B5 list completion procedure and defaults emissionCompliance to not exist and emissionFactors to exist', () => {
    const { emissionSources } = mapEmissionSources({
      emissionSources: { procedureAnnexITableB5: { referenceExistingProcedure: 'REF-B5', procedures: 'Completion' } },
    });

    expect(emissionSources.listCompletion.reference).toBe('REF-B5');
    expect(emissionSources.emissionFactors).toEqual({ exist: true });
    expect(emissionSources.emissionCompliance).toEqual({ exist: false });
  });

  it('marks emissionFactors as not existing when a B8 procedure is present', () => {
    const { emissionSources } = mapEmissionSources({
      fuelTypes: { procedureAnnexITableB8: { referenceExistingProcedure: 'REF-B8', procedures: 'Factors' } },
    });

    expect(emissionSources.emissionFactors.exist).toBe(false);
    expect(emissionSources.emissionFactors.factors?.reference).toBe('REF-B8');
  });
});
