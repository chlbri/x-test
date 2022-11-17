import type {
  LengthOf,
  StateMatching,
  TuplifyUnion,
} from '@bemedev/decompose';
import { expect } from 'vitest';
import {
  BaseActionObject,
  EventObject,
  interpret,
  NoInfer,
  Prop,
  ResolveTypegenMeta,
  ServiceMap,
  StateMachine,
  StateValue,
  TypegenDisabled,
  TypegenEnabled,
  Typestate,
} from 'xstate';
import { testAssign } from './assign';
import { testGuard } from './guard';
import { matches as matchesD, MatchOptions } from './matches';
import { testSendParent } from './sendParent';
import type { ActionKey, GuardKey } from './types';
import { reFunction } from './utils';

export const testMachine = <
  TContext extends object,
  TEvents extends EventObject = EventObject,
  TTypestate extends Typestate<TContext> = {
    value: any;
    context: TContext;
  },
  TAction extends BaseActionObject = BaseActionObject,
  TServiceMap extends ServiceMap = ServiceMap,
  TResolvedTypesMeta = ResolveTypegenMeta<
    TypegenDisabled,
    NoInfer<TEvents>,
    TAction,
    TServiceMap
  >,
>(
  machine: StateMachine<
    TContext,
    any,
    TEvents,
    TTypestate,
    TAction,
    TServiceMap,
    TResolvedTypesMeta
  >,
) => {
  const service = interpret(machine);

  const start = reFunction(service, 'start');
  const stop = reFunction(service, 'stop');

  const context = <T = TContext>(
    expected: T,
    selector?: (context: TContext) => T,
  ) => {
    const innerContext = service.getSnapshot().context;
    const actual = selector ? selector(innerContext) : innerContext;
    expect(actual).toEqual(expected);
  };

  const sender = <T extends TEvents['type']>(type: T) => {
    type E = Required<TEvents> extends { type: T } & infer U
      ? LengthOf<TuplifyUnion<Extract<U, { type: T }>>> extends 0
        ? []
        : [Omit<Extract<TEvents, { type: T }>, 'type'>]
      : never;

    const fn = (...[event]: E) => {
      service.send({ type, ...event } as any);
    };
    return fn;
  };

  // #region Matches
  // #region Types
  type TSV = TResolvedTypesMeta extends TypegenEnabled
    ? Prop<Prop<TResolvedTypesMeta, 'resolved'>, 'matchesStates'>
    : never;

  type MatchesProps = MatchOptions<
    StateMatching<TSV extends StateValue ? TSV : StateValue>
  >[];
  // #endregion

  const _matches = matchesD(service.getSnapshot().value);

  const matches = (...nodes: MatchesProps) => {
    const actual = _matches(...nodes);
    expect(actual).toBe(true);
  };
  // #endregion

  // #region HasTags
  type Tags = (TResolvedTypesMeta extends TypegenEnabled
    ? Prop<Prop<TResolvedTypesMeta, 'resolved'>, 'tags'>
    : string)[];

  const hasTags = (...values: Tags) => {
    const state = service.getSnapshot();
    const actual = values.every(value => state.hasTag(value));
    expect(actual).toBe(true);
  };
  // #endregion

  // #region Hooks
  type _ActionKey = ActionKey<TContext, TEvents, TResolvedTypesMeta>;
  type _GuardKey = GuardKey<TContext, TEvents, TResolvedTypesMeta>;

  const useSendParent = (action: _ActionKey) => {
    return testSendParent(machine, action);
  };
  const useAssign = (action: _ActionKey) => testAssign(machine, action);
  const useGuard = (guard: _GuardKey) => testGuard(machine, guard);
  //TODO: Create useAsync to use machine as promise
  // #endregion

  return {
    sender,
    context,
    matches,
    start,
    send: service.send,
    stop,
    hasTags,
    useSendParent,
    useAssign,
    useGuard,
  };
};
