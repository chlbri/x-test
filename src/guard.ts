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
import type { Action, GuardKey, TestHelper } from './types';
import { isTestHelperDefined, _expect } from './utils';

export const testGuard = <
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
  name: GuardKey<TContext, TEvents, TResolvedTypesMeta>,
) => {
  const guard = machine.options.guards?.[name] as Action<
    TContext,
    TEvents,
    boolean
  >;

  const acceptance = () => {
    const definedCheck = guard !== undefined && guard !== null;
    const typeCheck = typeof guard === 'function';
    const check = definedCheck && typeCheck;
    if (!check) {
      const json = JSON.stringify(guard, null, 2);
      const error = new Error(`${json} is not accepted`);
      throw error;
    }
  };

  const testExpect = (helper: TestHelper<TContext, TEvents, boolean>) => {
    const checkAll = isTestHelperDefined(helper);
    if (!checkAll) return;

    const { context, event, expected } = helper;
    const actual = guard(context, event);
    _expect(actual, expected);
  };

  return [acceptance, testExpect] as const;
};
