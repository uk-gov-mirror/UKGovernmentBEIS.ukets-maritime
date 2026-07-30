import { RegulatorLedReasonPipe } from '@shared/pipes/regulator-led-reason.pipe';

describe('RegulatorLedReasonPipe', () => {
  const pipe = new RegulatorLedReasonPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform regulator reason led', () => {
    expect(
      pipe.transform({
        type: 'FOLLOWING_IMPROVING_REPORT',
        summary: 'Following improvement report',
      }),
    ).toEqual('Following an improvement report submitted by the maritime operator');
    expect(
      pipe.transform({
        type: 'FAILED_TO_COMPLY_OR_APPLY',
        summary: 'Failed to comply or apply',
      }),
    ).toEqual(
      'Maritime operator failed to comply with a requirement in the plan, or to apply in accordance with conditions',
    );
    expect(pipe.transform({ type: 'OTHER', reasonOtherSummary: 'test', summary: 'Other' })).toEqual('test');

    expect(pipe.transform(null)).toEqual(null);
  });
});
