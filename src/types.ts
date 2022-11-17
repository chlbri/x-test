import type {
  EventObject,
  InternalMachineOptions,
  MachineOptionsFrom,
  ResolveTypegenMeta,
  StateMachine,
} from 'xstate';

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

export type ExcludeOptions<T> = Exclude<
  keyof Exclude<T, undefined>,
  symbol | number
>;

export type ActionKey<
  TContext extends object,
  TEvents extends EventObject = EventObject,
  TResolvedTypesMeta = ResolveTypegenMeta<any, any, any, any>,
> = ExcludeOptions<
  Options<TContext, TEvents, TResolvedTypesMeta>['actions']
>;

export type ActionKeyFromMachine<
  T extends StateMachine<any, any, any, any, any, any, any>,
> = ExcludeOptions<MachineOptionsFrom<T>['actions']>;

export type GuardKey<
  TContext extends object,
  TEvents extends EventObject = EventObject,
  TResolvedTypesMeta = ResolveTypegenMeta<any, any, any, any>,
> = ExcludeOptions<
  Options<TContext, TEvents, TResolvedTypesMeta>['guards']
>;

export type GuardKeyFromMachine<
  T extends StateMachine<any, any, any, any, any, any, any>,
> = ExcludeOptions<MachineOptionsFrom<T>['guards']>;
