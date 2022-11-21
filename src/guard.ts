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
import type {
  Action,
  GuardKey,
  OptionalTester,
  TestHelper,
} from './types';
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
  name: GuardKey<typeof machine>,
) => {
  type Guard = Action<TContext, TEvents, boolean>;
  const guard = machine.options.guards?.[name] as Guard;

  const createAcceptance = (...tests: OptionalTester<Guard>[]) => {
    const fn = () => {
      const check = guard !== undefined;
      _expect(check, true, () => `${name} is not accepted`);
      tests.forEach(test => test(guard));
    };
    return fn;
  };

  const createExpect = (
    helper: TestHelper<TContext, TEvents, boolean>,
  ) => {
    const fn = () => {
      const checkAll = isTestHelperDefined(helper);
      if (!checkAll) return;

      const { context, event, expected } = helper;
      const actual = guard(context, event);
      _expect(actual, expected);
    };
    return fn;
  };

  return {
    createAcceptance,
    createExpect,
    guard,
  } as const;
};
