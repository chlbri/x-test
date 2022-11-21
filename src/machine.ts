import buildMatches, {
  MatchOptions,
  StateMatching,
} from '@bemedev/x-matches';
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
import { testAssign } from './actions/assign';
import { testSend } from './actions/send';
import { testGuard } from './guard';
import type { ActionKey, GuardKey, LengthOf, TuplifyUnion } from './types';
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
  // #region Types
  type TSV = TResolvedTypesMeta extends TypegenEnabled
    ? Prop<Prop<TResolvedTypesMeta, 'resolved'>, 'matchesStates'>
    : never;

  type MatchesProps = MatchOptions<
    StateMatching<TSV extends StateValue ? TSV : StateValue>
  >[];
  // #endregion
  const _matches = buildMatches(service.getSnapshot().value);

  const matches = (...nodes: MatchesProps) => {
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

  /**
   * Test a sendParent action from the machine
   * @param sender id of the action
   * @returns A tuple of 2 :
   *
   *
   * => A function to run directly inside your test to determine if the action is defined
   *
   * => A function test the sender
   */
  const sendAction = (sender: _ActionKey) => {
    return testSend(machine, sender);
  };

  /**
   * Test a assign action from the machine
   * @param action id of the action
   * @returns A tuple of 2 :
   *
   *
   * => A function to run directly inside your test to determine if the action is defined
   *
   * => A function test the assigner
   */
  const assignAction = (action: _ActionKey) => testAssign(machine, action);

  /**
   * Test a guard from the machine
   * @param guard id of the guard
   * @returns A tuple of 2 :
   *
   *
   * => A function to run directly inside your test to determine if the guard is defined
   *
   * => A function test the guard
   */
  const guard = (guard: _GuardKey) => testGuard(machine, guard);
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
  };
}
