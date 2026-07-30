import { mapControlActivities } from '@requests/common/eu-xml-import/mappers/control-activities.mapper';

describe('mapControlActivities', () => {
  it('maps E4 using briefDescriptionOfProcedure instead of procedures', () => {
    const { controlActivities } = mapControlActivities({
      controlActivities: {
        procedureAnnexITableE4: {
          referenceExistingProcedure: 'REF-E4',
          briefDescriptionOfProcedure: 'Brief description',
          procedures: 'Should be ignored',
        },
      },
    });

    expect(controlActivities.qualityAssurance.description).toBe('Brief description');
  });

  it('maps E5/E6/E8 as plain procedure forms', () => {
    const { controlActivities } = mapControlActivities({
      controlActivities: {
        procedureAnnexITableE5: { referenceExistingProcedure: 'REF-E5', procedures: 'Internal reviews' },
        procedureAnnexITableE6: { referenceExistingProcedure: 'REF-E6', procedures: 'Corrections' },
        procedureAnnexITableE8: { referenceExistingProcedure: 'REF-E8', procedures: 'Documentation' },
      },
    });

    expect(controlActivities.internalReviews.reference).toBe('REF-E5');
    expect(controlActivities.corrections.reference).toBe('REF-E6');
    expect(controlActivities.documentation.reference).toBe('REF-E8');
  });

  describe('outsourced activities heuristic (E7)', () => {
    it('is not outsourced when E7 is absent', () => {
      const { controlActivities } = mapControlActivities({});

      expect(controlActivities.outsourcedActivities).toEqual({ exist: false });
    });

    it.each(['n/a', 'NA', 'None', 'Not applicable', '-'])(
      'is not outsourced when E7 procedures is "%s"',
      (procedures) => {
        const { controlActivities } = mapControlActivities({
          controlActivities: { procedureAnnexITableE7: { procedures } },
        });

        expect(controlActivities.outsourcedActivities).toEqual({ exist: false });
      },
    );

    it('is not outsourced when the description is short and no responsible person/location is given', () => {
      const { controlActivities } = mapControlActivities({
        controlActivities: { procedureAnnexITableE7: { procedures: 'short' } },
      });

      expect(controlActivities.outsourcedActivities).toEqual({ exist: false });
    });

    it('is outsourced when a responsible person is given, even with a short description', () => {
      const { controlActivities } = mapControlActivities({
        controlActivities: {
          procedureAnnexITableE7: { procedures: 'short', responsiblePerson: 'Jane Doe' },
        },
      });

      expect(controlActivities.outsourcedActivities.exist).toBe(true);
      expect(controlActivities.outsourcedActivities.details?.responsiblePersonOrPosition).toBe('Jane Doe');
    });

    it('is outsourced when a records location is given', () => {
      const { controlActivities } = mapControlActivities({
        controlActivities: { procedureAnnexITableE7: { procedures: 'short', locationOfRecords: 'Head office' } },
      });

      expect(controlActivities.outsourcedActivities.exist).toBe(true);
    });

    it('is outsourced when the description alone is long enough', () => {
      const { controlActivities } = mapControlActivities({
        controlActivities: {
          procedureAnnexITableE7: { procedures: 'A fairly detailed description of the outsourced activity' },
        },
      });

      expect(controlActivities.outsourcedActivities.exist).toBe(true);
    });
  });
});
