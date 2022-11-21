import buildMatches from '@bemedev/x-matches';
import {
  BaseActionObject,
  EventObject,
  interpret,
  NoInfer,
  Prop,
  ResolveTypegenMeta,
  ServiceMap,
  StateMachine,
  TypegenDisabled,
  TypegenEnabled,
  Typestate,
} from 'xstate';
import { testAssign } from './actions/assign';
import { testSend } from './actions/send';
import { testGuard } from './guard';
import { testPromise } from './invokeds';
import type {
  ActionKey,
  GuardKey,
  LengthOf,
  MatchesProps,
  ServiceKey,
  TuplifyUnion,
} from './types';
import { reFunction, _expect } from './utils';

export default function testMachine<
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
) {
  // @ts-ignore Use the machine without asking to implement all options
  const service = interpret(machine);

  const start = reFunction(service, 'start');
  const stop = reFunction(service, 'stop');

  const context = <T = TContext>(
    expected: T,
    selector?: (context: TContext) => T,
  ) => {
    const innerContext = service.getSnapshot().context;
    const actual = selector ? selector(innerContext) : innerContext;
    _expect(actual, expected);
  };

  const sender = <T extends TEvents['type']>(type: T) => {
    type E = Required<TEvents> extends { type: T } & infer U
      ? LengthOf<TuplifyUnion<Extract<U, { type: T }>>> extends 0
        ? []
        : [Omit<Extract<TEvents, { type: T }>, 'type'>]
      : never;

    // @ts-ignore Ignore for empty tuple
    const fn = (...[event]: E) => {
      // @ts-ignore Ignore for undefined event
      service.send({ type, ...event } as any);
    };
    return fn;
  };

  // #region Matches
  type _MatchesProps = MatchesProps<TResolvedTypesMeta>;
  const _matches = buildMatches(service.getSnapshot().value);

  const matches = (...nodes: _MatchesProps) => {
    const actual = _matches(...nodes);
    _expect(actual, true);
  };
  // #endregion

  // #region HasTags
  type Tags = (TResolvedTypesMeta extends TypegenEnabled
    ? Prop<Prop<TResolvedTypesMeta, 'resolved'>, 'tags'>
    : string)[];

  const hasTags = (...values: Tags) => {
    const state = service.getSnapshot();
    const actual = values.every(value => state.hasTag(value));
    _expect(actual, true);
  };
  // #endregion

  // #region Hooks
  type _ActionKey = ActionKey<typeof machine>;
  type _GuardKey = GuardKey<typeof machine>;
  type _ServiceKey = ServiceKey<typeof machine>;

  const sendAction = (sender: _ActionKey) => {
    return testSend(machine, sender);
  };
  const assignAction = (action: _ActionKey) => testAssign(machine, action);
  const guard = (guard: _GuardKey) => testGuard(machine, guard);
  const promise = (promise: _ServiceKey) => testPromise(machine, promise);
  // #endregion

  return {
    sender,
    context,
    matches,
    start,
    send: service.send,
    stop,
    hasTags,
    sendAction,
    assignAction,
    guard,
    promise,
  };
}
