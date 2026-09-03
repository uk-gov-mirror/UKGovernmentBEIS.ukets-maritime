import { computed, inject, Injector, runInInjectionContext, Signal, signal, WritableSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { Observable } from 'rxjs';

export type StateSelector<S, SL> = (state: S) => SL;

/**
 * Create selector directly from root state
 *
 * @param projector Mapping function to extract state slice
 */
export function createSelector<S = any, SL = any>(projector: (state: S) => SL): StateSelector<S, SL> {
  return (state) => projector(state);
}

/**
 * Create selector from state slice
 * This is used to create a selector using a previous selector as base
 *
 * @param selector The base selector
 * @param projector Mapping function to extract state slice
 */
export function createDescendingSelector<S = any, IM = any, SL = any>(
  selector: StateSelector<S, IM>,
  projector: (state: IM) => SL,
): StateSelector<S, SL> {
  return (state) => projector(selector(state));
}

/**
 * Create selector from state slice
 * This is used to create a selector using two root-state selectors (different slices of state)
 *
 * @param s1 The first root-state selector
 * @param s2 The second root-state selector
 * @param projector Mapping function to extract aggregate state
 */
export function createAggregateSelector<S = any, IM1 = any, IM2 = any, SL = any>(
  s1: StateSelector<S, IM1>,
  s2: StateSelector<S, IM2>,
  projector: (im1: IM1, im2: IM2) => SL,
): StateSelector<S, SL>;
export function createAggregateSelector<S, IM1 = any, IM2 = any, IM3 = any, SL = any>(
  s1: StateSelector<S, IM1>,
  s2: StateSelector<S, IM2>,
  s3: StateSelector<S, IM3>,
  projector: (im1: IM1, im2: IM2, im3: IM3) => SL,
): StateSelector<S, SL>;
export function createAggregateSelector<S = any, IMs extends any[] = [], SL = any>(
  sn: { [IM in keyof IMs]: StateSelector<S, IMs[IM]> },
  projector: (...ims: IMs) => SL,
): StateSelector<S, SL>;
export function createAggregateSelector<S, SL = any>(...args: any[]): StateSelector<S, SL> {
  const projector = args[args.length - 1];
  const selectors = args.length === 2 && Array.isArray(args[0]) ? args[0] : args.slice(0, args.length - 1);

  return (state) => {
    const selectorParts = selectors.map((s) => s(state));
    return projector(...selectorParts);
  };
}

/**
 * A simple implementation of an application store based on [signals](https://angular.io/guide/signals)
 */
export abstract class SignalStore<T> {
  private readonly injector = inject(Injector);
  private readonly _state: WritableSignal<T>;

  protected constructor(protected readonly initialState: T) {
    this._state = signal(initialState);
  }

  get state(): T {
    return this._state();
  }

  get stateAsSignal(): Signal<T> {
    return this._state.asReadonly();
  }

  setState(state: T) {
    this._state.set(state);
  }

  select<SL = T[keyof T]>(selector: StateSelector<T, SL>): Signal<SL> {
    return computed(() => selector(this._state()));
  }

  rxSelect<SL = T[keyof T]>(selector: StateSelector<T, SL>): Observable<SL> {
    return runInInjectionContext(this.injector, () => toObservable(this.select(selector)));
  }

  reset(): void {
    this.setState(this.initialState);
  }
}
