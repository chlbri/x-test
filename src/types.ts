import type {
  AnyStateMachine,
  EventObject,
  InternalMachineOptions,
  MachineOptionsFrom,
  ResolveTypegenMeta,
} from 'xstate';

export type LengthOf<T> = T extends ReadonlyArray<unknown>
  ? T['length']
  : number;

// #region Tuplify Union
// #region Preparation
type _UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
type _LastOf<T> = _UnionToIntersection<
  T extends unknown ? () => T : never
> extends () => infer R
  ? R
  : never;
type _Push<T extends unknown[], V> = [...T, V];
type _TuplifyUnionBoolean<T> = [T] extends [never] ? true : false;
// #endregion

export type TuplifyUnion<T> = true extends _TuplifyUnionBoolean<T>
  ? []
  : _Push<TuplifyUnion<Exclude<T, _LastOf<T>>>, _LastOf<T>>;
// #endregion

export type Action<
  Context extends object = object,
  Events extends EventObject = EventObject,
  T = any,
> = (context?: Context, event?: Events) => T;

export type TestHelper<
  Context extends object = object,
  Events extends EventObject = EventObject,
  T = any,
> = {
  context?: Context;
  event?: Events;
  expected: T;
};

export type Options<
  TContext extends object,
  TEvents extends EventObject = EventObject,
  TResolvedTypesMeta = ResolveTypegenMeta<any, any, any, any>,
> = InternalMachineOptions<TContext, TEvents, TResolvedTypesMeta, true>;

export type ExcludeOptionsKey<T> = Exclude<
  keyof Exclude<T, undefined>,
  symbol | number
>;

export type ServiceKey<T extends AnyStateMachine> = ExcludeOptionsKey<
  MachineOptionsFrom<T>['services']
>;

export type ActionKey<T extends AnyStateMachine> = ExcludeOptionsKey<
  MachineOptionsFrom<T>['actions']
>;

export type GuardKey<T extends AnyStateMachine> = ExcludeOptionsKey<
  MachineOptionsFrom<T>['guards']
>;
