import { MrtmAccountStatus } from '@mrtm/api';

import { AccountStatusPipe } from '@shared/pipes';

describe('AccountStatusPipe', () => {
  const pipe = new AccountStatusPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should properly transform account statuses', () => {
    let transformation = pipe.transform(null);
    expect(transformation).toEqual(null);

    transformation = pipe.transform(undefined);
    expect(transformation).toEqual(null);

    transformation = pipe.transform(MrtmAccountStatus.NEW);
    expect(transformation).toEqual('New');
    transformation = pipe.transform(MrtmAccountStatus.LIVE);
    expect(transformation).toEqual('Live');
    transformation = pipe.transform(MrtmAccountStatus.CLOSED);
    expect(transformation).toEqual('Closed');
  });
});
