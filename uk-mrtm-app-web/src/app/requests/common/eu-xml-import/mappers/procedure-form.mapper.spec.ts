import { mapProcedureForm } from '@requests/common/eu-xml-import/mappers/procedure-form.mapper';
import { XmlValidationError } from '@shared/types';

describe('mapProcedureForm', () => {
  it('maps every field, including version and IT system, when present', () => {
    const warnings: XmlValidationError[] = [];

    const result = mapProcedureForm(
      {
        referenceExistingProcedure: 'REF-1',
        versionExistingProcedure: '2.0',
        procedures: 'Do the thing',
        responsiblePerson: 'Jane Doe',
        locationOfRecords: 'Head office',
        itSystem: 'ERP',
      },
      'context',
      warnings,
    );

    expect(result).toEqual({
      reference: 'REF-1',
      version: '2.0',
      description: 'Do the thing',
      responsiblePersonOrPosition: 'Jane Doe',
      recordsLocation: 'Head office',
      itSystemUsed: 'ERP',
    });
    expect(warnings).toEqual([]);
  });

  it('falls back through referenceForProcedure for the reference, but not titleOfProcedure', () => {
    expect(mapProcedureForm({ referenceForProcedure: 'REF-2', procedures: 'x' }, 'context', []).reference).toBe(
      'REF-2',
    );

    const warnings: XmlValidationError[] = [];
    const result = mapProcedureForm({ titleOfProcedure: 'REF-3', procedures: 'x' }, 'context', warnings);
    expect(result.reference).toBeUndefined();
    expect(warnings.some((w) => w.message.includes('procedure reference is missing'))).toBe(true);
  });

  it('leaves version and itSystemUsed undefined when not provided', () => {
    const result = mapProcedureForm({ referenceExistingProcedure: 'REF-1', procedures: 'x' }, 'context', []);

    expect(result.version).toBeUndefined();
    expect(result.itSystemUsed).toBeUndefined();
  });

  it('warns when the reference, description, responsible person and records location are missing, given an undefined node', () => {
    const warnings: XmlValidationError[] = [];

    const result = mapProcedureForm(undefined, 'context', warnings);

    expect(result.reference).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.responsiblePersonOrPosition).toBeUndefined();
    expect(result.recordsLocation).toBeUndefined();
    expect(warnings.some((w) => w.message.includes('procedure reference is missing'))).toBe(true);
    expect(warnings.some((w) => w.message.includes('procedure description is missing'))).toBe(true);
    expect(warnings.some((w) => w.message.includes('responsible person or position is missing'))).toBe(true);
    expect(warnings.some((w) => w.message.includes('location of records is missing'))).toBe(true);
  });

  it('drops overly long field values instead of truncating them', () => {
    const tooLong = 'X'.repeat(300);
    const tooLongDescription = 'Y'.repeat(20000);

    const result = mapProcedureForm(
      {
        referenceExistingProcedure: tooLong,
        versionExistingProcedure: tooLong,
        procedures: tooLongDescription,
        responsiblePerson: tooLong,
        locationOfRecords: tooLong,
        itSystem: tooLong,
      },
      'context',
      [],
    );

    expect(result.reference).toBeUndefined();
    expect(result.version).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.responsiblePersonOrPosition).toBeUndefined();
    expect(result.recordsLocation).toBeUndefined();
    expect(result.itSystemUsed).toBeUndefined();
  });
});
