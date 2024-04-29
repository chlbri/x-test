import buildMatches from '@bemedev/x-matches';
import {
  AreAllImplementationsAssumedToBeProvided,
  BaseActionObject,
  EventObject,
  MissingImplementationsError,
  NoInfer,
  Prop,
  ResolveTypegenMeta,
  ServiceMap,
  StateMachine,
  TypegenDisabled,
  TypegenEnabled,
  Typestate,
  interpret as _interpret,
} from 'xstate';
import { SimulatedClock } from 'xstate/es/SimulatedClock';

import type {
  ActionKey,
  DelayKey,
  GuardKey,
  InterpreterOptions,
  MatchesProps,
  PromiseKey,
} from './types';

import { testAction, testAssign, testSend } from './actions';
import { testDelay } from './delay';
import { testGuard } from './guard';
import { sleep } from './helpers';
import { testPromise } from './invokeds';
import { mockMachine } from './mock';
import { _expect, reFunction } from './utils';

export function interpret<
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
  machine: AreAllImplementationsAssumedToBeProvided<TResolvedTypesMeta> extends true
    ? StateMachine<
        TContext,
        any,
        TEvents,
        TTypestate,
        any,
        any,
        TResolvedTypesMeta
      >
    : MissingImplementationsError<TResolvedTypesMeta>,
  options: InterpreterOptions = { simulateClock: true },
) {
  type Machine = StateMachine<
    TContext,
    any,
    TEvents,
    TTypestate,
    any,
    any,
    TResolvedTypesMeta
  >;

  type ImplMachine =
    AreAllImplementationsAssumedToBeProvided<TResolvedTypesMeta> extends true
      ? Machine
      : MissingImplementationsError<TResolvedTypesMeta>;

  const { simulateClock, ..._options } = options;
  const __machine = mockMachine(machine as Machine, {
    context: (machine as Machine).context,
    options: (machine as any).options,
  }) as unknown as ImplMachine;

  const startWithClock = () => {
    if (simulateClock) {
      const clock = new SimulatedClock();
      const service = _interpret(__machine, { clock, ..._options });
      return service;
    }
    const service = _interpret(__machine, { ..._options });
    return service;
  };

  const service = startWithClock();

  const start = reFunction(service, 'start');
  const stop = reFunction(service, 'stop');
  const send = reFunction(service, 'send');
  const getSnapshot = reFunction(service, 'getSnapshot');

  const advanceTime = async (ms = 0) => {
    if (simulateClock) {
      await Promise.resolve();
      return (service.clock as SimulatedClock).increment(ms);
    }
    return sleep(ms);
  };

  const context = <T = TContext>(
    expected: T,
    selector?: (context: TContext) => T,
  ) => {
    const innerContext = getSnapshot().context;
    const actual = selector ? selector(innerContext) : innerContext;
    _expect(actual, expected);
  };

  const sender = <T extends TEvents['type']>(type: T) => {
    type E = TEvents extends {
      type: T;
    } & infer U
      ? // eslint-disable-next-line @typescript-eslint/ban-types
        U extends {}
        ? Omit<U, 'type'>
        : never
      : never;

    const fn = (...data: E extends never ? [] : [event: E]) => {
      // @ts-ignore Ignore for undefined event
      send({ type, ...data?.[0] } as any);
    };
    return fn;
  };

  // #region Matches
  type _MatchesProps = MatchesProps<TResolvedTypesMeta>;

  const matches = (...nodes: _MatchesProps) => {
    const value = getSnapshot().value;
    const _matches = buildMatches(value);
    const actual = _matches(...nodes);
    _expect(actual, true);
  };
  // #endregion

  // #region HasTags
  type Tags = (TResolvedTypesMeta extends TypegenEnabled
    ? Prop<Prop<TResolvedTypesMeta, 'resolved'>, 'tags'>
    : string)[];

  const hasTags = (...values: Tags) => {
    const state = getSnapshot();
    const actual = values.every(value => state.hasTag(value));
    _expect(actual, true);
  };
  // #endregion

  const __status = () => service.status;

  // #region Hooks
  type _GuardKey = GuardKey<Machine>;
  type _ServiceKey = PromiseKey<Machine>;
  type _DelayKey = DelayKey<Machine>;

  // #region Action
  type _ActionKey = ActionKey<Machine>;
  type ActionParams = Omit<
    Parameters<typeof testAction>[0],
    'machine' | 'action'
  > & {
    action: _ActionKey;
  };
  const action = (rest: ActionParams) =>
    testAction({ machine: machine as Machine, ...rest });
  const sendAction = (sender: _ActionKey) => {
    return testSend(machine as Machine, sender);
  };
  const assign = (action: _ActionKey) =>
    testAssign(machine as Machine, action);
  // #endregion

  const delay = (delay: _DelayKey) => testDelay(machine as Machine, delay);
  const guard = (guard: _GuardKey) => testGuard(machine as Machine, guard);
  const promise = (promise: _ServiceKey) =>
    testPromise(machine as Machine, promise);
  // #endregion

  const out = {
    sender,
    context,
    matches,
    start,
    send,
    stop,
    hasTags,
    advanceTime,
    getSnapshot,
    action,
    sendAction,
    assign,
    delay,
    guard,
    promise,
    __status,
  } as const;

  return out;
}
