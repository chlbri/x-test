import type {
  BaseActionObject,
  EventObject,
  NoInfer,
  ResolveTypegenMeta,
  ServiceMap,
  StateMachine,
  StateValue,
  TypegenDisabled,
  Typestate,
} from 'xstate';
import type { Action, DelayKey, TestHelper } from './types';
import { _expect } from './utils';

export const testDelay = <
  TContext extends object,
  TEvents extends EventObject = EventObject,
  TTypestate extends Typestate<TContext> = {
    value: StateValue;
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
  name: DelayKey<typeof machine>,
) => {
  type Delay = Action<TContext, TEvents, number>;
  const delay = machine.options.delays?.[name] as Delay | number;

  const acceptance = () => {
    const definedCheck = delay !== undefined;
    const typeCheck =
      typeof delay === 'number' || typeof delay === 'function';
    const check = definedCheck && typeCheck;
    _expect(check, true, () => `${name} is not accepted`);
  };

  const expect = (helper: TestHelper<TContext, TEvents, number>) => {
    const { context, event, expected } = helper;
    if (typeof delay === 'number') {
      _expect(delay, expected);
    } else {
      const actual = delay(context, event);
      _expect(actual, expected);
    }
  };

  return [acceptance, expect, delay] as const;
};
