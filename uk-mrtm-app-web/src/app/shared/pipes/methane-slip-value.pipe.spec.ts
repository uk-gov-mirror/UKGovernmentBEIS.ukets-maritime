import { MethaneSlipValuePipe } from '@shared/pipes/methane-slip-value.pipe';

describe('MethaneSlipValuePipe', () => {
  let pipe: MethaneSlipValuePipe;

  beforeEach(() => {
    pipe = new MethaneSlipValuePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should display correct values depends on type', () => {
    expect(pipe.transform('12', 'OTHER')).toBe('Other: 12');
    expect(pipe.transform('12', 'PRESELECTED')).toBe('12');
  });
});
