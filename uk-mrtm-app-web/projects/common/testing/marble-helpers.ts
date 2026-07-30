import { TestScheduler } from 'rxjs/testing';
import { expect } from 'vitest';

export const testSchedulerFactory = () => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
