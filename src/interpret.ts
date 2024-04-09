import buildMatches from '@bemedev/x-matches';
import {
  BaseActionObject,
  EventObject,
  InterpreterStatus,
  NoInfer,
  Prop,
  ResolveTypegenMeta,
  ServiceMap,
  StateMachine,
  TypegenDisabled,
  TypegenEnabled,
  Typestate,
  interpret as _interpret,
  createMachine,
} from 'xstate';
import { SimulatedClock } from 'xstate/lib/SimulatedClock';

import { testAction, testAssign, testSend } from './actions';
import { testDelay } from './delay';
import { testGuard } from './guard';
import { testPromise } from './invokeds';

import type {
  ActionKey,
  DelayKey,
  GuardKey,
  MatchesProps,
  ServiceKey,
} from './types';

import { ALWAYS_TIME } from './constants';
import {
  _expect,
  reFunction,
  transformAlwaysToAfter,
  transformParentEventsToLocal,
} from './utils';

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
  type Machine = typeof machine;
  type _ActionKey = ActionKey<Machine>;

  // #region Preparation
  const config = transformAlwaysToAfter(machine.config);
  const [options, parentEvents] = transformParentEventsToLocal(
    machine.options,
  );
  const _machine = createMachine(config, options).withContext(
    machine.context,
  ) as unknown as Machine;

  const clock = new SimulatedClock();

  // @ts-ignore Use the machine without asking to implement all options
  const service = _interpret(_machine, { clock });
  // #endregion

  // #region Functions
  const start = reFunction(service, 'start');

  const getSnapshot = reFunction(service, 'getSnapshot');

  const clear = () => {
    parentEvents.length = 0;
  };

  const advanceTime = async (ms: number) => {
    await Promise.resolve();
    return clock.increment(ms);
  };

  const advanceAlways = () => advanceTime(ALWAYS_TIME);

  const stop = () => {
    clear();
    if (service.status === InterpreterStatus.Running) service.stop();
  };

  const send = reFunction(service, 'send');

  const context = <T = TContext>(
    expected: T,
    selector?: (context: TContext) => T,
  ) => {
    const innerContext = service.getSnapshot().context;
    const actual = selector ? selector(innerContext) : innerContext;
    _expect(actual, expected);
  };

  const parentSend = (send: _ActionKey) => {
    const check = parentEvents.includes(send);
    _expect(check, true);
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
      service.send({ type, ...data?.[0] } as any);
    };
    return fn;
  };
  // #endregion

  // #region Matches
  type _MatchesProps = MatchesProps<TResolvedTypesMeta>;

  const matches = (...nodes: _MatchesProps) => {
    const value = service.getSnapshot().value;
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
    const state = service.getSnapshot();
    const actual = values.every(value => state.hasTag(value));
    _expect(actual, true);
  };
  // #endregion

  // #region Hooks

  type _GuardKey = GuardKey<Machine>;
  type _ServiceKey = ServiceKey<Machine>;
  type _DelayKey = DelayKey<Machine>;

  // #region Action
  type ActionParams = Omit<
    Parameters<typeof testAction>[0],
    'machine' | 'action'
  > & {
    action: _ActionKey;
  };
  const action = (rest: ActionParams) => testAction({ machine, ...rest });
  // #endregion
  const sendAction = (sender: _ActionKey) => {
    return testSend(machine, sender);
  };
  const assign = (action: _ActionKey) => testAssign(machine, action);

  const delay = (delay: _DelayKey) => testDelay(machine, delay);
  const guard = (guard: _GuardKey) => testGuard(machine, guard);
  const promise = (promise: _ServiceKey) => testPromise(machine, promise);
  const __status = () => service.status;
  // #endregion

  return {
    sender,
    context,
    matches,
    start,
    send,
    stop,
    clear,
    hasTags,
    action,
    assign,
    sendAction,
    guard,
    promise,
    delay,
    parentSend,
    advanceTime,
    advanceAlways,
    getSnapshot,
    __status,
  };
}
