import type { Mocked } from 'vitest';

export type MockType<T> = Partial<Mocked<T>>;
