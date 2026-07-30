import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import { BusinessError, BusinessErrorService } from '@netz/common/error';

import { expect } from 'vitest';

export const expectBusinessErrorToBe = async (error: BusinessError) => {
  return expect(firstValueFrom(TestBed.inject(BusinessErrorService).error$)).resolves.toEqual(error);
};

@Component({
  selector: 'netz-business-error',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessErrorStubComponent {}
