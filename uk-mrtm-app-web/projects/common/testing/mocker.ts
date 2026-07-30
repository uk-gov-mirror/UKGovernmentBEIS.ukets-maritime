import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { Mocked } from 'vitest';
import { vi } from 'vitest';

import { MockType } from './mock-type';

export function mockClass<T>(someClass: Type<T>): Mocked<T> {
  return Object.getOwnPropertyNames(someClass.prototype)
    .map((property) => [property, vi.fn()] as const)
    .reduce((obj, entry) => ({ ...obj, [entry[0]]: entry[1] }), {} as Mocked<T>);
}

export function injectMock<T>(someClass: Type<T>): MockType<T> {
  return TestBed.inject(someClass) as MockType<T>;
}
