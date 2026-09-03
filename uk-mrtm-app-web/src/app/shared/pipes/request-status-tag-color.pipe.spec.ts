import { RequestStatusTagColorPipe } from '@shared/pipes';

describe('RequestStatusTagColorPipe', () => {
  const pipe = new RequestStatusTagColorPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should properly transform requestStatus to color', () => {
    let transformation = pipe.transform(null);
    expect(transformation).toEqual(null);

    transformation = pipe.transform('CANCELLED');
    expect(transformation).toEqual('grey');
    transformation = pipe.transform('CLOSED');
    expect(transformation).toEqual('grey');
    transformation = pipe.transform('EXEMPT');
    expect(transformation).toEqual('grey');

    transformation = pipe.transform('COMPLETED');
    expect(transformation).toEqual('green');
    transformation = pipe.transform('APPROVED');
    expect(transformation).toEqual('green');
    transformation = pipe.transform('ACCEPTED');
    expect(transformation).toEqual('green');

    transformation = pipe.transform('IN_PROGRESS');
    expect(transformation).toEqual('teal');

    transformation = pipe.transform('WITHDRAWN');
    expect(transformation).toEqual('orange');

    transformation = pipe.transform('REJECTED');
    expect(transformation).toEqual('red');

    transformation = pipe.transform('MIGRATED');
    expect(transformation).toEqual('yellow');
  });
});
